(async () => {
	const email = require("./email");
	const { render } = require("json2html");
	const checkForNewVids = require("./checkForNewVids");
	const newVids = await checkForNewVids();
	if(newVids){
		const html = render(newVids);
		const subject = "New videos";
		const info = await email({ subject, html });	
	}
	debugger;
})();
