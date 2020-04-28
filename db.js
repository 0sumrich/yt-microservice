const fs = require("fs");
const moment = require("moment");
const Database = require("sqlite-async");
const { getStats } = require("./ytApiCAlls");
const getCsv = require("./getCsv");

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
		const db = await Database.open("./.data/main.db");
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
		const db = await Database.open("./.data/main.db");
		const run = await db.run(sql);
		if (run) return true;
	} catch (e) {
		console.log(e);

		return false;
	}
};

async function insertCurrentStats() {
	const stats = await getStats();
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
	const sql = `INSERT INTO stats (${columns
		.slice(1)
		.join(", ")}) VALUES (${columns
		.slice(1)
		.map((x) => "?")
		.join(", ")});`;
	const db = await Database.open("./.data/main.db");
	for (let i = 0; i < stats.length; i++) {
		try {
			const {id, viewCount, likeCount, dislikeCount, favoriteCount, commentCount, date} = stats[i]
			const row = await db.run(sql, [id, viewCount, likeCount, dislikeCount, favoriteCount, commentCount, date]);
		} catch (e) {
			console.log(stats[i]);
			console.log(e);
			break;
		}
	}
	const rows = await db.all("select * from stats;");
	return rows
}

async function insertCurrentVids(vids) {
	const sql = `INSERT INTO videos (id, title, description, publishedAt) VALUES (?, ?, ?, ?);`;
	const db = await Database.open("./.data/main.db");
	for (let i = 0; i < vids.length; i++) {
		try {
			const row = await db.run(sql, Object.values(vids[i]));
		} catch (e) {
			console.log(vids[i]);
			console.log(e);
			break;
		}
	}
	const rows = await db.all("select * from videos;");
	if (rows.length === vids.length) console.log("success");
}

module.exports = {
	insertCurrentStats: insertCurrentStats,
	insertCurrentVids: insertCurrentVids
}
