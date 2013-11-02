/**
 * Singleton class.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

var Class = require('./class.js');

module.exports = function(data) {
	return Class(_.merge(data, {
		statics: {
			construct: function() {
				this.private = {};
				this.private.instance = null;
			},

			getInstance: function() {
				if (_.isNull(this.private.instance)) {
					this.private.instance = new this();
				}

				return this.private.instance;
			}
		}
	}));
};