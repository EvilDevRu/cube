/**
 * Model of a test.
 *
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

module.exports = Cube.Class({
	extend: Cube.RedisActiveRecord,

	/**
	 * @return {String} prefix name.
	 */
	objectName: function() {
		'use strict';
		return 'user';
	},

	/**
	 * @return {Object} rules.
	 */
	structure: function() {
		'use strict';
		return {
			id: {
				type: 'integer'
			},
			name: {
				type: 'string',
				required: true,
				length: {
					min: 3,
					max: 10
				}
			},
			loc: {
				type: 'string',
				required: true,
				length: {
					min: 3,
					max: 10
				}
			},
			mylist: {
				type: 'list',
				required: true
			},
			myset: {
				type: 'set'
			},
			myzset: {
				type: 'zset'
			}
		};
	},

	/**
	 * ###
	 */
	keys: function() {
		'use strict';
		return ['name'];
	}
});