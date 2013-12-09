/**
 * Main class of Cube framework.
 * Estimated date of start developing 2013-02-28.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

//	The version of Cube framework.
var CUBE_VERSION = '0.2';

global.Cube = require('./helpers/singleton.js')({
	/**
	 * Init.
	 */
	construct: function() {
		var that = this;

		this.async = require('async');
		this.check = require('validator').check;
		this.sanitize = require('validator').sanitize;
		this.fs = require('fs');
		this.sys = require('sys');
		this.crypto = require('crypto');
		this.crc = require('crc');
		this.wrench = require('wrench');

		this.SOCKET_APP = 'socket';
		this.WEB_APP = 'web';
		this.CONSOLE_APP = 'console';

		/**
		 * @var {Object} container for private variables and methods.
		 */
		this.private = {
			/**
			 * @var {Object} Database prefixes.
			 */
			dbPrefixes: {}
		};

		/**
		 * Initialize application.
		 *
		 * @param {Integer} type type of application.
		 */
		this.private.init = function(type) {
			var modules = {},
				appTypeName = 'C' + _.str.ucFirst(type) + 'Application';

			switch (type) {
				case that.SOCKET_APP:
				case that.WEB_APP:
				case that.CONSOLE_APP:
					modules = _.merge(
						that.private.mapCoreClasses,
						require(__dirname + '/base/application/' + type + '/modules.js')
					);
					break;

				default:
					//	TODO: exception
					console.log('Bad application type');
					break;
			}

			_.each(modules, function(path, name) {
				that[ name ] = require(__dirname + path);
			});

			/**
			 * @return {CApplication} the instance of application.
			 */
			that.app = that[ appTypeName ].getInstance();

			/**
			 * @return {String} the type of application.
			 */
			that.app.getAppType = function() {
				return type;
			};

			/**
			 * @return {Boolean} return true if configure application with debug parameter.
			 */
			that.app.getIsDebugMode = function() {
				return that.app.config.debug;
			};

			/**
			 * @return {Object}
			 */
			that.html = require('./helpers/html.js');

			/**
			 * Utils.
			 */
			that.utils = {};
		};

		/**
		 * @var {Object} map of modules for core Cube classes.
		 */
		this.private.mapCoreClasses = {
			Class: '/helpers/class.js',
			Singleton: '/helpers/singleton.js',
			CApplication: '/base/application/application.js',
			ModelManager: '/database/modelManager.js',
			CSQLConnection: '/base/database/sql/connection.js',
			CSQLBuilder: '/base/database/sql/builder.js',
			CSQLCommand: '/base/database/sql/command.js',
			CSQLTableSchema: '/base/database/sql/tableSchema.js',
			CSQLActiveQuery: '/base/database/sql/activeQuery.js',
			CSQLActiveRecord: '/base/database/sql/activeRecord.js'
		};
	},

	/**
	 * @return {String} returns the version of Cube framework.
	 */
	getVersion: function() {
		return CUBE_VERSION;
	},

	/**
	 * Translates an alias into a file path.
	 * Note, this method does not ensure the existence of the resulting file path.
	 * It only checks if the root alias is valid or not.
	 *
	 * @param {String} alias
	 * @return {Mixed} file path corresponding to the alias, false if the alias is invalid.
	 */
	getPathOfAlias: function(alias) {
		//	TODO: caching
		var parts = alias.split('.');
		switch (parts[0]) {
			case 'app':
				parts[0] = this.app.basePath;
				break;

			case 'core':
				parts[0] = this.app.corePath;
				break;

			default:
				return false;
		}

		return parts.join('/');
	},

	/**
	 * Create web application.
	 *
	 * @param {String} appDir path to application directory.
	 * @param {Function} callback
	 */
	createWebApplication: function(appDir, callback) {
		this.private.init(this.WEB_APP);
		this.app.create(appDir, function() {
			this.run(callback);
		});
	},

	/**
	 * Create socket application.
	 *
	 * @param {String} appDir path to application directory.
	 * @param {Function} callback
	 */
	createSocketApplication: function(appDir, callback) {
		this.private.init(this.SOCKET_APP);
		this.app.create(appDir, function() {
			this.run(callback);
		});
	},

	/**
	 * Create console application.
	 *
	 * @param {String} appDir path to application directory.
	 * @param {Function} callback
	 */
	createConsoleApplication: function(appDir, callback) {
		this.private.init(this.CONSOLE_APP);
		this.app.create(appDir, function() {
			this.run(callback);
		});
	},

	/**
	 * Run the application.
	 */
	run: function(callback) {
		this.app.run(callback);
	}
}).getInstance();