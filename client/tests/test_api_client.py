import sys
import os
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api_client import APIClient, APIError


def make_response(status_code: int, json_data):
    mock = MagicMock()
    mock.status_code = status_code
    mock.json.return_value = json_data
    mock.text = str(json_data)
    return mock


USER_DATA = { 
    "id": "u1", 
    "username": "Bob", 
    "email": "bob@gmail.com", 
    "role": "user", 
    "personType": "young", 
    "createdAt": "2024-01-01", 
    "updatedAt": "2024-01-01"
}

LOGIN_DATA = { 
    "token": "tok123", 
    "user": USER_DATA
}

FAMILY_DATA = [
    {
        "id": "f1", 
        "name": "John's Family", 
        "createdAt": "2024-01-01", 
        "updatedAt": "2024-01-01"
    }
]

AGENDA_DATA = [
    {
        "id": "ag1", 
        "name": "Agenda de Toto", 
        "familyId": "f1", 
        "appertainTo": "u1", 
        "createdAt": "2024-01-01", 
        "updatedAt": "2024-01-01"
    }
]

EVENT_DATA = [
    {
        "id": "e1", 
        "name": "Course", 
        "description": "Course", 
        "type": "course", 
        "startDatetime": "2024-06-01T09:00:00.000Z", 
        "endDatetime": "2024-06-01T10:00:00.000Z", 
        "agendaId": "ag1", 
        "createdAt": "2024-01-01", 
        "updatedAt": "2024-01-01"
    }
]


class TestAPIClientLogin(unittest.TestCase):
    def setUp(self):
        self.client = APIClient("http://localhost:3000")

    @patch("api_client.requests.post")
    def test_login_success(self, mock_post):
        mock_post.return_value = make_response(200, LOGIN_DATA)

        user = self.client.login("bob@gmail.com", "pass")

        self.assertEqual(self.client.token, "tok123")
        self.assertEqual(user.id, "u1")
        self.assertEqual(user.username, "Bob")

    @patch("api_client.requests.post")
    def test_login_failure_raises(self, mock_post):
        mock_post.return_value = make_response(401, {"error": "Unauthorized"})

        with self.assertRaises(APIError) as ctx:
            self.client.login("bad@a.com", "wrong")

        self.assertEqual(ctx.exception.status_code, 401)


class TestAPIClientFamilies(unittest.TestCase):
    def setUp(self):
        self.client = APIClient("http://localhost:3000")
        self.client.token = "tok123"

    @patch("api_client.requests.get")
    def test_fetch_families_success(self, mock_get):
        mock_get.return_value = make_response(200, FAMILY_DATA)

        families = self.client.fetch_families("http://localhost:3000", self.client.token)

        self.assertEqual(len(families), 1)
        self.assertEqual(families[0].id, "f1")

    @patch("api_client.requests.get")
    def test_fetch_families_failure_raises(self, mock_get):
        mock_get.return_value = make_response(403, {"error": "Forbidden"})

        with self.assertRaises(APIError) as ctx:
            self.client.fetch_families("http://localhost:3000", self.client.token)

        self.assertEqual(ctx.exception.status_code, 403)


class TestAPIClientAgendas(unittest.TestCase):
    def setUp(self):
        self.client = APIClient("http://localhost:3000")
        self.client.token = "tok123"

    @patch("api_client.requests.get")
    def test_fetch_agendas_success(self, mock_get):
        mock_get.return_value = make_response(200, AGENDA_DATA)

        agendas = self.client.fetch_all_agendas("http://localhost:3000", self.client.token, "f1")

        self.assertEqual(len(agendas), 1)
        self.assertEqual(agendas[0].appertain_to, "u1")

    @patch("api_client.requests.get")
    def test_fetch_agendas_failure_raises(self, mock_get):
        mock_get.return_value = make_response(404, {"error": "Not found"})

        with self.assertRaises(APIError):
            self.client.fetch_all_agendas("http://localhost:3000", self.client.token, "f1")


class TestAPIClientEvents(unittest.TestCase):
    def setUp(self):
        self.client = APIClient("http://localhost:3000")
        self.client.token = "tok123"

    @patch("api_client.requests.get")
    def test_fetch_events_success(self, mock_get):
        mock_get.return_value = make_response(200, EVENT_DATA)

        events = self.client.fetch_all_events("http://localhost:3000", self.client.token, "ag1")

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0].id, "e1")
        self.assertEqual(events[0].name, "Course")

    @patch("api_client.requests.get")
    def test_fetch_events_empty(self, mock_get):
        mock_get.return_value = make_response(200, [])

        events = self.client.fetch_all_events("http://localhost:3000", self.client.token, "ag1")

        self.assertEqual(events, [])

    @patch("api_client.requests.get")
    def test_fetch_events_failure_raises(self, mock_get):
        mock_get.return_value = make_response(500, {"error": "Server error"})

        with self.assertRaises(APIError) as ctx:
            self.client.fetch_all_events("http://localhost:3000", self.client.token, "ag1")

        self.assertEqual(ctx.exception.status_code, 500)


if __name__ == "__main__":
    unittest.main()
