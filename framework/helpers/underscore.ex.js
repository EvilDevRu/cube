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

global._ = require('underscore');

//	Extend underscore library.
_.mixin({
	/**
	 * Replace underscore function "each"
	 * as it uses forEach method by default.
	 * 
	 * @version 1.5.1
	 */
	each: function(obj, iterator, context) {
		if (!obj) {
			return;
		}
			
		if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === {}) {
					return;
				}
			}
		} else {
			for (var key in obj) {
				if (_.has(obj, key)) {
					if (iterator.call(context, obj[key], key, obj) === {}) {
						return;
					}
				}
			}
		}
	},

	/**
	 * NOTICE:
	 * I added new method which detects variable as object with strictly.
	 *
	 * @param {Mixed} obj
	 * @return {Boolean}
	 */
	isObject2: function(obj) {
		return obj ? (obj.toString() === '[object Object]') : false;
	},

	/**
	 * TODO: POP method for object.
	 *
	 * @param obj
	 * @returns {boolean}
	 */
	pop: function(object) {
		for (var key in object) {
			if (key.hasOwnProperty(key)) {
				var result = object[ key ];
				delete object[ key ];
				return result;
			}
		}
	},

	/**
	 * Returns length of array of object.
	 *
	 * @param {Mixed} value
	 * @return {Integer} returns false if value is not array or object else length of value.
	 */
	objLength: function(value) {
		if (!_.isObject(value)) {
			return false;
		}

		var length = 0;
		_.each(value, function() {
			++length;
		});

		return length;
	},

	/**
	 * Split array into chunks.
	 *
	 * @return {Array} array of chunks.
	 */
	chunk: function(array, length) {
		return [].concat.apply([],
			array.map(function(elem, i) {
				return i % length ? [] : [ array.slice(i,i + length) ];
			})
		);
	},
	
	/**
	 * Recursive merge two objects.
	 * FIXME: No merge value on object
	 * 
	 * @param {Object} object1, object2, ...
	 * @return {Object}
	 */
	merge: function() {
		var first = arguments[0];

		_.each(_.rest(arguments), function(obj) {
			if (_.isArray(obj)) {
				first = first.concat(obj);
			} else if (_.isObject2(obj)) {
				_.each(obj, function(value, key) {
					try {
						first[ key ] = (_.isObject(value) && first[ key ]) ? _.merge(first[ key ], value) : value;
					} catch(e) {
						first[ key ] = value;
					}
				});
			} else {
				first = obj;
			}
		});
		
		return first;
	},
	
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
	
	/**
	 * Returns trailing name component of path.
	 * 
	 * @param {String} path path to a file.
	 * @param {String} suffix if path ends for suffix then erase it.
	 * @return {String}
	 */
	baseName: function(path, suffix) {
		path = path.replace(/^.*[\/\\]/g, '');
		if (_.isString(suffix) && path.substr(path.length - suffix.length) === suffix) {
			path = path.substr(0, path.length - suffix.length);
		}
		
		return path;
	},

	/**
	 * Given a string containing the path of a file or directory.
	 *
	 * @param path path to a directory or file.
	 * @return {String}
	 */
	dirName: function(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
	},

	/**
	 * Returns extension of a file.
	 *
	 * @param {String} fileName name of file.
	 * @return {String} file extension.
	 */
	fileExt: function(fileName) {
		return _.isString(fileName) ? _.last(fileName.split('.')) : '';
	},

	/**
	 * Tells whether the path is a regular file.
	 *
	 * @param {String} path path to a file.
	 * @returns {Boolean}
	 */
	isFile: function(path) {
		try {
			return Cube.fs.lstatSync(path).isFile();
		}
		catch (e) {
			return false;
		}
	},

	/**
	 * Tells whether the dirName is a directory.
	 *
	 * @param {String} path path to a directory.
	 * @returns {Boolean}
	 */
	isDir: function(path) {
		try {
			return Cube.fs.lstatSync(path).isDirectory();
		}
		catch (e) {
			return false;
		}
	},

	/**
	 * Make directory.
	 *
	 * @param {String} path path to a directory.
	 * @param {Integer} mode directory access mode.
	 * @returns {Boolean} returns true if directory is successfully created.
	 */
	mkDir: function(path, mode) {
		try {
			Cube.fs.mkdirSync(path, mode);
		}
		catch (e) {
			return false;
		}

		return true;
	},

	/**
	 * Copy file or directory.
	 * If callback is a function then files will be copying as async
	 * or else copying sync if callback is not a function.
	 *
	 * @param {String} source
	 * @param {String} destination
	 * @param {Function} callback (optional)
	 * @return {Boolean}
	 */
	copy: function(source, destination, callback) {
		var params = {
			forceDelete: true,
			excludeHiddenUnix: false
		};

		try {
			//	TODO: Rewrite without outside modules.
			if (_.isFunction(callback)) {
				Cube.wrench.copyDirRecursive(source, destination, params, callback);
				return;
			}

			Cube.wrench.copyDirSyncRecursive(source, destination, params);
		}
		catch (e) {
			console.error(e);
			return false;
		}

		return true;
	},
	
	/**
	 * Find the position of the first occurrence of a substring in a string.
	 * 
	 * @param {String} needle
	 * @param {String} string
	 * @param {String} offset
	 * @return {Integer} returns character number of string or -1 if not finded.
	 */
	strFind: function(needle, string, offset) {
		return _.isString(string) ? string.indexOf(needle, (offset || 0)) : -1;
	},

	/**
	 * Replace substring.
	 *
	 * @param string
	 * @param needle
	 * @param replace
	 */
	strReplace: function(string, needle, replace) {
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
});