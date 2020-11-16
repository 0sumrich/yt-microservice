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
	const maxResults = 25
	const uri = `${base}/?channelId=${channelId}&maxResults=${maxResults}&part=snippet&key=${KEY}`
	const res = await fetch(uri);
	const json = await res.json();
	const items = json.items.map(({ id, snippet }) => ({ id, title: snippet.title }))
	return items
}

async function getPlaylistTitle(id) {
	const base = 'https://www.googleapis.com/youtube/v3/playlists'
	const uri = `${base}/?id=${id}&part=snippet&key=${KEY}`
	const res = await fetch(uri);
	const json = await res.json();
	return json.items[0].snippet.title
}

async function getVidIdsFromPlaylist(id) {
	// 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&part=snippet&maxResults=25&playlistId=PLTJdPHAQ9nUoY1clKWfMbUE4m2bOF7npb&key=[YOUR_API_KEY]'
	const base = 'https://youtube.googleapis.com/youtube/v3/playlistItems'
	const maxResults = 25
	let pageToken = false
	const uri = pageToken ? 
	`${base}/?playlistId=${id}&maxResults=${25}&part=snippet&pageToken=${pageToken}key=${KEY}` :
	`${base}/?playlistId=${id}&maxResults=${25}&part=snippet&key=${KEY}`
	const vidIds = []
	const getInfo = async() => {
		const res = await fetch(uri);
		const json = await res.json();
		for (const item of json.items){
			vidIds.push(item.snippet.resourceId.videoId)
		}
		if (json.pageInfo.totalResults > vidIds.length) {
			pageToken = json.nextPageToken
			return await getInfo()
		}
	}
	return vidIds
}

module.exports = {
	getStats,
	getInfo,
	getRssVideos,
	getPlaylists,
	getPlaylistTitle,
	getVidIdsFromPlaylist
};
