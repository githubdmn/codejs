import Database from 'better-sqlite3';

const db = new Database(':memory:');

db.exec(
	'CREATE TABLE greetings (id INTEGER PRIMARY KEY, message TEXT NOT NULL)',
);

const insert = db.prepare('INSERT INTO greetings (message) VALUES (?)');
insert.run('Hey there');
insert.run('Hey again');

const rows = db.prepare('SELECT id, message FROM greetings').all();
console.log(rows);

db.close();
