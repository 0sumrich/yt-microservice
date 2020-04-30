const path = require("path");
const fs = require("fs");
const marked = require("marked");
const cheerio = require("cheerio");
const readme = path.join(__dirname, "../", "README.md");
const file = fs.readFileSync(readme, "utf8");
const initHtml = marked(file.toString());
const $ = cheerio.load(initHtml);

const styleEl = `<link rel="stylesheet" href="style.css">`;

$("head").append(styleEl);

const body = `<div class="markdown-body">${$("body").html()}</div>`;

$("body").html(body);

fs.createWriteStream(path.join(__dirname, "../", "public/index.html")).write(
	$.html(),
	() => console.log("file written to index.html")
);
