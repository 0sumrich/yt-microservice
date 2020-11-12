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
	const info = []
	for (let i = 0; i < ids.length; i++) {
		const id = ids[i]
		const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${KEY}`
		const res = await fetch(uri)
		const json = await res.json()
		if (json.items.length < 1) {
			continue;
		}
		const o = json.items[0]
		const item = {
			id: o.id,
			...o.statistics,
			date: moment().format('YYYY-MM-DD')
		}
		info.push(item)
	}
	return info;
}

async function getInfo(ids) {
	if (!Array.isArray(ids)) {
		console.log("ids param should be an array");
		return undefined;
	}
	const info = []
	for (let i = 0; i < ids.length; i++) {
		const id = ids[i]
		const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${KEY}`;
		const res = await fetch(uri);
		const json = await res.json();
		const o = json.items[0];
		const item = {
			id: o.id,
			title: o.snippet.title,
			description: o.snippet.description,
			publishedAt: o.snippet.publishedAt,
		}
		info.push(item)
	}
	return info
}

// ['contentDetails'
// 'id'
// 'localizations'
// 'player'
// 'snippet'
// 'status']

async function getPlaylists() {
	const channelId = 'UC4SYK8Q_wNFeiNmVG3quSRw'
	const base = 'https://www.googleapis.com/youtube/v3/playlists'
	const uri = `${base}/?channelId=${channelId}&part=snippet,contentDetails&key=${KEY}`
	const res = await fetch(uri);
	const json = await res.json();
	debugger;
}

module.exports = {
	getStats,
	getInfo,
	getRssVideos,
	getPlaylists
};
