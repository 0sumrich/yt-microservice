(async () => {
	require("dotenv").config();
	const { getRssVideos } = require("./ytApiCalls");
	const {filteredRss}=require('./db')
	const rss = await filteredRss();
	debugger;
})();
