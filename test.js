require('dotenv').config()
const fetch = require('node-fetch')

const KEY = process.env.API_KEY;
// https://www.youtube.com/watch?v=O-3kfbECiYw
// rss feed
const videoID = 'O-3kfbECiYw'
const uri = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoID}&key=${KEY}`
const get = async () => {
	const res = await fetch(uri);
	const json = await res.json();
	debugger;
}

get();