(async () => {
	const idFromUrl = (str) => str.slice("https://www.youtube.com/watch?v=".length);
	const { currentIds, addNewVids, insertToPlaylists, getPlaylistsFromDB } = require('./db')
	const { getRssVideos, getStats, getPlaylists, getPlaylistTitle, getVidIdsFromPlaylist } = require('./ytApiCalls')
	const fs = require('fs')
	const path = require('path')
	const writeCsv = require('./writeCsv')
	const getCsv = require('./getCsv')

	// const playlists = await getPlaylists()
	// await writeCsv(playlists, path.join(__dirname, 'playlists.csv'))
	// /Volumes/Documents/Documents/Coding/yt-microservice/server/playlists.csv
	const pls = await getPlaylistsFromDB()
	const res = []
	for (const pl of pls ){
		const {age, id, title} = pl
		const vidIds = await getVidIdsFromPlaylist(id)
		res.push(...vidIds.map(x => ({vidId: x, age: age, playListTitle: title})))
	}
})();
