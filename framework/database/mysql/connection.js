/**
 * Connection to MySQL database class.
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
			MySQL: require('mysql')
		};
	},

	/**
	 * Connect to database.
	 *
	 * @param {Object} params connection params.
	 * @param {Function} callback
	 */
	connect: function(params, callback) {
		//	FIXME: Correcting
		params.user = params.username;
		delete params.username;

		var isInit = false;

		/**
		 * MySQL query format.
		 */
		var QueryFormat = function() {
			this.private.connection.config.queryFormat = function(query, values) {
				if (!values) {
					return query;
				}

				return query.replace(/\$([1-9]+)/g, function(txt, key) {
					if (values.hasOwnProperty(key - 1)) {
						return this.private.connection.escape(values[ key - 1 ]);
					}

					return txt;
				}.bind(this));
			}.bind(this);
		}.bind(this);

		/**
		 * Reconnecting to MySQL server if connection has been lost.
		 */
		var hDisconnect = function() {
			this.private.connection = this.private.MySQL.createConnection(params);
			this.private.connection.connect(function(err) {
				if (err) {
					//	TODO: Throw
					console.log('error when connecting to db:', err);
					setTimeout(hDisconnect, 2000);
					return;
				}

				this.private.connection.on('error', function(err) {
					//	TODO: Throw
					console.log('db error', err);

					if (err.code === 'PROTOCOL_CONNECTION_LOST') {
						hDisconnect();
					} else {
						throw err;
					}
				});

				QueryFormat();

				if (!isInit) {
					callback();
					isInit = true;
				}
			}.bind(this));
		}.bind(this);

		hDisconnect();
	},

	/**
	 * Disconnect from database.
	 */
	disconnect: function() {
		this.private.connection.destroy();
	},

	/**
	 * Returns a new postgres command class. @see {MyCommand}.
	 *
	 * @param {String} textQuery
	 * @param {Object} params
	 * @return {MyCommand}
	 */
	createCommand: function(textQuery, params) {
		return new Cube.MyCommand(this.private.connection, textQuery, params);
	}
});