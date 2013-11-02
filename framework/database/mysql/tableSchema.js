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
		//	TODO: Тильды
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
	}
});