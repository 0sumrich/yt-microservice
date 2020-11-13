(async () => {
    const path = require('path')
    const { createPlaylistsTable } = require('./createTablescreatePlaylistsTable')
    const {insertToPlaylists} = require('./db')
    const getCsv = require('./getCsv')
    const pls = getCsv(path.join(__dirname, 'playlists.csv'))
    pls.forEach(pl => {
        const bool = pl.libraries == 'yes' ? 1 : 0;
        pl.libraries = bool
    })
    await insertToPlaylists(pls)
})()