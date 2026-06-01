from type import Event
import os
import json
import datetime
from PIL import Image, ImageDraw, ImageFont

# Pillow 10+ moved LANCZOS into Image.Resampling
_RESAMPLE = getattr(Image, "Resampling", Image).LANCZOS

months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
weekdays_short = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")


_FONT_LINUX: dict[str, list[str]] = {
    "arialbd.ttf": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ],
    "arial.ttf": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ],
}


def _load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    candidates = _FONT_LINUX.get(name, []) + [name]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default(size)


def _load_event_types() -> list[dict]:
    with open(os.path.join(ASSETS_DIR, "setup.json"), encoding="utf-8") as f:
        return json.load(f)


def _get_event_config(event_type: str, event_types: list[dict]) -> dict | None:
    if not event_type:
        return None
    for et in event_types:
        if et["name"].lower() == event_type.lower():
            return et
    return None


def _paste_icon(img: Image.Image, asset_path: str, x: int, y: int, size: int) -> bool:
    try:
        icon = Image.open(asset_path).convert("RGBA")
        icon = icon.resize((size, size), _RESAMPLE)
        img.paste(icon, (x, y), icon.split()[3])
        return True
    except Exception:
        return False


def _group_by_date(events: list[Event]) -> dict[str, list[Event]]:
    grouped: dict[str, list[Event]] = {}
    for ev in events:
        try:
            date_str = datetime.datetime.strptime(ev.startDatetime, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%Y-%m-%d")
            grouped.setdefault(date_str, []).append(ev)
        except Exception:
            pass
    return grouped


def create_image(width: int, height: int, daily_events: list[Event], weekly_events: list[Event]) -> Image.Image:
    now = datetime.datetime.now()
    day_num = now.day
    month_str = months[now.month - 1]
    weekday_str = weekdays[now.weekday()]

    event_types = _load_event_types()
    weekly_by_date = _group_by_date(weekly_events)

    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    font_lg   = _load_font("arialbd.ttf", 36)
    font_md   = _load_font("arialbd.ttf", 24)
    font_sm   = _load_font("arial.ttf",   20)
    font_time = _load_font("arialbd.ttf", 20)

    DAILY_W      = int(width * 0.58)
    WEEKLY_X     = DAILY_W + 1
    WEEKLY_W     = width - WEEKLY_X
    HEADER_H     = 80
    DATE_BAR_H   = 50
    LEGEND_H     = 60
    ICON_SIZE    = 48
    BADGE_W      = 80
    BADGE_H      = 30
    DAYS         = 6 # Remove today from the weekly view

    draw.rectangle([(0, 0), (DAILY_W, HEADER_H)], fill="black")
    draw.text((DAILY_W // 2, HEADER_H // 2), "Aujourd'hui", font=font_lg, fill="white", anchor="mm")

    draw.rectangle([(WEEKLY_X, 0), (width, HEADER_H)], fill="red")
    draw.text((WEEKLY_X + WEEKLY_W // 2, HEADER_H // 2), "La semaine", font=font_lg, fill="white", anchor="mm")

    # Date bar
    draw.rectangle([(15, HEADER_H + 8), (DAILY_W - 15, HEADER_H + 8 + DATE_BAR_H)], fill="black")
    draw.text(
        (DAILY_W // 2, HEADER_H + 8 + DATE_BAR_H // 2),
        f"{weekday_str} {day_num} {month_str}",
        font=font_md, fill="white", anchor="mm",
    )

    # Vertical divider
    draw.line([(DAILY_W, 0), (DAILY_W, height - LEGEND_H)], fill="black", width=2)

    # ── Daily events ─────────────────────────────────────────────────────────
    EVENT_TOP = HEADER_H + 8 + DATE_BAR_H + 10
    EVENT_BOT = height - LEGEND_H
    row_h = min((EVENT_BOT - EVENT_TOP) // max(len(daily_events), 1), 110)
    PAD = 15

    for i, event in enumerate(daily_events):
        try:
            event_time = datetime.datetime.strptime(event.startDatetime, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%H:%M")
        except Exception:
            event_time = "--:--"

        config  = _get_event_config(event.type, event_types)
        row_top = EVENT_TOP + i * row_h
        icon_y  = row_top + (row_h - ICON_SIZE) // 2

        if config:
            color = config["color"]

            # Asset icon
            asset_path = os.path.join(ASSETS_DIR, config["file"])
            if not _paste_icon(img, asset_path, PAD, icon_y, ICON_SIZE):
                draw.rectangle([(PAD, icon_y), (PAD + ICON_SIZE, icon_y + ICON_SIZE)], fill=color)

            # Colored time badge
            bx = PAD + ICON_SIZE + 10
            by = row_top + (row_h - BADGE_H) // 2
            draw.rounded_rectangle([(bx, by), (bx + BADGE_W, by + BADGE_H)], radius=8, fill=color)
            draw.text((bx + BADGE_W // 2, by + BADGE_H // 2), event_time, font=font_time, fill="white", anchor="mm")

            tx = bx + BADGE_W + 12
        else:
            # Black rectangle with time
            draw.rectangle([(PAD, icon_y), (PAD + BADGE_W, icon_y + BADGE_H + 6)], fill="black")
            draw.text((PAD + BADGE_W // 2, icon_y + (BADGE_H + 6) // 2), event_time, font=font_time, fill="white", anchor="mm")
            tx = PAD + BADGE_W + 12

        if event.description:
            draw.text((tx, row_top + 38), event.description, font=font_sm, fill="black")

        # Separator
        draw.line([(PAD, row_top + row_h - 2), (DAILY_W - PAD, row_top + row_h - 2)], fill="black", width=1)

    # ── Weekly grid ───────────────────────────────────────────────────────────
    COL_W      = WEEKLY_W // DAYS
    DAY_HDR_H  = 38
    CELL       = 42

    # Day-abbreviation headers + vertical separators
    for i in range(DAYS):
        future = now + datetime.timedelta(days=i + 1)
        abbr = weekdays_short[future.weekday()]
        cx = WEEKLY_X + i * COL_W + COL_W // 2
        draw.text((cx, HEADER_H + DAY_HDR_H // 2), abbr, font=font_md, fill="black", anchor="mm")
        if i > 0:
            draw.line(
                [(WEEKLY_X + i * COL_W, HEADER_H), (WEEKLY_X + i * COL_W, height - LEGEND_H)],
                fill="black", width=1,
            )

    draw.line([(WEEKLY_X, HEADER_H + DAY_HDR_H), (width, HEADER_H + DAY_HDR_H)], fill="black", width=2)

    # Event cells: first letter of type
    for i in range(DAYS):
        future   = now + datetime.timedelta(days=i + 1)
        date_key = future.strftime("%Y-%m-%d")
        col_x    = WEEKLY_X + i * COL_W
        cell_y   = HEADER_H + DAY_HDR_H + 8

        daily_events = weekly_by_date.get(date_key, [])
        daily_events.sort(key=lambda ev: ev.startDatetime)

        for ev in daily_events:
            config = _get_event_config(ev.type, event_types)
            letter = (ev.type[0] if ev.type else "?").upper()
            color  = config["color"] if config else "black"

            if config["file"]:
                asset_path = os.path.join(ASSETS_DIR, config["file"])
                if _paste_icon(img, asset_path, col_x + 4, cell_y, CELL):
                    cell_y += CELL + 6
                    continue
            else:
                draw.rounded_rectangle(
                    [(col_x + 4, cell_y), (col_x + 4 + CELL, cell_y + CELL)],
                    radius=10, fill=color,
                )
                draw.text(
                    (col_x + 4 + CELL // 2, cell_y + CELL // 2),
                    letter, font=font_md, fill="white", anchor="mm",
                )
                cell_y += CELL + 6

    # ── Legend ────────────────────────────────────────────────────────────────
    leg_top  = height - LEGEND_H
    leg_icon = 36
    draw.rectangle([(0, leg_top), (width, height)], fill="white")
    draw.line([(0, leg_top), (width, leg_top)], fill="black", width=2)
    lx = 10

    for et in event_types:
        asset_path = os.path.join(ASSETS_DIR, et["file"])
        if not _paste_icon(img, asset_path, lx, leg_top + (LEGEND_H - leg_icon) // 2, leg_icon):
            draw.rectangle([(lx, leg_top + 12), (lx + leg_icon, leg_top + 12 + leg_icon)], fill=et["color"])
        lx += leg_icon + 6
        draw.text((lx, leg_top + LEGEND_H // 2), et["name"], font=font_sm, fill="black", anchor="lm")
        bbox = draw.textbbox((0, 0), et["name"], font=font_sm)
        lx += (bbox[2] - bbox[0]) + 20

    img.save("output.png")
    return img
