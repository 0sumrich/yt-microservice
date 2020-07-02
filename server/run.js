const { json } = require('express');

(async () => {
	const idFromUrl = (str) => str.slice("https://www.youtube.com/watch?v=".length);
	const { currentIds, addNewVids } = require('./db')
	const { getRssVideos } = require('./ytApiCalls')
	const fs = require('fs')
	const path = require('path')
	const fullRss = await getRssVideos();
	const currIds = await currentIds();
	const vidsWeNeed = fullRss.items.filter(o => !currIds.includes(idFromUrl(o.link))).map(o => idFromUrl(o.link))
	const newVids = await addNewVids(vidsWeNeed)
})();
