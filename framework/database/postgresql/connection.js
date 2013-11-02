/**
 * Connection to postgres database class.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	extend: Cube.CSQLConnection,

	/**
	 * @constructor
	 */
	construct: function() {
		Cube.CSQLConnection.call(this);

		this.private = {
			Pg: require('pg'),
			isInit: false
		};
	},

	/**
	 * Connect to database.
	 *
	 * @param {Object} params connection params.
	 * @param {Function} callback
	 */
	connect: function(params, callback) {
		//	XXX:
		params.user = params.username;

		var Connect = function() {
			this.private.connection.connect(function(err) {
				if (err) {
					if (err.code === 'ETIMEDOUT') {
						//	TODO: Throw
						console.error('Timeout connection to postgres!! Reconnect!');
						Connect();
						return;
					}

					if (!this.private.isInit) {
						callback(err);
					}
					return;
				}

				//	TODO: log
				console.log('[postgresql] connection established');

				if (!this.private.isInit) {
					this.private.isInit = true;
					callback();
				}
			}.bind(this));
		}.bind(this);

		this.private.connection = new this.private.Pg.Client(params);
		Connect();
	},

	/**
	 * Disconnect from database.
	 */
	disconnect: function() {
		this.private.client.end();
	},

	/**
	 * Returns a new postgres command class. @see {PgCommand}.
	 *
	 * @param {String} textQuery
	 * @param {Object} params
	 * @return {PgCommand}
	 */
	createCommand: function(textQuery, params) {
		return new Cube.PgCommand(this.private.connection, textQuery, params);
	}
});