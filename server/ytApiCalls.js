require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const moment = require("moment");
const KEY = process.env.YT_API_KEY;

const getRssVideos = async () => {
	const ytrss =
		"https://www.youtube.com/feeds/videos.xml?channel_id=UC4SYK8Q_wNFeiNmVG3quSRw";
	const res = await fetch(
		`https://api.rss2json.com/v1/api.json?rss_url=${ytrss}`
	);
	return json = await res.json();
};

async function getStats(ids) {
	const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids.join(
		","
	)}&key=${KEY}`;
	const res = await fetch(uri);
	const json = await res.json();
	const info = json.items.map((o) => ({
		id: o.id,
		...o.statistics,
		date: moment().format("YYYY-MM-DD"),
	}));
	return info;
}

async function getInfo(ids) {
	if (!Array.isArray(ids)) {
		console.log("ids param should be an array");
		return undefined;
	}
	const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids.join(
		","
	)}&key=${KEY}`;
	const res = await fetch(uri);
	const json = await res.json();
	const items = json.items.map((o) => ({
		id: o.id,
		title: o.snippet.title,
		description: o.snippet.description,
		publishedAt: o.snippet.publishedAt,
	}));
	return items
}

module.exports = {
	getStats,
	getInfo,
	getRssVideos
};
