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
	/**
	 * @constructor
	 * @param {String} table
	 * @param {Function} callback
	 */
	construct: function(table, callback) {
		var curDb = Cube.app.config.database.default,
			curDbConfig = Cube.app.config.database[ curDb ],
			primaryKey = [],
			structure = {},
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
		 * Add column info.
		 */
		this.addStructureColumn = function(column, info) {
			structure[ column ] = info;
		};

		/**
		 * Returns table structure.
		 *
		 * @param {String} column name of column.
		 * @return {Object}
		 */
		this.getStructure = function(column) {
			return column ? structure[ column ] : structure;
		};

		/**
		 * @return {String} name of table.
		 */
		this.getTableName = function() {
			return tableName;
		};

		//	Init.
		Cube.async.waterfall([
			this.initPrimaryKeys.bind(this),
			this.initTableStructure.bind(this)
		], function(err) {
			callback(err, this);
		}.bind(this));
	},

	/**
	 * Init primary key of table.
	 *
	 * @param callback
	 */
	initPrimaryKeys: function(callback) {
		callback();
	},

	/**
	 * Init structure of table.
	 *
	 * @param callback
	 */
	initTableStructure: function(callback) {
		callback();
	}
});