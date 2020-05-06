(async () => {
	const { statsTidy } = require("./db");
	await statsTidy();
})();
