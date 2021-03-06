/**
 * MySQL builder of query class.
 *
 * For example @see CSQLBuilder.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	extend: Cube.CSQLBuilder,

	/**
	 * @constructor
	 */
	construct: function() {
		Cube.CSQLBuilder.call(this);

		//	Wrap char.
		this.private.wrapChar = '`';
	}
});