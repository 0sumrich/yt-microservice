(async () => {
	const idFromUrl = (str) => str.slice("https://www.youtube.com/watch?v=".length);
	const { currentIds, addNewVids, insertToPlaylists, getPlaylistsFromDB } = require('./db')
	const { getPlaylists, getPlaylistTitle, getVidIdsFromPlaylist } = require('./ytApiCalls')
	const fs = require('fs')
	const path = require('path')
	const writeCsv = require('./writeCsv')
	const getCsv = require('./getCsv')

	// const playlists = await getPlaylists()
	// await writeCsv(playlists, path.join(__dirname, 'playlists.csv'))
	// /Volumes/Documents/Documents/Coding/yt-microservice/server/playlists.csv
	const dbPls = await getPlaylistsFromDB()
	const dbPlIds = dbPls.map(o => o.id)
	// const ytPls = await getPlaylists()
	// const missing = ytPls.filter(o => !dbPls.includes(o.id))
	// await writeCsv(missing, 'missing.csv')
	const pls = getCsv(path.join(__dirname, 'playlists.csv'))
	// .filter(o => !dbPls.includes(o.id))
	await insertToPlaylists(pls.filter(o => !dbPlIds.includes(o.id)))
})();
