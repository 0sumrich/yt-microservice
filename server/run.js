(async () => {
	const idFromUrl = (str) => str.slice("https://www.youtube.com/watch?v=".length);
	const { currentIds, addNewVids, insertToPlaylists, getPlaylistsFromDB } = require('./db')
	const { getPlaylists, getPlaylistTitle, getVidIdsFromPlaylist } = require('./ytApiCalls')
	const fs = require('fs')
	const path = require('path')
	const writeCsv = require('./writeCsv')
	const getCsv = require('./getCsv')	
	const vids = await getVidIdsFromPlaylist('PLTJdPHAQ9nUr5-rud2CHMNyAdGaTBrHfb')
	await writeCsv(vids.map(id => ({id})), path.join(__dirname, 'reccos.csv'))
	// const dbPls = await getPlaylistsFromDB()
	// const dbPlIds = dbPls.map(o => o.id)
	// const pls = getCsv(path.join(__dirname, 'playlists.csv'))
	// await insertToPlaylists(pls.filter(o => !dbPlIds.includes(o.id)))
})();
