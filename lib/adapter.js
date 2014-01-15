/**
 * Module dependencies
 */
var _ = require('lodash');

var irc = require('irc');
var async = require('async');
var utils = require('./utils');
/**
 * @type {Adapter}
 */

/*
TODO
	Verify Options object on all methods.
	Allow for saving config sets in config.js (and verication of them in registerCollection)
	Finish writing private event methods
	Do teardown of bots
	Allow for joining/leaving multiple channels.  Detect if array or string is supplied in options.
	Write code to streamAttendance();
*/


var __event = {
	join:function(botName, customEventFN, channel, nick, message){
//		console.log('Private join event\nChannel:'+channel+' nick:'+nick+' message:'+JSON.stringify(message));

		var getArgs = Array.prototype.slice.call(arguments);
		var allButTheLast = getArgs.slice(2,getArgs.length);
		customEventFN.apply(null, allButTheLast);
	//}
	// },
	// say:function(){

	// },
	// error:function(){

	 },
	 registered:function(botName, customEventFN, message){
	 	console.log(botName+' has registered');

		var getArgs = Array.prototype.slice.call(arguments);
		var allButTheLast = getArgs.slice(2,getArgs.length);
		customEventFN.apply(null, allButTheLast);
	 }
}



module.exports = (function() {

	// model configurations
	var _modelConfigs = {};
	
	/**
	 * Each connection in this adapter maintains an IRC server,
	 * an IRC channel, a username, and a password.
	 * 
	 * @type {Object}
	 */

	var Adapter = {
		identity: 'sails-irc',
		// My defaults (for ALL IRC servers)
		defaults: {
			messagePostBack:'http://localhost:1337/chat',
			attendancePostBack:'http://localhost:1337/attendance'
		},
		bots:{

		},

		// This method runs when a model is initially registered at lift-time.
		registerCollection: function(model, cb) {
			console.log('IRC Adapter loaded.');
            // Clone the configuration just in case (to avoid mutating it on accident)
            var ircConfig = _.cloneDeep(model.config);

            // Store each model config for later.
            _modelConfigs[model.identity] = ircConfig;


            // Validate our configuration.
			// Require that the host, nick, and channel config exists.

			// Open out connection to the IRC server (login, connect to channel, etc.)

			cb();
		},

	// Creates new bot on IRC network and replies with a unique bot id
    newBot:function(model,options,cb){

	    	// Check to see if a bot already exists by the given name.
	    	for (bot in Adapter.bots){
	    		if (bot.botName === options.botName){
	    			var botCreateError = new Error('Sorry Homie.  This bot already exists');
	    			return cb(botCreateError)
	    		}
	    	}

			var possibleEvents = ['say','error','raw','channellist','registered','motd','names','names#channel','topic','join','join#channel','part','part#channel','quit','kick','kick#channel','kill','message','message#','message#channel','notice','ping','pm','ctcp','ctcp-notice','ctcp-privmsg','ctcp-version','nick','invite','+mode','-mode','whois','channellist_start','channellist_item']

			// Validate the options

			for (eventName in options.events){
				if (possibleEvents.indexOf(eventName) < 0){
					return cb(new Error(eventName+' is not a valid event name.'))
				}
			}

			var newBot = {
			    theBot: new irc.Client(options.botHost, options.botName, {autoConnect: false, autoRejoin: true, channels: options.channels}),
			    botName: options.botName,
			    botHost: options.botHost,
			    channels: options.channels,
			    events:{}
			}

			//	Push Internal event methods to array which will contain all functions that will be executed on event fire

			for (var eventName in options.events)
					newBot.events[eventName] = options.events[eventName];


			// Register all events supplied in options on new Bot. 

			for (var eventName in newBot.events){
				if (__event[eventName]){
					var callThis = __event[eventName].bind(undefined, newBot.botName, newBot.events[eventName]);
					newBot.theBot.addListener(eventName,callThis);
				 } else {
					newBot.theBot.addListener(eventName,newBot.events[eventName]);
				}
			}

			Adapter.bots[options.botName] = newBot;

			Adapter.bots[options.botName].theBot.connect(function(serverResponse){

				if (serverResponse.args[0] !== options.botName){
					var nameTaken = new Error('Name taken.  You get '+serverResponse.args[0]+' instead');
					return cb(nameTaken,serverResponse);
				} else {
					return cb(null,JSON.stringify(serverResponse));
				}


			})

    },
	// Lists all bots in memory that are curently active
    findBot:function(model,options,cb){
    	var botList = [];
    	for (bot in Adapter.bots){
    		botList.push({botName:bot,channels:Adapter.bots[bot].theBot.chans});
    	}
    	return cb(null,botList);
    },
	// destroys bot with given ID
    destroyBot:function(model,options,cb){
    	if (utils.doesBotExist(Adapter.bots,options.botName)){
    		console.log(options.botName+' destroyed!');
			Adapter.bots[bot].delete;
    		return cb(null,true);
		} else {
			return cb(new Error('That bot doesn\'t exist'))
		}
    },
	// Allows you to change event logic on active bots
    updateBot:function(model,options,cb){

    },
	// Bot of choice speaks to channel of choice
    speak:function(model,options,cb){
    	if (utils.doesBotExist(Adapter.bots,options.botName)){
			var getBot = Adapter.bots[options.botName].theBot;
	    	getBot.say(options.channel, options.message);
	    	return cb(null,'Well, we sent the message');
	    } else {
			return cb(new Error('That bot doesn\'t exist'))
	    }
    },
    // get list of users in a channel that active bot is in
    getChannelInfo:function(model,options,cb){
    	if (utils.doesBotExist(Adapter.bots,options.botName)){
			var getBot = Adapter.bots[options.botName].theBot;

	    } else {
			return cb(new Error('That bot doesn\'t exist'))
	    }
    },
	// Bot of choice joins channel of choice
    joinChannel:function(model,options,cb){
    	if (utils.doesBotExist(Adapter.bots,options.botName)){
			var getBot = Adapter.bots[options.botName].theBot;

			getBot.join(options.channels,console.log);

			var getChannels = JSON.stringify(Adapter.bots[options.botName].theBot.chans);

			return cb(null,getChannels);
	    } else {
			return cb(new Error('That bot doesn\'t exist'))
	    }
    },
    leaveChannel:function(model,options,cb){
    	if (utils.doesBotExist(Adapter.bots,options.botName)){
			var getBot = Adapter.bots[options.botName].theBot;

			var getChannels = JSON.stringify(Adapter.bots[options.botName].theBot.chans);

			getBot.part(options.channels,console.log);

			return cb(null,getChannels);
	    } else {
			return cb(new Error('That bot doesn\'t exist'))
	    }
    },
	teardown: function(cb) {
			console.log('tearing down a model..');

			// TODO: kill IRC connection (it'll happen anyways, but not a bad idea to try it)
			cb();
		}
	};


	return Adapter;



	/**
	 * Extend usage options with model configuration
	 * (which also includes adapter defaults)
	 * @api private
	 */
	// function _extendOptions(modelIdentity, options) {

	// 	// Ignore unexpected options, use {} instead
	// 	options = _.isPlainObject(options) ? options : {};

	// 	// Apply model defaults, if relevant
	// 	if (modelIdentity) {
	// 		return _.extend({}, _modelConfigs[modelIdentity], options);
	// 	}
	// 	return _.extend({}, options);
	// }

})();
