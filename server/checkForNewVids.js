(async () => {
	const fs = require("fs");
	const path = require("path");
	const { getRssVideos } = require("./ytApiCalls");
	const { currentIds } = require("./db");
	const writeCsv = require("./writeCsv");
	const getCsv = require("./getCsv");
	const rssJson = await getRssVideos();
	const idsInDB = await currentIds();
	const csvPath = path.join(__dirname, './newVids.csv')
	const vidObj = ({ link, title, pubDate }) => ({ link, title, pubDate });
	const rssVideos = rssJson.items.map((i) => vidObj(i));
	const idFromUrl = (str) =>
		str.slice("https://www.youtube.com/watch?v=".length);
	const currNewVidsCsvIds = getCsv(csvPath).map(
		(o) => idFromUrl(o.link)
	);
	const newVids = rssVideos.filter((x) => {
		const id = idFromUrl(x.link);
		const res = !idsInDB.includes(id) && !currNewVidsCsvIds.includes(id);
		return res;
	});
	if (newVids.length > 0) {
		console.log(
			`There are ${newVids.length} new vids to check at newVids.csv`
		);
		await writeCsv(newVids, csvPath);
		return undefined;
	} else {
		console.log("No new vids");
		return undefined;
	}
})();
