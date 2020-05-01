const fs = require("fs");
const path = require("path");
const Database = require("sqlite-async");
const { getStats, getInfo } = require("./ytApiCalls");

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
	const vids = await getInfo(ids);
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
}

async function addNewVidsFromUrlsFile() {
	const idsInDB = await currentIds();
	const idsToAdd = idsFromUrlsFile().filter((x) => !idsInDB.includes(x));
	await addNewVids(idsToAdd);
}

async function historicTotals() {
	debugger;
	const db = await Database.open(dbPath);

	const inner = `
	select distinct
	date(stats.date) as date,
	sum(stats.viewCount) as "views",
	count(videos.id) filter (where videos.publishedAt<=stats.date) + 1 as "videos"
	from stats
	inner join videos ON
	stats.vidId=videos.id
	group by stats.date
	order by stats.date
	`;

	const sql = `
	select date,
	max(views) as views,
	videos as videos
	from (${inner})
	group by date;
	`;

	const rows = await db.all(sql);

	return rows;
}

async function historicTotals2(){
	const db = await Database.open(dbPath)
	const inner = `
	select distinct
	date,
	date(date) as day,
	sum(viewCount) as views,
	from stats
	`
	const outer = `
	select 
	date,
	day, 
	max(views) as views, 
	from (${inner}) 
	group by day;
	`
	const rows = await db.all(outer)
	console.log(rows)
	return rows;
}

module.exports = {
	currentVideos,
	updateStats,
	idsFromUrlsFile,
	currentIds,
	addNewVidsFromUrlsFile,
	historicTotals,
	historicTotals2,
	addNewVids,
};
