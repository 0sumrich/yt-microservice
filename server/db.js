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
	const db = await Database.open(dbPath);
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
	const ids = await currentIds();
	const stats = await getStats(ids);
	const today = stats[0].date;
	const checkQuery = await db.all("select vidId from stats where date=?", [
		today,
	]);
	const exists = checkQuery.length > 0;
	// if exists update else insert
	let changes = 0;
	if (exists) {
		const vidIds = checkQuery.map((o) => o.vidId);
		const sql = `
		UPDATE stats 
		SET viewCount=$viewCount,
		likeCount=$likeCount,
		dislikeCount=$dislikeCount,
		favoriteCount=$favoriteCount,
		commentCount=$commentCount
		WHERE vidId=$vidId AND date=$date;
		`;
		for (let i = 0; i < vidIds.length; i++) {
			const vidId = vidIds[i];
			const {
				viewCount,
				likeCount,
				dislikeCount,
				favoriteCount,
				commentCount,
			} = stats.filter((o) => o.id === vidId)[0];
			const params = {
				$viewCount: viewCount,
				$likeCount: likeCount,
				$dislikeCount: dislikeCount,
				$favoriteCount: favoriteCount,
				$commentCount: commentCount,
				$vidId: vidId,
				$date: today,
			};
			const run = await db.run(sql, params);
			changes += run.changes;
		}
	} else {
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
				changes += row.changes;
			} catch (e) {
				console.log(stats[i]);
				console.log(e);
				break;
			}
		}
	}
	console.log(`rows changed: ${changes}`);
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

	const sql = `
	select date,
	sum(viewCount) as views
	from stats
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

async function statsTidy() {
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
	await db.run(sql);
	const rows = await db.all("select * from stats;");
	for (let i = 0; i < rows.length; i++) {
		console.log(rows[i]);
	}
	return undefined;
}

async function fixDates() {
	const db = await Database.open(dbPath);
	const ids = await db.all("select id from stats;");
	const sql = "UPDATE stats SET date=? WHERE id=?;";
	let changes = 0;
	for (let i = 0; i < ids.length; i++) {
		const id = ids[i].id;
		const dateQuery = await db.all(
			"select date(date) as d from stats where id=?;",
			[id]
		);
		const newDate = dateQuery[0].d;
		const run = await db.run(sql, [newDate, id]);
		changes += run.changes;
		// UPDATE table_name SET column_name=new_value [, ...] WHERE expression
	}
	console.log(`changed ${changes} row(s)`);
	const checkRows = await db.all("select * from stats;");
	debugger;
}

module.exports = {
	currentVideos,
	updateStats,
	idsFromUrlsFile,
	currentIds,
	addNewVidsFromUrlsFile,
	historicTotals,
	addNewVids,
	statsTidy,
	fixDates,
};
