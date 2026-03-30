const fs = require('fs');
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
            acc_id TEXT PRIMARY KEY,
            name TEXT,
            conn_id TEXT,
            currency TEXT,
            balance REAL,
            available_balance REAL,
            balance_date INTEGER,
            FOREIGN KEY (conn_id) REFERENCES connections(conn_id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            trans_id TEXT PRIMARY KEY,
            acc_id TEXT,
            posted TEXT,
            amount REAL,
            description TEXT,
            payee TEXT,
            memo TEXT,
            transacted_at TEXT,
            FOREIGN KEY (acc_id) REFERENCES accounts(acc_id)
        )`);
    });
}
function unixToISO(unixTs) {
  // Detect seconds vs milliseconds
  const ts = unixTs.toString().length === 10
    ? unixTs * 1000   // seconds → ms
    : unixTs;         // already ms

  return new Date(ts).toISOString();
}

function extractConnections(jsonFilePath) {
	const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
	const connData = JSON.parse(rawData)
	return connData.connections || [];
}

function insertConnections(db, connectionsData) {
	const stmt = db.prepare(`
		INSERT OR IGNORE INTO connections
		(conn_id, name, org_id, org_name, org_url, sfin_url)
		VALUES (?, ?, ?, ?, ?, ?)
	`);

	connectionsData.forEach(conn => {
		stmt.run(conn.conn_id, conn.name,  conn.org_id, conn.org_name, conn.org_url, conn.sfin_url);
	});
	stmt.finalize();
}

function extractAccounts(jsonFilePath) {
	const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
	const accData = JSON.parse(rawData)
	return accData.accounts || [];
}

function insertAccounts(db, accountsData) {
	const stmt = db.prepare(`
		INSERT OR IGNORE INTO accounts
		(acc_id, name, conn_id, currency, balance, available_balance, balance_date)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		`);
	
	accountsData.forEach(conn => {
		const balance = parseFloat(conn.balance)
		const availableBalance = parseFloat(conn['available-balance'] || 0);
		const balanceDate = unixToISO(conn['balance-date'])

		stmt.run(
			conn.id,
			conn.name,
			conn.conn_id,
			conn.currency,
			balance,
			availableBalance,
			balanceDate
		);
	});
		stmt.finalize();
}

function extractTransactions(jsonFilePath) {
	const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
	const jsonData = JSON.parse(rawData);
	const transactions = [];
	jsonData.accounts.forEach(account => {
		if (account.transactions && Array.isArray(account.transactions)) {
			account.transactions.forEach(txn => {
				transactions.push({
					...txn,
					account_id: account.id
				});
			});
		}
	});

	return transactions;
}

function insertTransactions(db, transData) {
	const stmt = db.prepare(`
		INSERT OR IGNORE INTO transactions
		(trans_id, acc_id, posted, amount, description, payee, memo, transacted_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`);

	transData.forEach(txn => {
		const amount = parseFloat(txn.amount);
		const posted = unixToISO(txn.posted);
		const transacted_at = unixToISO(txn.posted);
		console.log(amount);
		console.log(posted);
		console.log(transacted_at);
		console.log(txn.account_id);
		stmt.run(
			txn.id,
			txn.account_id,
			posted,
			amount,
			txn.description,
			txn.payee,
			txn.memo,
			transacted_at
		);
	});
		stmt.finalize();
}

verifyTables(db);
const connectionsData = extractConnections(jsonFilePath);
insertConnections(db, connectionsData)
const accountsData = extractAccounts(jsonFilePath);
insertAccounts(db, accountsData);
const transactionsData = extractTransactions(jsonFilePath);
console.log(transactionsData);
insertTransactions(db, transactionsData);
