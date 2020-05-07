(async () => {
	const { statsTidy, fixDates, updateStats, historicTotals } = require("./db");
	// await updateStats();
	const totals = await historicTotals();
	debugger
})();
