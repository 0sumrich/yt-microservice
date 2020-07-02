(async () => {
	const idFromUrl = (str) => str.slice("https://www.youtube.com/watch?v=".length);
	const { currentIds, addNewVids } = require('./db')
	const { getRssVideos } = require('./ytApiCalls')
	const fs = require('fs')
	const path = require('path')
	const writeCsv = require('./writeCsv')
	const getCsv = require('./getCsv')
	// const fullRss = await getRssVideos();
	// const currIds = await currentIds();
	// const vidsWeNeed = fullRss.items.filter(o => !currIds.includes(idFromUrl(o.link)))
	// await writeCsv(vidsWeNeed, path.join(__dirname, 'toWrite.csv'))
	const ids = getCsv(path.join(__dirname, 'toWrite.csv')).map(o => idFromUrl(o.link))
	const newVids = await addNewVids(ids)
})();
