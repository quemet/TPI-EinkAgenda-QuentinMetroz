import requests
from type import Login, Family, Agenda, Event, User

class APIError(Exception):
    def __init__(self, message: str, status_code: int = None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message

class APIClient:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url
        self.token = None
    
    def login(self, email: str, password: str) -> User:
        response = requests.post(f"{self.base_url}/api/auth/login", json={"email": email, "password": password})
        if response.status_code == 200:
            login = Login(response.json())
            self.token = login.token
            return login.user
        else:
            raise APIError(f"Login failed: {response.text}", status_code=response.status_code)
        
    def fetch_families(self, base_url: str, token: str):
        response = requests.get(f"{base_url}/api/families", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            return [Family(data) for data in response.json()]
        else:
            raise APIError(f"Failed to fetch families: {response.text}", status_code=response.status_code)

    def fetch_all_agendas(self, base_url: str, token: str, family_id: str):
        response = requests.get(f"{base_url}/api/agendas/{family_id}", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            return [Agenda(data) for data in response.json()]
        else:
            raise APIError(f"Failed to fetch agendas: {response.text}", status_code=response.status_code)
        
    def fetch_all_events(self, base_url: str, token: str, agenda_id: str):
        response = requests.get(f"{base_url}/api/events/agenda/{agenda_id}/events", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            return [Event(data) for data in response.json()]
        else:
            raise APIError(f"Failed to fetch events: {response.text}", status_code=response.status_code)