/**
 * Controller of a posts.
 * 
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

/* global Cube */

module.exports = Cube.Class({
	extend: Cube.CSocketController,
	
	/**
	 * Returns pathes for bind a functions.
	 * 
	 * @return {Object}
	 */
	routes: function() {
		'use strict';
		return {
			index: '/index'
		};
	},
	
	/**
	 * Emit all posts.
	 */
	actionIndex: function(coms) {
		'use strict';

		this.bigData = new Array(1e6).join('*');
		console.log(process.memoryUsage().heapUsed / 1024 / 1024);
	}
});
