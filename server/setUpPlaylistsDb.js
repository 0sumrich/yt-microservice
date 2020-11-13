(async () => {
    const path = require('path')
    const { createPlaylistsTable } = require('./createTablescreatePlaylistsTable')
    const {insertToPlaylists} = require('./db')
    const getCsv = require('./getCsv')
    const pls = getCsv(path.join(__dirname, 'playlists.csv'))
    await insertToPlaylists(pls)
})()