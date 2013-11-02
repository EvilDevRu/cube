/**
 * Index controller.
 * Example for CubeFramework version 0.2.
 * 
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */
module.exports = IndexController = Cube.Class({
	extend: Cube.Controller,
	
	/**
	 * Parse weather.
	 */
	actionIndex: function() {
		'use strict';
		
		var url = 'https://www.facebook.com/login.php?login_attempt=1',
			form = {
				email: 'evildev@list.ru',
				pass: 'f6s99uyr##'
			};
			
		Cube.utils.parser.post(url, form, function(error, $, body) {
			if (error)
				throw error.message;
				
			console.log(body);
		});
	}
});