CREATE DATABASE IF NOT EXISTS db_agenda;

USE db_agenda;

CREATE TABLE t_user(
   user_id INT,
   user_username VARCHAR(50) NOT NULL,
   user_email VARCHAR(50) NOT NULL,
   user_password VARCHAR(50) NOT NULL,
   user_role VARCHAR(50) NOT NULL,
   user_personType VARCHAR(50) NOT NULL,
   PRIMARY KEY(user_id),
   UNIQUE(user_email)
);

CREATE TABLE t_family(
   family_id INT,
   family_name VARCHAR(50) NOT NULL,
   PRIMARY KEY(family_id)
);

CREATE TABLE t_agenda(
   agenda_id INT,
   agenda_name VARCHAR(50) NOT NULL,
   family_id INT NOT NULL,
   PRIMARY KEY(agenda_id),
   FOREIGN KEY(family_id) REFERENCES t_family(family_id)
);

CREATE TABLE t_event(
   event_id INT,
   event_type VARCHAR(50) NOT NULL,
   event_endDatetime DATETIME NOT NULL,
   event_name VARCHAR(50) NOT NULL,
   event_startDatetime DATETIME NOT NULL,
   event_description VARCHAR(50) NOT NULL,
   agenda_id INT NOT NULL,
   PRIMARY KEY(event_id),
   FOREIGN KEY(agenda_id) REFERENCES t_agenda(agenda_id)
);

CREATE TABLE belongs(
   family_id INT,
   user_id INT,
   PRIMARY KEY(family_id, user_id),
   FOREIGN KEY(family_id) REFERENCES t_family(family_id),
   FOREIGN KEY(user_id) REFERENCES t_user(user_id)
);

CREATE TABLE appertain(
   family_id INT,
   family_adminId INT,
   PRIMARY KEY(family_id, family_adminId),
   FOREIGN KEY(family_id) REFERENCES t_family(family_id),
   FOREIGN KEY(family_adminId) REFERENCES t_user(user_id)
);
