const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Datenbankverbindung
const db = mysql.createConnection({
  host: 'db', // muss mit dem Service-Namen aus docker-compose.yml übereinstimmen
  user: 'user',
  password: 'userpw',
  database: 'todo'
});

db.connect(err => {
  if (err) {
    console.error('Fehler bei der Verbindung zur Datenbank:', err);
  } else {
    console.log('Mit MariaDB verbunden');
  }
});

// ✅ POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const {
    Name,
    Kategorie,
    Priorität,
    Datum,
    Beschreibung,
    Verantwortlicher,
    Status
  } = req.body;

  console.log('Request Body:', req.body);

  if (!Name) return res.status(400).json({ error: 'Name fehlt' });
  console.log('Insert-Werte:', Name, Kategorie, Priorität, Datum, Beschreibung, Verantwortlicher, Status);
  const sql = `
    INSERT INTO task
    (name, kategorie, priorität, Datum, beschreibung, verantwortlicher, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [
      Name,
      Kategorie,
      Priorität,
      Datum,
      Beschreibung,
      Verantwortlicher,
      Status ? 1 : 0
    ],
    (err, result) => {
      if (err) {
        console.error('Datenbankfehler:', err); 
        return res.status(500).json({ error: 'Fehler beim Speichern in DB', details: err.message });
      }
      res.status(201).json({ id: result.insertId, Name });
    }
  );
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM task WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Datenbankfehler beim Löschen:', err);
      return res.status(500).json({ error: 'Fehler beim Löschen in DB', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task nicht gefunden' });
    }
    res.status(200).json({ message: 'Task gelöscht', id });
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

