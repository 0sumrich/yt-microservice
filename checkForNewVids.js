(async () => {
	const fs = require("fs");
	const { getRssVideos } = require("./ytApiCalls");
	const { currentIds } = require("./db2");
	const writeCsv = require("./writeCsv");
	const getCsv = require("./getCsv");
	const rssJson = await getRssVideos();
	const idsInDB = await currentIds();
	const vidObj = ({ link, title, pubData }) => ({ link, title, pubData });
	const rssVideos = rssJson.items.map((i) => vidObj(i));
	const idFromUrl = (str) =>
		str.slice("https://www.youtube.com/watch?v=".length);
	const currNewVidsCsvIds = getCsv("./newVids.csv").map((o) =>
		idFromUrl(o.link)
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
		await writeCsv(newVids, "./newVids.csv");
		return undefined;
	} else {
		console.log("No new vids");
		return undefined;
	}
})();
