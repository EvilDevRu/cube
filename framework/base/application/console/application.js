/**
 * Create and run the console application.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Singleton({
	extend: Cube.CApplication,

	/**
	 * @constructor
	 */
	construct: function() {
		this.config = {
			//
		};

		Cube.CApplication.call(this);

		this.protected = {
			addAction: function(){}		//	TODO
		};

		/**
		 * Configure method of application for child application class.
		 *
		 * @param {String} env enviroment
		 * @param callback
		 */
		this.private.appConfigure = function(env, callback) {
			callback();
		};

		/**
		 * Run the socket application.
		 *
		 * @param {Function} callback call function after success initialize application
		 */
		this.private.appRun = function(callback) {
			var dftController = 'index',
				dftAction = 'index',
				argv = require('optimist').argv;

			console.log('CubeFramework v%s started (console application).', Cube.getVersion());

			var module = require(this.basePath + '/controllers/' + dftController + '.js'),
				controller = new module();

			dftAction = 'action' + _.str.ucFirst(dftAction);
			if (!_.isFunction(controller[ dftAction ])) {
				throw 'Controller action not found!';
			}

			//	Parse function arguments.
			var fnArgs = controller[ dftAction ].toString().match(/^function\s.*\((.*)\)/)[1].split(','),
				params = [];

			_.each(fnArgs, function(arg) {
				params.push(argv[ arg.trim() ] || null);
			});

			controller[ dftAction ].apply(controller, params);

			if (_.isFunction(callback)) {
				callback();
			}
		}.bind(this);
	}
});