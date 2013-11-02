/**
 * Session middleware for web application class.
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

	req.middlewares.session = new (Cube.Class({
		/**
		 * Getter.
		 *
		 * @param {String} name the session parameter name.
		 * @param {Mixed} defVal
		 * @return {Mixed}
		 */
		get: function(name, defVal) {
			return !_.isUndefined(req.session[ name ]) ? req.session[ name ] : defVal;
		},

		/**
		 * Setter.
		 *
		 * @param {String|Object} name
		 * @param {Mixed} value
		 */
		set: function(name, value) {
			if (_.isObject2(name)) {
				req.session = _.merge(req.session, name);
				return;
			}

			req.session[ name ] = value;
		},

		/**
		 * Clear session.
		 */
		clear: function() {
			req.session.destroy();
		}
	}))();

	next();
};