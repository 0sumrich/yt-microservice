require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const moment = require("moment");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT;
const { insertCurrentStats, currentIds, updateStats } = require("./db");
const { getStats } = require("./ytApiCalls");

app.use(cors());

app.get('/', (req, res) => {
  res.send('nothing to see here')
})

app.get("/api/getStats", async (req, res) => {
	const ids = await currentIds()
	const stats = await getStats(ids);
	res.json(stats);
});

app.get("/api/currentTotal", async (req, res) => {
	const ids = await currentIds()
	const stats = await getStats(ids);
	const totalViews = stats.map((o) => +o.viewCount).reduce((a, b) => a + b);
	res.json({ totalViews });
});

app.get("/api/insertStats", async (req, res) => {
	const stats = await updateStats();
	res.json(stats);
});

app.listen(port, () => {
	const host = process.env.HOST_ADDRESS;
	console.log(`listening at ${host}:${port}`);
});
