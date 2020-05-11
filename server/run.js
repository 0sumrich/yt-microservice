(async () => {
	require("dotenv").config();
	const { checkForNewVids } = require("./db");
	const email = require('./email')
	const newVids = await checkForNewVids();
	const {FROM, TO} = process.env
	try {
		const emailRes = await email({from:FROM, to: 'lynchardrich@gmail.com', subject:'test', html:'<p>hello you big basterd</p>'})	
	} catch (e) {
		if (e) {
			// don't update the database
		}
	}
	
	debugger;
})();
