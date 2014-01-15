

var utils = {
	doesBotExist: function(allBots,botName){
    	for (bot in allBots){
    		console.log('Is it '+bot);
    		if (bot.toLowerCase() === botName.toLowerCase())
    			return true;
    	}
    	return false;
	},
	getDate: function(){
			var theTime = new Date().getTime();
			return theTime;
		},
	makeRequest: function(requestURL,requestMethod,params){
		// request({url: requestURL,
		// 	form: params
		// });
	}
};
module.exports = utils;
