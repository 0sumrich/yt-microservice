require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const moment = require("moment");
const KEY = process.env.YT_API_KEY;
const Parser = require('rss-parser');
const parser = new Parser();

// TRY THIS
// https://www.npmjs.com/package/rss-to-json


function _chunk(array, size) {
	const chunked_arr = [];
	for (let i = 0; i < array.length; i++) {
		const last = chunked_arr[chunked_arr.length - 1];
		if (!last || last.length === size) {
			chunked_arr.push([array[i]]);
		} else {
			last.push(array[i]);
		}
	}
	return chunked_arr;
}

const getRssVideos = async () => {
	const ytrss =
		"https://www.youtube.com/feeds/videos.xml?channel_id=UC4SYK8Q_wNFeiNmVG3quSRw";
	const feed = await parser.parseURL(ytrss);
	return feed
};

async function getStats(ids) {
	const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids.join(
		","
	)}&key=${KEY}`
	const res = await fetch(uri)
	const json = await res.json()
	const info = json.items.map((o) => ({
		id: o.id,
		...o.statistics,
		date: moment().format("YYYY-MM-DD"),
	}));
	return info;
}

// [  "kPTZKphtYWk",  "thhzQyUo2vs",  "RavYQP5GuuE",  "fMaCMvxaeIo"]

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
