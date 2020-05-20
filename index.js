require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT;
const { render } = require("json2html");
const email = require("./server/email");
const {
	insertCurrentStats,
	currentIds,
	currentVideos,
	updateStats,
	historicTotals,
	addNewVids,
	checkForNewVids,
	insertToNewVids,
	filteredRss,
} = require("./server/db");
const { getStats } = require("./server/ytApiCalls");

app.use(cors());
// app.use(express.urlencoded({extended: true}))
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile("index.html");
});

app.get("/api/barnetrss", async (req, res) => {
	try {
		const rss = await filteredRss();
		res.json(rss);
	} catch (e) {
		res.status(500);
	}
});

app.get("/api/getStats", async (req, res) => {
	const ids = await currentIds();
	const stats = await getStats(ids);
	res.json(stats);
});

app.get("/api/currentTotal", async (req, res) => {
	try {
		const ids = await currentIds();
		const stats = await getStats(ids);
		const totalViews = stats
			.map((o) => +o.viewCount)
			.reduce((a, b) => a + b);
		res.json({ totalViews });
	} catch (e) {
		res.status(500);
		res.end();
	}
});

app.get("/api/totals", async (req, res) => {
	const stats = await updateStats();
	const totals = await historicTotals();
	res.json(totals);
});

app.get("/api/insertStats", async (req, res) => {
	const stats = await updateStats();
	res.json(stats);
});

app.get("/api/videos", async (req, res) => {
	const videos = await currentVideos();
	res.json(videos);
});

app.get("/api/insertVids", async (req, res) => {
	if (!req.query.ids) {
		res.send(
			"Route needs a query in the format /api/insertVids?ids=comma,seperated,list"
		);
		res.end();
	}
	const ids = req.query.ids.split(",");
	const vids = await addNewVids(ids);
	res.json(vids);
});

app.get("/api/checkForNewVids", async (req, res) => {
	const newVids = await checkForNewVids();
	if (newVids.length > 0) {
		try {
			const html = render(newVids);
			const subject = "New videos";
			const info = await email({ subject, html });
			await insertToNewVids(newVids);
			res.json(newVids);
		} catch (e) {
			if (e) {
				res.status(500);
				res.json({ error: "something went wrong with the email" });
			}
		}
	} else {
		res.json([]);
	}
});

app.get("/api/dl", (req, res) => {
	res.download(path.join(__dirname, ".data/main.db"));
});

app.listen(port, () => {
	const host = process.env.HOST_ADDRESS;
	console.log(`listening at ${host}:${port}`);
});
