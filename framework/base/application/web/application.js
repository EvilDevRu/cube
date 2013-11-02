/**
 * Create and run the web application.
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
		var that = this;

		this.config = {
			application: {
				template: {
					type: 'ect'
				},

				errors: {
					404: {
						view: 'errors/404',
						pageTitle: '404: Страница не найдена'
					},
					500: {
						view: 'errors/500'
					},
					'unknown': {
						view: 'errors/unknown',
						pageTitle: 'Unknown error'
					}
				}
			}
		};

		Cube.CApplication.call(this);

		this.private.mapMethods = [
			/**
			 * Load widgets.
			 *
			 * @param {Function} callback
			 */
			function(callback) {
				var pathes = [
					Cube.getPathOfAlias('core.widgets'),
					Cube.getPathOfAlias('core.widgets.bootstrap')
				];

				_.each(pathes, function(path) {
					_.each(Cube.fs.readdirSync(path), function(fileName) {
						var fullName = path + '/' + fileName,
							comName = 'C' + _.ucFirst(_.baseName(fileName, '.js')) + 'Widget';

						if (_.isFile(fullName)) {
							Cube[ comName ] = require(fullName);
						}
					});
				});

				callback();
			}
		];

		/**
		 * Configure method of application for child application class.
		 *
		 * @param {String} env enviroment
		 * @param callback
		 */
		this.private.appConfigure = function(env, callback) {
			var config = that.config.application;
			config.session.pass = config.session.password;	//	XXX:

			that.private.Express = require('express');
			that.private.express = that.private.Express();

			/**
			 * @return {Object} session storage.
			 */
			var GetSessionStorage = function() {
				switch (config.session.store) {
					case 'redis':
						var RedisStore = require('connect-redis')(that.private.Express);
						return new RedisStore(config.session);

					case 'memory':
						return that.private.Express.session.MemoryStore();

					default:
						//	TODO: warn
						console.warn('Select memory session. Check your config file!');
						return that.private.Express.session.MemoryStore();
				}
			};

			/**
			 * @return {Object} template engine.
			 */
			var TemplateEngine = function() {
				switch (config.template.type.toLowerCase()) {
/*					case 'dot':
						that.private.express.set('view engine', '.html');
						that.private.express.engine('.html', require('express-dot').__express);
						break;*/

					case 'ect':
						//	TODO: read params from config.
						var ECT = require('ect');
						that.private.express.set('view engine', '.ect');
						that.private.express.engine('.ect', ECT({
							watch: true,
							root: that.basePath + '/views'
						}).render);
						break;

					default:
						//	TODO: Throw
						console.log('Template engine is invalid');
						break;
				}

				that.private.express.set('views', that.basePath + '/views');
			};

			that.private.express.configure(function() {
				TemplateEngine();

				that.private.express.use(that.private.Express.bodyParser());
				that.private.express.use(that.private.Express.methodOverride());
				that.private.express.use(that.private.Express.static(that.basePath + '/public'));
				that.private.express.set('view options');

				if (env === 'development') {
					//	TODO: errors
					that.private.express.use(function(err, req, res, next) {
						console.error(err.stack);
						res.send(500, 'Something broke!');
						next();
					});
				}

				that.private.express.use(that.private.Express.cookieParser());
				that.private.express.use(that.private.Express.session({
					secret: config.session.secret,
					maxAge: new Date(Date.now() + config.session.maxAge * 1000),
					store: GetSessionStorage()
				}));
			});

			callback();
		};

		/**
		 * Run the socket application.
		 *
		 * @param {Function} callback call function after success initialize application
		 */
		this.private.appRun = function(callback) {
			that.private.express.listen(that.config.application.port, that.config.application.host, callback);
		};

		/**
		 * Add new action of the controller.
		 *
		 * @param {String|Array} r action of route for a bind function.
		 * @param {Array} fnsChain chain of functions for execute at route.
		 */
		this.protected.addAction = function(r, fnsChain) {
			var routes = _.isArray(r) ? r : [ r ],
				lastFn = _.last(fnsChain);

			/**
			 * Replacing arguments of last function.
			 */
			fnsChain[ fnsChain.length - 1 ] = function() {
				delete arguments[1];
				arguments[0] = arguments[0].middlewares || {};
				lastFn.apply(this, arguments);
			};

			fnsChain.unshift('');
			_.each(routes, function(route) {
				fnsChain[0] = route;
				that.private.express.get.apply(that.private.express, fnsChain);
				that.private.express.post.apply(that.private.express, fnsChain);
				that.private.express.delete.apply(that.private.express, fnsChain);
				that.private.express.put.apply(that.private.express, fnsChain);
			});
		};
	}
});