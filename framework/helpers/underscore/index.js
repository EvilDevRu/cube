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
global._.str = require('./str.js');
global._.crypt = require('./crypt.js');
global._.fs = require('./fs.js');

//	Embedding cube functions in a underscore.
_.mixin({
	/**
	 * Replace underscore function "each"
	 * as it uses forEach method by default for speed.
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
	 * I added new method which detects variable as object with strictly.
	 *
	 * @param {Mixed} obj
	 * @param {Boolean} isStrict (false by default)
	 * @return {Boolean}
	 */
	isObject: function(obj, isStrict) {
		return isStrict ?
			(obj ? (obj.toString() === '[object Object]') : false) :
			(obj === Object(obj));
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
	 * Split array into chunks.
	 *
	 * @return {Array} array of chunks.
	 */
	chunks: function(array, length) {
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
			} else if (_.isObject(obj, true)) {
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
	}
});