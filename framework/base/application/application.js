/**
 * CApplication base class file.
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
		if (!process.env.NODE_ENV) {
			process.env.NODE_ENV = 'development';
		}

		/**
		 * @var {Object} container for protected variables and methods.
		 */
		this.protected = {};

		/**
		 * @var {Object} container for private variables and methods.
		 */
		this.private = {
			/**
			 * @var {Object} map of child methods for execute.
			 */
			mapMethods: [],

			/**
			 * @var {Object} configuration of application by default.
			 */
			defaultConfig: {
				debug: true,					//	Debug mode. Enabled by default.
				//database: false,
				application: {
					host: 'localhost',
					port: 3030,
					profiler: false,			//	Profiler. Using "Look" by default.
					language: 'ru',
					session: {
						key: 'sessionId',
						store: 'memory',
						secret: 'cubesecret',
						maxAge: 3600,
						userAlias: 'userId'
					}
				},
				autoload: {
					components: {},
					middlewares: {},
					filters: {},
					utils: {}
				},
				utils: {}						//	TODO
			},

			/**
			 * Configure method of application for child application class.
			 *
			 * @param error
			 * @param callback
			 */
			appConfigure: function(err, callback) {
				callback(err);
			},

			/**
			 * Run method of application for child application class.
			 *
			 * @param error
			 * @param callback
			 */
			appRun: function(err, callback) {
				callback(err);
			}
		};
	},

	/**
	 * Initialize and run the application.
	 *
	 * @param {String} appDir path to application directory.
	 * @param {Function} initCallback
	 */
	create: function(appDir, createCallback) {
		var that = this;

		this.basePath = appDir || (__dirname + '/../../../application');
		this.corePath = __dirname + '/../..';

		/**
		 * Здесь происходит загрузка самого приложения. По умолчанию
		 * выполняются только методы из ядра, которые могут быть расширены
		 * потомками.
		 */

		var methods = _.merge([
			/**
			 * Configure the application.
			 *
			 * @param {Function} callback
			 */
			function(callback) {
				//	FIXME: Exception if config not found!
				var files = Cube.fs.readdirSync(that.basePath + '/config');
				for (var i in files) {
					if (files.hasOwnProperty(i)) {
						var env = _.baseName(files[ i ], '.js');
						if (process.env.NODE_ENV !== env) {
							continue;
						}

						that.config = _.merge(
							that.private.defaultConfig,
							that.config,
							require(that.basePath + '/config/' + files[ i ])
						);

						that.private.appConfigure(env, callback);
						return;
					}
				}

				//	TODO: Throw
				callback('Configuration file not found.');
			},

			/**
			 * Initialize profiler.
			 */
			function(callback) {
				var profiler = that.config.application.profiler,
					host = profiler.host || '127.0.0.1',
					port = profiler.port || 5959;

				if (profiler) {
					require('look').start(port, host);
				}

				callback();
			},

			/**
			 * Load database drivers and established connection.
			 *
			 * @param {Function} callback
			 */
			function(callback) {
				var config = that.config.database,
					drivers = [];

				/**
				 * Recursive loading database drivers.
				 */
				var LoadDriverRecursive = function() {
					if (!drivers.length) {
						//	TODO: Throw
						if (_.isEmpty(config.default)) {
							callback('database driver not selected by default!');
							return;
						}

						that.db = that[ config.default ];
						callback();
						return;
					}

					var driver = drivers.splice(0, 1);

					require(Cube.getPathOfAlias('core.database.' + driver) + '/bootstrap.js')(function(err) {
						if (err) {
							callback(err);
							return;
						}

						LoadDriverRecursive();
					});
				};

				//	Generate database list driver for loading.
				_.each(config, function(value, key) {
					if (_.isObject2(config[ key ])) {
						drivers.push(key);
					}
				});

				if (drivers.length) {
					LoadDriverRecursive();
					return;
				}

				callback();
			},

			/**
			 * Init model manager.
			 *
			 * @param callback
			 */
			function(callback) {
				Cube.models = new Cube.ModelManager(callback);
			},

			/**
			 * Loading filters, components and middlewares.
			 *
			 * @param callback
			 */
			function(callback) {
				var middlewares = [],
					list = [
						'components',
						'middlewares',
						'filters',
						'utils'
					];

				/**
				 * Load modules.
				 *
				 * @param {String} path
				 * @param {String} type
				 * @param {Boolean} isAppDir
				 * @return {Array}
				 */
				var Load = function(path, type, isAppDir) {
					var autoloadType = type,
						modules = [];

					if (isAppDir) {
						type = 'users' + _.ucFirst(type);
					}

					if (!Cube[ type ]) {
						Cube[ type ] = {};
					}

					_.each(Cube.fs.readdirSync(path), function(file) {
						var name = _.ucFirst(_.baseName(file, '.js')),
							postfix = _.ucFirst(autoloadType).substr(0, autoloadType.length - 1),
							moduleName = name + postfix,
							state = Cube.app.config.autoload[ autoloadType ][ _.lcFirst(name) ];

						//	Check module state.
						if (!_.isUndefined(state) && state === false) {
							return;
						}

						//	If module is exist, move he as parent.
						if (Cube[ moduleName ]) {
							Cube[ name + 'Base' + postfix ] = Cube[ moduleName ];
						}

						Cube[ name + postfix ] = require(path + '/' + file);
						modules.push(name + postfix);

						//	If is component and it have singleton pattern.
						if (postfix === 'Component' && _.isFunction(Cube[ moduleName ].getInstance)) {
							Cube.app[ _.lcFirst(name) ] = Cube[ moduleName ].getInstance();
						}
						else if (postfix === 'Util' && _.isFunction(Cube[ moduleName ].getInstance)) {
							Cube.utils[ _.lcFirst(name) ] = Cube[ moduleName ].getInstance();
						}
					});

					return modules;
				};

				_.each(list, function(type) {
					var corePath = Cube.getPathOfAlias('core.' + type) + '/' + Cube.app.getAppType(),
						appPath = Cube.getPathOfAlias('app.' + type) + '/' + Cube.app.getAppType(),
						modules = Load(corePath, type);

					if (_.isDir(appPath)) {
						modules = _.merge(modules, Load(appPath, type, true));
					}

					if (type === 'middlewares') {
						middlewares = modules.reverse();
					}
				});

				callback(null, middlewares);
			},

			/**
			 * Before bind actions.
			 * User method.
			 *
			 * @param middlewares
			 * @param callback
			 */
			function(middlewares, callback) {
				if (_.isFunction(that.config.beforeBind)) {
					that.config.beforeBind(middlewares, callback);
					return;
				}

				callback(null, middlewares);
			},

			/**
			 * Load controllers.
			 *
			 * @param {Array} middlewares loaded middlewares.
			 * @param {Array} filters loaded filters.
			 * @param callback
			 */
			function(middlewares, callback) {
				var ctlPath = that.basePath + '/controllers/',
					fControllers = Cube.fs.readdirSync(ctlPath);

				//	Bind actions.
				_.each(fControllers, function(ctlName) {
					var module = require(ctlPath + ctlName),
						actNames = _.keys(module.prototype),
						controller = new module(_.baseName(ctlName, '.js')),
						routes = controller.routes(),
						filters = controller.filters();

					_.each(actNames, function(actName) {
						if (actName.substr(0, 6) !== 'action') {
							return;
						}

						var fnsChain = [ controller[ actName ].bind(controller) ],
							route = _.lcFirst(actName.substr(6));

						//	Bind filters (3).
						_.each(filters, function(filter) {
							fnsChain.unshift(Cube[ filter + 'Filter' ].bind(controller));
						});

						//	Bind users middlewares (2).
						_.each(middlewares, function(name) {
							fnsChain.unshift(Cube[ name ]);
						});

						//	Bind system middlewares (1).
						/*_.each(Cube.middlewares, function(middleware) {
							fnsChain.unshift(middleware);
						});*/

						that.protected.addAction(routes[ route ], fnsChain);
					});
				});

				//	Bind 404 page.
				var fnsChain = [ function(req) {
					//	TODO: Throw
					req.error(this, 404, 'Запрашиваемая страница не найдена');
				} ];

				_.each(middlewares, function(name) {
					fnsChain.unshift(Cube[ name ]);
				});

				that.protected.addAction('*', fnsChain);

				callback();
			}
		], this.private.mapMethods);

		Cube.async.waterfall(methods, function(err) {
			//	TODO: Throw
			if (err) {
				throw err;
			}

			createCallback.call(that);
		});
	},

	/**
	 * Run the application.
	 *
	 * @param {Function} callback invoke after run child.
	 */
	run: function(callback) {
		/**
		 * Run wrapper.
 		 */
		var RunWrapper = function() {
			//	TODO: error argument.
			this.private.appRun(function() {
				if (_.isFunction(this.config.afterRun)) {
					this.config.afterRun(_.isFunction(callback) ? callback : function() {});
					return;
				}

				if (_.isFunction(callback)) {
					callback();
				}
			}.bind(this));
		}.bind(this);

		if (_.isFunction(this.config.beforeRun)) {
			this.config.beforeRun(RunWrapper);
			return;
		}

		RunWrapper();
	},
	
	/**
	 * Terminates the application.
	 *
	 * @param {Integer} status exit status (value 0 means normal exit
	 *  while other values mean abnormal exit).
	 */
	end: function(status) {
		process.exit(status ? status : 0);
	}
});
