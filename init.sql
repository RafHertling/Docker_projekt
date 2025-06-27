CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  kategorie VARCHAR(255),
  prioritaet VARCHAR(255),
  duedate DATE,
  beschreibung TEXT,
  verantwortlicher VARCHAR(255),
  status BOOLEAN
);