/**
 * Controller base class for web application.
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
	 * @param {String} controller controller name.
	 */
	construct: function(controller) {
		this.controller = controller;
		this.layout = 'default';
		this.viewDir = controller.toLowerCase() + '/';
	},
	
	/**
	 * Controller filters.
	 * 
	 * @return {Array}
	 */
	filters: function() {
		return [];
	}
});
