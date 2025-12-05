const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'talents.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath, err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      field TEXT,
      year INTEGER,
      skills TEXT,
      languages TEXT,
      projects TEXT,
      isVerified INTEGER DEFAULT 0,
      location TEXT,
      linkedIn TEXT,
      github TEXT,
      portfolio TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      createdAt TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS connection_requests (
      id TEXT PRIMARY KEY,
      fromUserId TEXT NOT NULL,
      toUserId TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, accepted, rejected
      createdAt TEXT,
      FOREIGN KEY(fromUserId) REFERENCES users(id),
      FOREIGN KEY(toUserId) REFERENCES users(id)
    )`);
  });
};

module.exports = { db, initDb };
