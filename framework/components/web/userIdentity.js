/**
 * User identity base component class.
 *
 * @see https://github.com/ttezel/twit
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	/**
	 * @param {String} username
	 * @param {String} password
	 *
	 * @constructor
	 */
	construct: function(username, password) {
		var identity;

		this.username = username;
		this.password = password;

		//	Error messages.
		this.ERROR_USERNAME_INVALID = 'Invalid user name';
		this.ERROR_PASSWORD_INVALID = 'Invalid user password';

		/**
		 * @return {Integer} user id.
		 */
		this.getId = function() {
			return identity;
		};

		/**
		 * Set user id;
		 *
		 * @return {Integer} user id.
		 */
		this.setId = function(id) {
			identity = id;
		};
	},

	authenticate: function(callback) {
		//	TODO: Throw
		console.warn('You have not overridden `authenticate` method!');
		callback();
	}
});