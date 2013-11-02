/**
 * Controller for the socket application base class.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	/**
	 * @constructor
	 * @param {String} controller name
	 */
	construct: function(controller) {
		this.controller = controller;
	},
	
	/**
	 * Emit response to client.
	 * 
	 * @param {Mixed} userId userId or socket
	 * @param {Array} args ... arguments
	 */
	emit: function(userId) {
		//	Find client, emit response and remove userId from arguments
		var client = _.isObject2(userId) ? userId : Cube.app.getClient(userId);
		
		/**
		 * FIXME:
		 * TypeError: Cannot call method 'apply' of undefined
			at Object.module.exports.Class.emit (/var/www/gdma/node/framework/base/controllerSocket.js:31:16)
			at Query._callback (/var/www/gdma/node/application/controllers/contacts.js:325:9)
			at Query.Sequence.end (/var/www/gdma/node/framework/node_modules/mysql/lib/protocol/sequences/Sequence.js:66:24)
			at Query._handleFinalResultPacket (/var/www/gdma/node/framework/node_modules/mysql/lib/protocol/sequences/Query.js:143:8)
			at Query.OkPacket (/var/www/gdma/node/framework/node_modules/mysql/lib/protocol/sequences/Query.js:77:10)
			at Protocol._parsePacket (/var/www/gdma/node/framework/node_modules/mysql/lib/protocol/Protocol.js:172:24)
			at Parser.write (/var/www/gdma/node/framework/node_modules/mysql/lib/protocol/Parser.js:62:12)
			at Protocol.write (/var/www/gdma/node/framework/node_modules/mysql/lib/protocol/Protocol.js:37:16)
			at Socket.ondata (stream.js:38:26)
			at Socket.EventEmitter.emit (events.js:126:20)
		 */
		
		if (client && _.isFunction(client.emit)) {
			client.emit.apply(client, _.rest(_.values(arguments)));
		}
	},
	
	/**
	 * Controller filters
	 * 
	 * @return {Array}
	 */
	filters: function() {
		return [];
	}
});
