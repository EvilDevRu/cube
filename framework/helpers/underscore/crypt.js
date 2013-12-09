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
	 * Calculate the md5 hash of a string.
	 *
	 * @param {String} string hashing string.
	 * @param {String} salt salt.
	 * @return {String} hashed string.
	 */
	md5: function(string, salt) {
		return Cube.crypto.createHmac('md5', salt || null).update(string).digest('hex');
	},

	/**
	 * Calculates the sha1 hash of a string.
	 *
	 * @param {String} string hashing string.
	 * @param {String} salt salt.
	 * @return {String} hashed string.
	 */
	sha1: function(string, salt) {
		return Cube.crypto.createHmac('sha1', salt || null).update(string).digest('hex');
	},
}