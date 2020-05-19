(async () => {
	require("dotenv").config();
	const { getRssVideos } = require("./ytApiCalls");
	const {checkForNewVids, insertToNewVids}=require('./db')
	const rss = await getRssVideos();
})();
