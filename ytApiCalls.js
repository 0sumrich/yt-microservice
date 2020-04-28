require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const moment = require("moment");
const KEY = process.env.API_KEY;
const writeCsv = require('./writeCsv')

const urls = fs
	.readFileSync("./urls.txt")
	.toString()
	.split("\n")
	.map((x) => x.slice("https://www.youtube.com/watch?v=".length));

const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${urls.join(
	","
)}&key=${KEY}`;

const getCurrentInfoCsv = async () => {
	const res = await fetch(uri);
	const json = await res.json();
	const items = json.items.map((o) => ({
		id: o.id,
		title: o.snippet.title,
		description: o.snippet.description,
		publishedAt: o.snippet.publishedAt,
	}));
	await writeCsv(items, 'currentVideos.csv')
};


const rss = async () => {
	const ytrss =
		"https://www.youtube.com/feeds/videos.xml?channel_id=UC4SYK8Q_wNFeiNmVG3quSRw";
	// const converterapi = `https://api.rss2json.com/v1/api.json?rss_url=${ytrss}`
	const res = await fetch(
		`https://api.rss2json.com/v1/api.json?rss_url=${ytrss}`
	);
	const json = await res.json();
	// link, pubdate, title, description
	const items = json.items.map((o) => {
		return {
			link: o.link,
			pubDate: moment(o.pubDate),
			title: o.title,
			description: o.description,
		};
	});
	//.format("YYYY-MM-DD
	function filterer(items) {
		let res = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[0];
			const { title, description } = item;
			if (
				title.toLowerCase().includes("libraries") ||
				description.toLowerCase().includes("libraries")
			) {
				res.push(item);
			}
		}
		return res;
	}
	const libs = filterer(items);
	debugger;
};

async function getStats() {
	const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${urls.join(
		","
	)}&key=${KEY}`;
	const res = await fetch(uri);
	const json = await res.json();
  debugger
	const info = json.items.map((o) => ({
		id: o.id,
		...o.statistics,
		date: moment().format("YYYY-MM-DD HH:mm:ss")
	}));
	return info
}

module.exports = {
	getStats: getStats,
	getCurrentInfoCsv: getCurrentInfoCsv,
	rss: rss
}