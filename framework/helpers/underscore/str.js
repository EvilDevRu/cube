/**
 * Helper library contains functional of underscore library
 * and additional functions for Cube framework.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = {
	/**
	 * Find the position of the first occurrence of a substring in a string.
	 *
	 * @param {String} needle
	 * @param {String} string
	 * @param {String} offset
	 * @return {Integer} returns character number of string or -1 if not finded.
	 */
	find: function(needle, string, offset) {
		return _.isString(string) ? string.indexOf(needle, (offset || 0)) : -1;
	},

	/**
	 * Replace substring.
	 *
	 * @param string
	 * @param needle
	 * @param replace
	 */
	replace: function(string, needle, replace) {
		return string.split(needle).join(replace);
	},

	/**
	 * Make a string's first character to uppercase.
	 *
	 * @param {String} string
	 * @return {String}
	 */
	ucFirst: function(string) {
		string += '';
		return string.charAt(0).toUpperCase() + string.substr(1);
	},

	/**
	 * Make a string's first character to lowercase.
	 *
	 * @param {String} string
	 * @return {String}
	 */
	lcFirst: function(string) {
		string += '';
		return string.charAt(0).toLowerCase() + string.substr(1);
	}
};