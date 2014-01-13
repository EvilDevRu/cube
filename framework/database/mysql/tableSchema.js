/**
 * MySQL TableSchema class for for representing the metadata of a database table
 * for relational database management systems.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	extend: Cube.CSQLTableSchema,

	/**
	 * Init primary keys.
	 *
	 * @param {Function} callback
	 */
	initPrimaryKeys: function(callback) {
		Cube.app.mysql.createCommand('SHOW KEYS FROM ' + this.getTableName() + ' WHERE Key_name = "PRIMARY"').query().all(function(err, data) {
			if (err) {
				callback(err);
				return;
			}

			//	FIXME: If you remove the line below primaryKey not visible
			_.each(data, function(pk) {
				/* jshint camelcase: false */
				this.addPrimaryKeyColumn(pk.Column_name);
				/* jshint camelcase: true */
			}.bind(this));

			callback();
		}.bind(this));
	},

	/**
	 * Init structure of table.
	 *
	 * @param callback
	 */
	initTableStructure: function(callback) {
		Cube.app.mysql.createCommand('DESCRIBE ' + this.getTableName()).query().all(function(err, data) {
			if (err) {
				callback(err);
				return;
			}

			_.each(data, function(info) {
				this.addStructureColumn(info.Field, _.omit(info, 'Field'));
			}, this);

			callback();
		}.bind(this));
	}
});