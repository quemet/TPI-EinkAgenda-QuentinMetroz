POST /api/auth/register
POST /api/auth/login

GET /api/users/me
PUT /api/users/me
DELETE /api/users/me

GET /api/families/
GET /api/families/:familyId
POST /api/families/
POST /api/families/:familyId/users
POST /api/families/:familyId/admins
PUT /api/families/:familyId
DELETE /api/families/:familyId
DELETE /api/families/:familyId/users

GET /api/agendas/:familyId
GET /api/agendas/:familyId/:id
POST /api/agendas/:familyId
PUT /api/agendas/:id
DELETE /api/agendas/:id

GET /api/events/agenda/:agendaId/events
GET /api/events/:eventId
POST /api/events/agenda/:agendaId/events
PUT /api/events/:eventId
DELETE /api/events/:eventId
