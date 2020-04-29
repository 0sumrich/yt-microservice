const fs = require("fs");
const path = require("path");
const moment = require("moment");
const Database = require("sqlite-async");
const getCsv = require("./getCsv");
const { getStats, getInfo } = require("./ytApiCalls");

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

const idsFromUrlsFile = () =>
	fs
		.readFileSync("./urls.txt")
		.toString()
		.split("\n")
		.map((x) => x.slice("https://www.youtube.com/watch?v=".length));

const currentVideos = async () => {
	const db = await Database.open("./.data/main.db");
	const rows = db.all("select * from videos;");
	return rows;
};

const currentIds = async () => {
	const vids = await currentVideos();
	return vids.map((o) => o.id);
};

async function updateStats() {
	const ids = await currentIds();
	const stats = await getStats(ids);
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
			const {
				id,
				viewCount,
				likeCount,
				dislikeCount,
				favoriteCount,
				commentCount,
				date,
			} = stats[i];
			const row = await db.run(sql, [
				id,
				viewCount,
				likeCount,
				dislikeCount,
				favoriteCount,
				commentCount,
				date,
			]);
		} catch (e) {
			console.log(stats[i]);
			console.log(e);
			break;
		}
	}
	console.log("updated stats table");
	const rows = await db.all("select * from stats;");
	return rows;
}

async function addNewVids(ids) {
	if (!Array.isArray(ids)) {
		console.log("ids param should be an array");
		return undefined;
	}
	const vids = await getInfo(ids)
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
	const rows = await updateStats()
	return rows;
}

async function addNewVidsFromUrlsFile(){
	const idsInDB = await currentIds();
	const idsToAdd = idsFromUrlsFile().filter(x => !idsInDB.includes(x))
	await addNewVids(idsToAdd)
}

module.exports = {
	currentVideos,
	updateStats,
	idsFromUrlsFile,
	currentIds,
	addNewVidsFromUrlsFile
};
