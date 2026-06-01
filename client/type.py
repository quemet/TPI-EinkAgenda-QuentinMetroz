from abc import ABC

class Family(ABC):
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.name = data.get("name")
        self.created_at = data.get("createdAt")
        self.updated_at = data.get("updatedAt")

class Agenda(ABC):
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.name = data.get("name")
        self.family_id = data.get("familyId")
        self.appertain_to = data.get("appertainTo")
        self.created_at = data.get("createdAt")
        self.updated_at = data.get("updatedAt")

class Event(ABC):
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.name = data.get("name")
        self.description = data.get("description")
        self.type = data.get("type")
        self.startDatetime = data.get("startDatetime")
        self.endDatetime = data.get("endDatetime")
        self.agenda_id = data.get("agendaId")
        self.created_at = data.get("createdAt")
        self.updated_at = data.get("updatedAt")

    def __eq__(self, other) -> bool:
        return self.id == other.id and self.updated_at == other.updated_at

class User(ABC):
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.username = data.get("username")
        self.email = data.get("email")
        self.role = data.get("role")
        self.personType = data.get("personType")
        self.created_at = data.get("createdAt")
        self.updated_at = data.get("updatedAt")

class Login(ABC):
    def __init__(self, data: dict):
        self.token = data.get("token")
        self.user = User(data.get("user"))
