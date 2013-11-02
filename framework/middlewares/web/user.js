/**
 * User middleware of web application.
 *
 * Allow use user component into a action of controller as [req.user].
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = function(req, res, next) {
	if (!req.middlewares) {
		req.middlewares = {};
	}

	req.middlewares.user = new (Cube.Class({
		/**
		 * @return {Boolean} true if user not authored.
		 */
		isGuest: function() {
			return !req.middlewares.session.get('userId');
		},

		/**
		 * Getter params.
		 *
		 * @param {String} name
		 * @return {Mixed}
		 */
		get: function(name) {
			return req.middlewares.session.get('userParams_' + name);
		},

		/**
		 * Setter params.
		 *
		 * @param {String} name
		 * @param {Mixed} value
		 */
		set: function(name, value) {
			req.middlewares.session.set('userParams_' + name, value);
		},

		/**
		 * Logout user.
		 */
		logout: function() {
			req.middlewares.session.clear();
		}
	}))();

	next();
};