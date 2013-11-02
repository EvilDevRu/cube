/**
 * Postgres TableSchema class for for representing the metadata of a database table
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
	 * Send all private keys to callback.
	 *
	 * @param {Function} callback
	 */
	getPks: function(callback) {
		Cube.app.postgresql.createCommand()
			.select(['tc.table_schema', 'tc.table_name', 'kc.column_name'])
			.from({
				'information_schema.table_constraints': 'tc',
				'information_schema.key_column_usage': 'kc'
			})
			.where({
				'tc.constraint_type': 'PRIMARY KEY',
				'tc.table_name': '$1',
				'tc.table_schema': 'public',
				'kc.table_name': ':tc.table_name',
				'kc.table_schema': ':tc.table_schema',
				'kc.constraint_name': ':tc.constraint_name'
			}, [ this.getTableName() ])
			.order('1, 2')
			.query().all(function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				//	FIXME: If you remove the line below primaryKey not visible
				_.each(data, function(pk) {
					/* jshint camelcase: false */
					this.addPrimaryKeyColumn(pk.column_name);
					/* jshint camelcase: true */
				}.bind(this));

				callback();
			}.bind(this));
	}
});