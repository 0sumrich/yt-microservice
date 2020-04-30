(async () => {
	const {updateStats, historicTotals} = require('./db')
	// const stats = await updateStats();
	const totals = await historicTotals();
	debugger;
})()