# IRC Adapter for Sails.js Framework

### Setup a new Bot

Set up your model

```javascript

// myApp/api/models/My_adapter.js

module.exports = {
	adapter: ['ircAdapter'],
	attributes: {

	}
};
```

Launch the bot on lift()

```javascript

// myApp/api/services/ServiceAdapters.js

module.exports = (function(){

  var botConfig = {
  	    botName:'l33tB0t69',
  	    botHost:'chat.freenode.net',
  	    channels:['#sailsjs'],
  	    events:{
  	        error:console.log,
  	        join:console.log,
  	        part:console.log,
  	        message:console.log,
  	        say:console.log,
  	        registered:console.log
  }

	My_adapter.newBot(botConfig,function newBotCB(err,info){
	    if (err){
	        console.log('Bot Creation Error: '+err);
	    } else {
	        console.log('Bot Creation info:'+info);   
	    }
	});

})();

	
```

There are many more events.  I will document all of them when I can.  


### TODO

	- Verify Options object on all methods.
	- Allow for saving config sets in config.js (and verication of them in registerCollection)
	- Finish writing private event methods
	- Do teardown of bots
	- Allow for joining/leaving multiple channels.  Detect if array or string is supplied in options.
	- Write code to streamAttendance();
