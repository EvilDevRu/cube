/**
 * User component class.
 *
 * Use it into a action of controller as [this.user].
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

module.exports = Cube.Class({
	/**
	 * Initialize component.
	 *
	 * @param {Object} req require express argument.
	 */
	construct: function(req) {
		'use strict';

		var session = req.session || {},
			userId = session.userId || null;

		/**
		 * Returns user type.
		 *
		 * @return {Boolean} returns true if user is authorized.
		 */
		this.isGuest = function() {
			return _.isUndefined(userId);
		};
	},

	/**
	 * User authentication.
	 * 
	 * @param {Object} req
	 * @param {Integer} access access level for login.
	 * @param {Function} callback with two attributes: errors and success authorisation.
	 */
	auth: function(req, access, callback) {
		'use strict';
		
		//Cube.model.mysql('user').find({ login:  })
	}
});