(async () => {
	const { updateStats, historicTotals } = require('./db')
	const stats = await updateStats();
	const check = [...new Set(stats.map(o => o.id))].includes("rcoDHcJZqoA")
	debugger;
	const totals = await historicTotals();
})();
