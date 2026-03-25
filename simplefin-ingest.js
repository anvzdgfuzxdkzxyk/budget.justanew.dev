const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const jsonFilePath = path.join(__dirname, 'private', 'simplefin-latest.json');
const databasePath = path.join(__dirname, 'private', 'simplefin.db');

const data = require(jsonFilePath);
const db = new sqlite3.Database(databasePath);

db.run("PRAGMA foreign_keys = ON"); // Enables foreign key enforcement

function verifyTables(db) {
    db.serialize(() => { // These are SQLite calls to create the connections, accounts and transactions tables if they don't already exist
        db.run(`CREATE TABLE IF NOT EXISTS connections (
            conn_id TEXT PRIMARY KEY,
            name TEXT,
            org_id TEXT,
            org_name TEXT,
            org_url TEXT,
            sfin_url TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS accounts (
            account_id TEXT PRIMARY KEY,
            name TEXT,
            conn_id TEXT,
            currency TEXT,
            balance REAL,
            available_balance REAL,
            balance_date INTEGER,
            FOREIGN KEY (conn_id) REFERENCES connections(conn_id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            transaction_id TEXT PRIMARY KEY,
            account_id TEXT,
            posted TEXT,
            amount REAL,
            description TEXT,
            payee TEXT,
            memo TEXT,
            transacted_at TEXT,
            FOREIGN KEY (account_id) REFERENCES accounts(account_id)
        )`);
    });
}

verifyTables(db);
