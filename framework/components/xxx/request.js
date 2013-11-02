/**
 * Request component class.
 *
 * Use it into a action of controller as [this.request].
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

module.exports = Cube.Class({
	/**
	 * Initialize component.
	 */
	construct: function(req, res) {
		'use strict';

		this.req = req;
		this.res = res;
		this.csrfTokenName = 'CUBE_CSRF_TOKEN';
	},


});