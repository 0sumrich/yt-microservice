(async () => {
	const {updateStats, historicTotals2} = require('./db')
	const stats = await updateStats();
	const totals = await historicTotals2();
})();
