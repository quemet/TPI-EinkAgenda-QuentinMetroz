import os
import time
import datetime
from dotenv import load_dotenv
from api_client import APIClient
from type import Family, Agenda, Event, User
from renderer import create_image

load_dotenv()

api_base_url = os.getenv("API_BASE_URL")
user_email = os.getenv("USER_EMAIL")
user_password = os.getenv("USER_PASSWORD")
time_between_requests = int(os.getenv("TIME_BETWEEN_REQUEST"))
last_request_events = []

client = APIClient(api_base_url)

try:
    user: User = client.login(user_email, user_password)
    families : list[Family] = client.fetch_families(api_base_url, client.token)
    agendas : list[Agenda] = client.fetch_all_agendas(api_base_url, client.token, families[0].id)
    user_agenda = next((agenda for agenda in agendas if agenda.appertain_to == user.id), None)
    
    while True:
        if user_agenda:
            events : list[Event] = client.fetch_all_events(api_base_url, client.token, user_agenda.id)

            if events != last_request_events:
                today = datetime.datetime.now()
                today_str = today.strftime("%Y-%m-%d")
                weekday = datetime.datetime.weekday(today)
                start_of_week = today - datetime.timedelta(days=weekday)
                dates = [(start_of_week + datetime.timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
                dates.remove(today_str)

                daily_events = [event for event in events if datetime.datetime.strptime(event.startDatetime, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%Y-%m-%d") == today_str]
                weekly_events = [event for event in events if datetime.datetime.strptime(event.startDatetime, "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%Y-%m-%d") in dates]
        
                image = create_image(800, 480, daily_events, weekly_events)

                try:
                    from waveshare_epd import epd7in3e
                    epd = epd7in3e.EPD()
                    epd.init()
                    epd.Clear()
                    epd.display(epd.getbuffer(image))
                    epd.sleep()
                except ImportError:
                    print("Waveshare library not found. Image couldn't be displayed.")
                
                last_request_events = events
            else:
                print("No new events found.")
        else:
            print(f"No agenda found for user {user.username}.")

        time.sleep(time_between_requests)
except Exception as e:
    print(f"An error occurred: {e}")
