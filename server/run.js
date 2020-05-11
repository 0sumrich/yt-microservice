(async () => {
	require("dotenv").config();
	// const { getRssVideos } = require("./ytApiCalls");
	const {checkForNewVids, insertToNewVids}=require('./db')
	await insertToNewVids(rssVideos)
})();
