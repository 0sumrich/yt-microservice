(async () => {
	const idFromUrl = (str) => str.slice("https://www.youtube.com/watch?v=".length);
	const { currentIds, addNewVids, insertToPlaylists } = require('./db')
	const { getRssVideos, getStats, getPlaylists } = require('./ytApiCalls')
	const fs = require('fs')
	const path = require('path')
	const writeCsv = require('./writeCsv')
	const getCsv = require('./getCsv')
	const playlists = await getPlaylists()
	await writeCsv(playlists, path.join(__dirname, 'playlists.csv'))
	// /Volumes/Documents/Documents/Coding/yt-microservice/server/playlists.csv
	// const playlists = await getCsv(path.join(__dirname, 'playlists.csv'))
	// await insertToPlaylists(playlists)
})();
