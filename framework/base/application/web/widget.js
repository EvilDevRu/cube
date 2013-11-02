/**
 * Base widget class.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	abstracts: [
		'init',		//	Initializes the widget. This method is called by WebController.createWidget
					//	after the widget's properties have been initialized.
		'run'		//	Executes the widget.
	],
	
	/**
	 * Construct widget.
	 *
	 * @param {Object} middlewares
	 * @param {Object} params parameters of widget.
	 */
	construct: function(middlewares, params) {
		this.middlewares = middlewares;
		this.params = params || {};
	},
	
	/**
	 * ##
	 */
	render: function(view) {
		//
	}
});
