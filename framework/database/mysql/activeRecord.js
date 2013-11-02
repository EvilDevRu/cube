/**
 * ActiveRecord class for MySQL database.
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
	 * @return {MyActiveQuery} a new active query.
	 */
	createActiveQuery: function() {
		return new Cube.MyActiveQuery(this);
	},

	/**
	 * Creates a new mysql command instance.
	 *
	 * @param {String} textQuery
	 * @param {Object} params
	 * @return {MyCommand}
	 */
	createCommand: function(textQuery, params) {
		return Cube.app.mysql.createCommand(textQuery, params);
	},

	/**
	 * Save primary keys values to attributes of active record after save new model.
	 *
	 * @param {Object} data
	 */
	savePks2Attr: function(data) {
		var tableSchema = this.getTableSchema();

		if (data.affectedRows && tableSchema.getPrimaryKey()[0]) {
			this.set(tableSchema.getPrimaryKey()[0], data.insertId);
		}
	}
});