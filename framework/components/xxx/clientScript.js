/**
 * Register css and scripts files in views.
 * 
 * TODO: Google font, building, caching...
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */
module.exports = ClientScriptComponent = Cube.Singleton({
	/**
	 * Init.
	 */
	construct: function() {
		this.cssFiles = [];
		this.lessFiles = [];
		this.scriptsFiles = [];
		
		this.caching = true;
		this.building = true;
	},
	
	/**
	 * Registers a piece of CSS code.
	 * 
	 * @param {String} url URL of the CSS file.
	 * @return the ClientScript object itself.
	 */
	registerCssFile: function(url) {
		'use strict';
		this.cssFiles.push(url);
		return this;
	},
	
	/**
	 * Registers a piece of Less code.
	 * 
	 * @param {String} url URL of the Less file.
	 * @param {String} media media that the CSS file should be applied to.
	 * 	If empty, it means all media types.
	 * @return the ClientScript object itself.
	 */
	registerLessFile: function(url, media) {
		'use strict';
		this.lessFiles.push(url);
		return this;
	},
	
	/**
	 * Registers a piece of CSS Google font.
	 * 
	 * @return the ClientScript object itself.
	 */
	registerGoogleFont: function(url) {
		'use strict';
		//
	},
	
	/**
	 * Registers a piece of javascript code.
	 * 
	 * @param {String} url URL of the javascript file.
	 * @return the ClientScript object itself.
	 */
	registerScriptFile: function(url) {
		'use strict';
		this.scriptsFiles.push(url);
		return this;
	},
	
	/**
	 * Returns css and scripts.
	 * 
	 * @return {String}
	 */
	render: function() {
		'use strict';
		
		var result = '';
		
		_.each(this.cssFiles, function(url) {
			result += '<link rel="stylesheet" type="text/css" href="/' + url + '">';
		});
		
		_.each(this.lessFiles, function(url) {
			result += '<link rel="stylesheet" type="text/less" href="/' + url + '">';
		});
		
		_.each(this.scriptsFiles, function(url) {
			result += '<script type="text/javascript" src="/' + url + '"></script>';
		});
		
		return result;
	}
});