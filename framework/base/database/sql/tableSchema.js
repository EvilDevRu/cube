/**
 * TableSchema base class for for representing the metadata of a database table
 * for relational database management systems.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	abstracts: ['getPks'],

	/**
	 * @constructor
	 * @param {String} table
	 * @param {Function} callback
	 */
	construct: function(table, callback) {
		var curDb = Cube.app.config.database.default,
			curDbConfig = Cube.app.config.database[ curDb ],
			primaryKey = [],
			regExpTable = new RegExp('{{(.+)}}', 'i').exec(table),
			tableName = regExpTable ?
				(curDbConfig.prefix || '') + regExpTable[1] :
				table;

		/**
		 * Add a new column of primary key.
		 *
		 * @param {String} name column name of primary key.
		 * @param {Boolean} reset delete all columns of primary key.
		 */
		this.addPrimaryKeyColumn = function(name, reset) {
			if (reset) {
				primaryKey = [];
			}

			primaryKey.push(name);
		};

		/**
		 * @return {Array} primary key.
		 */
		this.getPrimaryKey = function() {
			return primaryKey;
		};

		/**
		 * @return {String} name of table.
		 */
		this.getTableName = function() {
			return tableName;
		};

		//	Init.
		this.getPks(function(err) {
			if (err) {
				callback(err);
				return;
			}

			callback();
		});
	}
});