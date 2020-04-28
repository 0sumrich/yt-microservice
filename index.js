require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const moment = require("moment");
const KEY = process.env.API_KEY;
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT;
const { insertCurrentStats } = require("./db");
const { getStats } = require("./ytApiCalls");

app.use(cors());

app.get("/api/getStats", async (req, res) => {
	const stats = await getStats();
	res.json(stats);
});

app.get("/api/currentTotal", async (req, res) => {
	const stats = await getStats();
	const totalViews = stats.map((o) => +o.viewCount).reduce((a, b) => a + b);
	res.json({ totalViews });
});

app.get("/api/insertStats", async (req, res) => {
	const stats = await insertCurrentStats();
	res.json(stats);
});

app.listen(port, () => {
	const host = "localhost";
	console.log(`listening at http://${host}:${port}`);
});
