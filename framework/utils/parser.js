/**
 * Parser utility.
 * This module is a wrapper of cheerio {@link https://github.com/MatthewMueller/cheerio}
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

var cheerio = require('cheerio');

module.exports = Cube.Singleton({
	/**
	 * Init.
	 */
	construct: function() {
		var defaults = Cube.app.config.utils.parser || {};
			
		//	@TODO: Cookie support.
		this.request = require('request').defaults(_.extend(defaults, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/28.0.1500.52 Chrome/28.0.1500.52 Safari/537.36',
			}
		}));
	},
	
	/**
	 * Configure options for request.
	 * 
	 * @param {Object|String} options request options.
	 * @param {String} method method request.
	 * @return {Object} new extended options.
	 */
	configure: function(options, data) {
		return {
			url: _.isObject2(options) ? options.url : options,
			form: data || null
		};
	},
	
	/**
	 * Content downloader and parse with jQuery.
	 * 
	 * @param {Object|String} options
	 * @param {Function} callback
	 */
	get: function(options, callback) {
		var _t = this;
		
		this.request(this.configure(options), function(error, response, body) {
			if (error || response.statusCode != 200) {
				return _.isFunction(callback) ? callback({
					message: error,
					response: response
				}) : false;
			}
			
			//	TODO: get params.
			callback.call(_t, null, cheerio.load(body), body);
		});
	},
	
	/**
	 * Send post require and jQuery parse response.
	 */
	post: function(options, data, callback) {
		var _t = this;
		
		this.request.post(this.configure(options, data), function(error, response, body) {
			if (error || response.statusCode != 200) {
				return _.isFunction(callback) ? callback({
					message: error,
					response: response
				}) : false;
			}
			
			//	TODO: get params.
			callback.call(_t, null, cheerio.load(body), body);
		});
	}
});
