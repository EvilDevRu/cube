/**
 * Connection to redis database class.
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
	 */
	construct: function() {
		this.private = {
			Redis: require('redis')
		};
	},

	/**
	 * Connect to database.
	 *
	 * @param {Object} params connection params.
	 * @param {Function} callback
	 */
	connect: function(params, callback) {
		try {
			this.private.client = this.private.Redis.createClient(params.port, params.host, params);
			if (!_.isEmpty(params.password)) {
				this.private.client.auth(params.password);
			}

			/**
			 * Setting redis.
			 */
			var Setting = function(err) {
				if (err) {
					callback(err);
					return;
				}

				this.private.client.on('error', function(err) {
					//	TODO: Throw
					console.log(err);
				});

				console.log('[redis] connection established');
				callback();
			}.bind(this);

			if (_.isNumber(params.database)) {
				this.private.client.select(params.database, Setting);
				return;
			}

			Setting();
		}
		catch (err) {
			//	TODO: Throw
			console.log('[redis] connection failed (%s)', err);
			callback(err);
		}
	},
	
	/**
	 * Disconnect from database.
	 */
	disconnect: function() {
		this.private.client.end();
		console.log('[redis] disconnect');
	},

	/**
	 * @param {String} name (optional).
	 * @return {Object} redis command.
	 */
	command: function(name) {
		return name ? this.private.client[ name ] : this.private.client;
	}
});