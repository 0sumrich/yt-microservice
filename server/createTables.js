const path = require('path')
const Database = require("sqlite-async");
const dbPath = path.join(__dirname, "../", ".data", "main.db");
const createNewVidsTable = async () => {
	const sql = `
	CREATE TABLE IF NOT EXISTS newvideos (
	 id TEXT PRIMARY KEY,
	 title TEXT,
	 description TEXT,
	 publishedAt TEXT
	);`;
	try {
		const db = await Database.open(dbPath);
		const run = await db.run(sql);
		if (run) return true;
	} catch (e) {
		console.err(e);
		return false;
	}
};

const createVideosTable = async () => {
	const sql = `
	CREATE TABLE IF NOT EXISTS videos (
	 id TEXT PRIMARY KEY,
	 title TEXT,
	 description TEXT,
	 publishedAt TEXT
	);
	`;
	try {
		const db = await Database.open(dbPath);
		const run = await db.run(sql);
		if (run) return true;
	} catch (e) {
		console.err(e);
		return false;
	}
};

const createStatsTable = async () => {
	const columns = [
		"id",
		"vidId",
		"viewCount",
		"likeCount",
		"dislikeCount",
		"favoriteCount",
		"commentCount",
		"date",
	];
	const sql = `
	CREATE TABLE IF NOT EXISTS stats (
	 id INTEGER PRIMARY KEY,
	 vidId TEXT,
	 viewCount INTEGER,
	 likeCount INTEGER,
	 dislikeCount INTEGER,
	 favoriteCount INTEGER,
	 commentCount INTEGER,
	 date TEXT,
	 FOREIGN KEY (vidId)
     REFERENCES videos (id) 
	);
	`;
	try {
		const db = await Database.open(dbPath);
		const run = await db.run(sql);
		if (run) return true;
	} catch (e) {
		console.log(e);

		return false;
	}
};

createNewVidsTable()