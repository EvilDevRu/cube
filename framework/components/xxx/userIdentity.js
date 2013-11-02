/**
 * User identity component.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */
module.exports = UserIdentityComponent = Cube.Class({
	abstracts: [ 'auth' ],
	
	/**
	 * Init.
	 * 
	 * @param {String} login user login.
	 * @param {String} password user password.
	 */
	construct: function(login, password) {
		'use strict';
		
		/**
		 * Returns login.
		 * 
		 * @return {String}
		 */
		this.getLogin = function() {
			return login;
		}
		
		/**
		 * Returns password.
		 * 
		 * @return {String}
		 */
		this.getPassword = function() {
			return password;
		}
	}
});
