require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT;
const {
	insertCurrentStats,
	currentIds,
	updateStats,
	historicTotals,
} = require("./db");
const { getStats } = require("./ytApiCalls");
// const createDOMPurify = require('dompurify');
// const { JSDOM } = require('jsdom');

// const window = new JSDOM('').window;
// const DOMPurify = createDOMPurify(window);

// const clean = DOMPurify.sanitize(dirty);

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile("index.html");
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
		const totalViews = stats.map((o) => +o.viewCount).reduce((a, b) => a + b);
		res.json({totalViews});	
	} catch (e) {
		res.status(500)
		res.end()
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

app.listen(port, () => {
	const host = process.env.HOST_ADDRESS;
	console.log(`listening at ${host}:${port}`);
});
