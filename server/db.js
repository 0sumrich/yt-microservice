const fs = require("fs");
const path = require("path");
const Database = require("sqlite-async");
const { getStats, getInfo } = require("./ytApiCalls");
const getCsv = require("./getCsv");
const dbPath = path.join(__dirname, "../", ".data", "main.db");

const idsFromUrlsFile = () =>
	fs
		.readFileSync(path.join(__dirname, "./urls.txt"))
		.toString()
		.split("\n")
		.map((x) => x.slice("https://www.youtube.com/watch?v=".length));

const currentVideos = async () => {
	const db = await Database.open(dbPath);
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
	const db = await Database.open(dbPath);
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
	const returnSql = `SELECT stats.date, 
				    videos.id,
				    videos.title,
					videos.description,
					videos.publishedAt,
					stats.viewCount,
					stats.likeCount,
					stats.dislikeCount,
					stats.favoriteCount,
					stats.commentCount
					FROM videos
					INNER JOIN stats 
				    ON stats.vidId = videos.id;`;
	const rows = await db.all(returnSql);
	return rows;
}

async function addNewVids(ids) {
	if (!Array.isArray(ids)) {
		console.log("ids param should be an array");
		return undefined;
	}
	try {
		const vids = await getInfo(ids);
		if (vids.length < 1) {
			return { error: "not a valid id" };
		}
		const sql = `INSERT INTO videos (id, title, description, publishedAt) VALUES (?, ?, ?, ?);`;
		const db = await Database.open(dbPath);
		for (let i = 0; i < vids.length; i++) {
			try {
				const row = await db.run(sql, Object.values(vids[i]));
			} catch (e) {
				console.log(vids[i]);
				console.log(e);
				break;
			}
		}
		const rows = await updateStats();
		return rows;
	} catch (e) {
		if (e) return e;
	}
}

async function addNewVidsFromUrlsFile() {
	const idsInDB = await currentIds();
	const idsToAdd = idsFromUrlsFile().filter((x) => !idsInDB.includes(x));
	await addNewVids(idsToAdd);
}

async function historicTotals() {
	const db = await Database.open(dbPath);
	const initCsv = getCsv(path.join(__dirname, "initTotals.csv"));
	const inner = `
	select distinct
	date(date) as date,
	sum(viewCount) as views
	from stats
	group by date
	order by date
	`;

	const sql = `
	select date,
	max(views) as views
	from (${inner})
	group by date;
	`;
	const rows = await db.all(sql);

	const vidsSql = `select count(*) as count from videos where datetime(publishedAt)<=?;`;
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		const query = await db.all(vidsSql, [row.date + "23:59"]);
		row.videos = query[0].count;
	}

	console.log([...initCsv, ...rows]);
	return [...initCsv, ...rows];
}

async function statsTidy(){
	const db = await Database.open(dbPath);
	const inner = `
	select 
	id,
	vidId,
	date,
	date(date) as sdate,
	viewCount
	from stats
	group by date, vidId
	order by id, date
	`;

	const sql = `
	delete from stats where id not in (

	select id from (
	select
	id,
	vidId,
	max(date),
	sdate,
	viewCount
	from (${inner})
	group by sdate, vidId
	order by id
	)

	);
	`;
	await db.run(sql)
	const rows = await db.all('select * from stats;')
	for (let i=0;i<rows.length;i++){
		console.log(rows[i])
	}
	return undefined;
}

module.exports = {
	currentVideos,
	updateStats,
	idsFromUrlsFile,
	currentIds,
	addNewVidsFromUrlsFile,
	historicTotals,
	addNewVids,
	statsTidy
};
