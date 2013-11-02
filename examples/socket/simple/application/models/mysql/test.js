/**
 * Model of a test.
 * 
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */
module.exports = Cube.Class({
	extend: Cube.MyActiveRecord,
	
	/**
	 * Returns without formatted table name.
	 * 
	 * @return {String} table name.
	 */
	tableName: function() {
		'use strict';
		return 'test';
	}
});