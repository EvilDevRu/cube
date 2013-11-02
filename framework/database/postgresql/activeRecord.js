/**
 * ActiveRecord class for Postgres.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	extend: Cube.CSQLActiveRecord,

	/**
	 * @return {PgActiveQuery} a new active query.
	 */
	createActiveQuery: function() {
		return new Cube.PgActiveQuery(this);
	},

	/**
	 * Creates a new postgres command instance.
	 *
	 * @param {String} textQuery
	 * @param {Object} params
	 * @return {PgCommand}
	 */
	createCommand: function(textQuery, params) {
		return Cube.app.postgresql.createCommand(textQuery, params);
	},

	/**
	 * Save primary keys values to attributes of active record after save new model.
	 *
	 * @param {Object} data
	 */
	savePks2Attr: function(data) {
		var tableSchema = this.getTableSchema();

		if (data.rowCount && tableSchema.getPrimaryKey()[0]) {
			_.each(tableSchema.getPrimaryKey(), function(pk) {
				this.set(pk, data.rows[0][ pk ]);
			}.bind(this));
		}
	}
});