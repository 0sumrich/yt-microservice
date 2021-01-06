const fs = require("fs");
const path = require("path");
const Database = require("sqlite-async");
const { getStats, getInfo, getRssVideos, getPlaylistTitle } = require("./ytApiCalls");
const getCsv = require("./getCsv");
const { AsyncResource } = require("async_hooks");
const dbPath = path.join(__dirname, "../", ".data", "main.db");

const idFromUrl = (str) => str.slice("https://www.youtube.com/watch?v=".length);

const currentVideos = async () => {
	const db = await Database.open(dbPath);
	const rows = db.all("select * from videos;");
	return rows;
};

const currentIds = async () => {
	const vids = await currentVideos();
	return vids.map((o) => o.id);
};

const filteredRss = async () => {
	const fullRss = await getRssVideos();
	const currIds = await currentIds();
	const stringFilterer = (s) => s.toLowerCase().includes("libraries");
	const idFilterer = (id) => currIds.includes(id);
	const items = fullRss.items.filter(
		(o) => stringFilterer(o.title) || idFilterer(idFromUrl(o.link))
	);
	fullRss.items = items
	fullRss.title = 'Barnet Council - Libraries'
	return fullRss
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
			const {
				id,
				viewCount,
				likeCount,
				dislikeCount,
				favoriteCount,
				commentCount,
				date,
			} = stats[i];
			try {
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
				return { notAdded: vids[i], error: e }
			}
		}
		const rows = await updateStats();
		return vids;
	} catch (e) {
		if (e) return e;
	}
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
}

async function insertToNewVids(arr) {
	const db = await Database.open(dbPath);
	let changes = 0;
	const sql = `
	INSERT INTO newvideos (id, title, publishedAt) values (?,?,?)
	`;
	for (let i = 0; i < arr.length; i++) {
		const { link, title, pubDate, description } = arr[i];
		const id = idFromUrl(link);
		const run = await db.run(sql, [id, title, pubDate]);
		changes += run.changes;
	}
	console.log(`${changes} row(s) changed`);
}

async function insertToPlaylists(arr) {
	const db = await Database.open(dbPath)
	const headers = Object.keys(arr[0])
	const headerString = headers.join(', ')
	const headerQs = headers.map(x => '?').join(', ')
	const sql = `INSERT INTO playlists (${headerString}) VALUES (${headerQs})`
	let changes = 0
	for (const row of arr) {
		try {
			const run = await db.run(sql, Object.values(row))
			changes += run.changes
		} catch (e) {
			console.log(e)
			continue
		}
	}
	console.log(`${changes} row(s) changed`);
}

async function insertPlaylistById(id, library = 0, age = '') {
	// need to get title with ytApicall await getPlaylistTitle(id)
	const title = await getPlaylistTitle(id)
	const headers = ['id', 'title', 'libraries', 'age']
	const headerString = headers.join(', ')
	const headerQs = headers.map(x => '?').join(', ')
	const sql = `INSERT INTO playlists (${headerString}) VALUES (${headerQs})`
	const row = [id, title, library, age]
	const run = await db.run(sql, row)
	console.log(`${run.changes} row(s) changed`);
}

async function getAllPlaylistsFromDB() {
	const db = await Database.open(dbPath)
	const sql = 'select id, title, age from playlists;'
	const rows = await db.all(sql)
	return rows
}

async function getPlaylistsFromDB() {
	const db = await Database.open(dbPath)
	const sql = 'select id, title, age from playlists where libraries=1;'
	const rows = await db.all(sql)
	return rows
}

async function currNewVideosIds() {
	const db = await Database.open(dbPath);
	const sql = `
	SELECT id FROM newvideos;
	`;
	const query = await db.all(sql);
	return query.map((o) => o.id);
}

async function checkForNewVids() {
	const fs = require("fs");
	const path = require("path");
	const { getRssVideos } = require("./ytApiCalls");
	const rssJson = await getRssVideos();
	const ourIds = await currentIds();
	const newVidsIds = await currNewVideosIds();
	const allCurrIds = [...ourIds, ...newVidsIds];
	const vidObj = ({ link, title, pubDate }) => ({
		link,
		title,
		pubDate,
	});
	const rssVideos = rssJson.items.map((i) => vidObj(i));
	return rssVideos.filter((o) => !allCurrIds.includes(idFromUrl(o.link)));
}

module.exports = {
	currentVideos,
	updateStats,
	currentIds,
	historicTotals,
	addNewVids,
	statsTidy,
	fixDates,
	insertToNewVids,
	checkForNewVids,
	filteredRss,
	insertToPlaylists,
	getPlaylistsFromDB,
	getAllPlaylistsFromDB
};
