const { json } = require('express');

(async () => {
	const { updateStats, historicTotals, addNewVids } = require('./db')
	const {getStats, getInfo} = require('./ytApiCalls')
	const fs = require('fs')
	const path = require('path')
	const ids = [  "O-3kfbECiYw",  "aE7wqHnNzmA",  "iAg127__YVo",  "_vH5Hb1k-CM",  "bgEQkyFTmU0",  "75NYFHaq91g",  "6521sN0ioWQ",  "_aPADMmhzKA",  "yerjgsDsKKs",  "SDDzDMiXkHI",  "UGbpilB51OI",  "guFtSqHU6pk",  "hr7ETReLIXU",  "h80aBxH7Rqg",  "dR9sEdS1kJA",  "PEB8uHatmGc",  "Hpng6KwBEk8",  "65CpFDlMljY",  "8Ga3sKMJyz0",  "AQufCIv82eM",  "72kCoEhfIjE",  "bm_ioU4b4fM",  "nxt7kT1plXg",  "V14tscU4gc8",  "zGUd-xTg5Fs",  "BCLXzs5Jxao",  "9eFCtGId4_Q",  "2st-JbmMjlI",  "1QVcXsKAhLY",  "I7mk13Y_hJc",  "nDbxU4US1Rk",  "0bDbnwLsC2E",  "LMGd2cSq4KU",  "aCOnYEP6Kdg",  "WCMwi_12BZA",  "eXNAvEOQcuc",  "3j8A-AGIGmE",  "XO8Cq3b3XCY",  "zPnyWgwatzs",  "LsZNjNwBaTI",  "SDWM_RewRoE",  "Q59iCWigdUQ",  "76VHflXGnH0",  "FNOxiK3POM4",  "1zLHM9nOUg8",  "rcoDHcJZqoA",  "SeeExemtAUw",  "oljUMIqIMZg",  "It8w58fYuPg",  "yJyeevb2OCA",  "PTKcv0ccLfY"]
	const testIds = ids.slice(0,10)
	const getStatsCheck =await getStats(ids)
	const getInfoCheck = await getInfo(ids)
	const infoCheck = JSON.parse(fs.readFileSync(path.join(__dirname, 'getInfoCheck.json')))
	const test = Object.keys(getInfoCheck[0]) == Object.keys(infoCheck[0])
})();
