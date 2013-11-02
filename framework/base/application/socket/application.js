/**
 * Socket application class file.
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
		var that = this,
			clients = {},		/** @var {Object} connected clients. **/
			functions = {};		/** @var {Object} functions for bind to a client event. **/

		this.config = {
			application: {
				socket: {
					//authorization: true,
					minification: true,
					etag: true,
					gzip: true,
					logLevel: 1,
					flashSocket: false
				}
			}
		};

		Cube.CApplication.call(this);

		/**
		 * Configure method of application for child application class.
		 *
		 * @param {String} env enviroment
		 * @param callback
		 */
		this.private.appConfigure = function(env, callback) {
			var config = that.config.application,
				cookie = require('cookie'),
				express = require('express');

			/**
			 * @return {Object} session storage.
			 */
			var GetSessionStorage = function() {
				switch (config.session.store) {
					case 'redis':
						return express.session.MemoryStore();
						//var RedisStore = require('connect-redis')(express);
						//return RedisStore(config.session);

					case 'memory':
						return express.session.MemoryStore();

					default:
						//	TODO: warn
						console.warn('Select memory session. Check your config file!');
						return express.session.MemoryStore();
				}
			};

			var storeSession = new GetSessionStorage();

			that.socket = require('socket.io').listen(config.port, config.host);

			that.socket.configure(function() {
				var transports = [
					'websocket',
					'htmlfile',
					'xhr-polling',
					'jsonp-polling'
				];

				if (config.socket.flashSocket) {
					transports[0] = 'flashsocket';
					transports.unshift('websocket');
				}

				//	Send minified client.
				if (config.socket.minification) {
					that.socket.enable('browser client minification');
				}

				//	Apply etag caching logic based on version number.
				if (config.socket.etag) {
					that.socket.enable('browser client etag');
				}

				//	GZip the file.
				if (config.socket.gzip) {
					that.socket.enable('browser client gzip');
				}

				that.socket.set('log level', config.socket.logLevel || 1);
				that.socket.set('transports', transports);

				//	Authorization clients.
				//	TODO: No authorized.
				//	TODO: Use middleware for auth.
				that.socket.set('authorization', function(handshakeData, accept) {
					if (!handshakeData.headers.cookie) {
						accept(null, true);
						return;
					}

					handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
					handshakeData.sessionID = handshakeData.cookie[ config.session.key ];
					if (!handshakeData.sessionID) {
						accept(null, true);
						return;
					}

					storeSession.get(handshakeData.sessionID, function(error, session) {
						if (error) {
							//	TODO: Throw
							accept(error);
							return;
						}

						handshakeData.session = session;
						accept(null, true);
					});
				});
			});

			callback();
		};

		/**
		 * Run the socket application.
		 *
		 * @param {Function} callback call function after success initialize application
		 */
		this.private.appRun = function(callback) {
			var config = that.config.application;

			that.socket.sockets.on('connection', function(socket) {
				socket.session = {};

				//if (config.socket.authorization ) {

/*				if (config.socket.authorization) {
					//	Find user id value.
					var userIdMap = (config.socket.userIdAlias).split('/'),
						userId = socket.handshake.session;

					for (var value in userIdMap) {
						if (_.isUndefined(userId[ userIdMap[ value ] ])) {
							//	TODO: warn
							console.warn('Session is invalid');
							return;
						}

						userId = userId[ userIdMap[ value ] ];
					}

					if (!userId) {
						return;
					}

					socket.session = socket.handshake.session;
					socket.session.userId = userId;

					//	TODO: debug log
					console.log('[socket] user #%d is online', userId);
				}*/

				//	Register a client.
				//that.setClient(socket.session.userId, socket);

				//	Binding a functions.
				_.each(that.protected.getActions(), function(fnsChain, route) {
					var components = {},
						middlewares = _.initial(fnsChain),
						action = _.last(fnsChain);

					/*jshint -W089 */
					for (var k in middlewares) {
						middlewares[ k ] = _.bind(middlewares[ k ], { socket: socket }, components);
					}

					var ActionWrapper = function() {
						Cube.async.waterfall(
							middlewares,
							function(err) {
								if (err) {
									//	TODO: Throw.
									return;
								}

								action.call(socket, components);
							});
					};

					//	FIXME:
					socket.on(route, ActionWrapper);
				});

				//	TODO: Disconnect user event
				socket.on('disconnect', that.onDisconnect || function() {});
			});

			if (_.isFunction(callback)) {
				callback();
			}
		};

		/**
		 * Returns a client socket by user id.
		 * If this user is not online returns empty object.
		 *
		 * @param {Mixed} clientId user id.
		 * @return {Object} client socket.
		 */
		this.getClient = function(clientId) {
			return clients[ clientId ] || {};
		};

		/**
		 * Set a socket client.
		 * If this socket is exist then rewrite it.
		 * If `socket` is null then delete a socket user.
		 *
		 * @param {Mixed} clientId user id.
		 * @param {Object} socket user socket.
		 */
		this.setClient = function(clientId, socket) {
			if (!socket) {
				delete clients[ clientId ];
				return;
			}

			clients[ clientId ] = socket;
		};

		/**
		 * Returns functions for binding to a client event.
		 *
		 * @return {Object} functions
		 */
		this.protected.getActions = function() {
			return functions;
		};

		/**
		 * Set a function for bind to a client event.
		 * TODO: middlewares.
		 * TODO: JSDoc params.
		 *
		 * @param {String|Array} r action of route for a bind function.
		 * @param {Array} fnsChain chain of functions for execute at route.
		 */
		this.protected.addAction = function(r, fnsChain) {
			var //that = this,
				routes = _.isArray(r) ? r : [ r ];

			_.each(routes, function(route) {
				functions[ route ] = fnsChain;//action.bind(Cube.CSocketController);
			});
		};
	}
});