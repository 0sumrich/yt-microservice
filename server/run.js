(async () => {
	require("dotenv").config();
	const email = require('./email')
	const info = await email({ subject: 'test', text: 'testing testing' })
	console.log(info)
})();
