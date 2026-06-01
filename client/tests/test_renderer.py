import sys
import os
import unittest
from unittest.mock import patch
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from renderer import _get_event_config, _group_by_date, create_image
from type import Event


EVENT_TYPES = [
    {
        "name": "Médecin",    
        "file": "../assets/medecin.png",
        "color": "red"
    },
    {
        "name": "Visite",     
        "file": "../assets/visite.png",     
        "color": "yellow"
    },
    {
        "name": "Course",     
        "file": "../assets/caddie.png",     
        "color": "green"
    },
    {
        "name": "Médicament", 
        "file": "../assets/medicament.png", 
        "color": "blue"
    },
]


def make_event(id: str, start: str, type: str = "Course", description: str = "") -> Event:
    return Event({
        "id": id,
        "name": "Test Event",
        "description": description,
        "type": type,
        "startDatetime": start,
        "endDatetime": start,
        "agendaId": "ag1",
        "createdAt": "2024-01-01",
        "updatedAt": "2024-01-01",
    })


class TestGetEventConfig(unittest.TestCase):
    def test_returns_config_for_known_type(self):
        config = _get_event_config("Médecin", EVENT_TYPES)
        self.assertIsNotNone(config)
        self.assertEqual(config["color"], "red")

    def test_matching_is_case_insensitive(self):
        config = _get_event_config("médecin", EVENT_TYPES)
        self.assertIsNotNone(config)
        self.assertEqual(config["name"], "Médecin")

    def test_returns_none_for_unknown_type(self):
        config = _get_event_config("Unknown", EVENT_TYPES)
        self.assertIsNone(config)

    def test_returns_none_when_type_is_none(self):
        config = _get_event_config(None, EVENT_TYPES)
        self.assertIsNone(config)

    def test_returns_none_for_empty_string(self):
        config = _get_event_config("", EVENT_TYPES)
        self.assertIsNone(config)


class TestGroupByDate(unittest.TestCase):
    def test_single_event_grouped_correctly(self):
        event = make_event("e1", "2024-06-01T09:00:00.000Z")
        grouped = _group_by_date([event])
        self.assertIn("2024-06-01", grouped)
        self.assertEqual(len(grouped["2024-06-01"]), 1)

    def test_multiple_events_same_day(self):
        e1 = make_event("e1", "2024-06-01T09:00:00.000Z")
        e2 = make_event("e2", "2024-06-01T14:00:00.000Z")
        grouped = _group_by_date([e1, e2])
        self.assertEqual(len(grouped["2024-06-01"]), 2)

    def test_events_on_different_days(self):
        e1 = make_event("e1", "2024-06-01T09:00:00.000Z")
        e2 = make_event("e2", "2024-06-02T09:00:00.000Z")
        grouped = _group_by_date([e1, e2])
        self.assertIn("2024-06-01", grouped)
        self.assertIn("2024-06-02", grouped)

    def test_empty_list_returns_empty_dict(self):
        grouped = _group_by_date([])
        self.assertEqual(grouped, {})

    def test_invalid_datetime_is_skipped(self):
        event = make_event("e1", "not-a-date")
        grouped = _group_by_date([event])
        self.assertEqual(grouped, {})


class TestCreateImage(unittest.TestCase):
    def test_returns_pil_image(self, *_):
        img = create_image(800, 480, [], [])
        self.assertIsInstance(img, Image.Image)

    def test_image_has_correct_dimensions(self, *_):
        img = create_image(800, 480, [], [])
        self.assertEqual(img.size, (800, 480))

    def test_with_daily_events(self, *_):
        event = make_event("e1", "2024-06-01T09:00:00.000Z", type="Course", description="Supermarché")
        img = create_image(800, 480, [event], [])
        self.assertIsInstance(img, Image.Image)

    def test_with_weekly_events(self, *_):
        event = make_event("e1", "2024-06-03T10:00:00.000Z", type="Visite")
        img = create_image(800, 480, [], [event])
        self.assertIsInstance(img, Image.Image)

    def test_with_unknown_event_type(self, *_):
        event = make_event("e1", "2024-06-01T09:00:00.000Z", type="Unknown")
        img = create_image(800, 480, [event], [])
        self.assertIsInstance(img, Image.Image)


if __name__ == "__main__":
    unittest.main()
