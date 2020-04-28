(async () => {
	const { getCurrentInfoCsv } = require("./ytApiCalls");
	const getCsv = require("./getCsv");
	const { insertCurrentVids } = require("./db");
	// Code that runs in your function
	await getCurrentInfoCsv();
	const currentVids = getCsv("./currentVideos.csv").filter(
		(o) => o.id === "75NYFHaq91g"
	);
	await insertCurrentVids(currentVids);
})();
