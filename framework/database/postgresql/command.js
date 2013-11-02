/**
 * PostgreSQL command class.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	extend: Cube.CSQLCommand,

	/**
	 * @constructor
	 * @param {CSQLConnection} connection
	 * @param {String} textQuery
	 * @param {Object} params the parameters as pair name-value to be bound to be query.
	 */
	construct: function(connection, textQuery, params) {
		var pgPkName = 'id';

		Cube.CSQLCommand.call(this, connection, textQuery, params);

		/**
		 * @return {String} Returns private key name for execute method for return column name.
		 *  Special for postgres. Default by `id`.
		 */
		this.getPgPk = function() {
			//	TODO: Table and other to the tilde.
			return pgPkName;
		};

		/**
		 * Set postgres primary key.
		 *
		 * @param {String} name primary key.
		 * @return {PgCommand} this instance.
		 */
		this.setPgPk = function(pk) {
			pgPkName = pk;
			return this;
		};
	},

	/**
	 * Executes the SQL statement.
	 *
	 * @param {Function} callback
	 * @return {PgCommand} this instance.
	 */
	execute: function(callback) {
		var returning = this.getPgPk() ? (' RETURNING ' + this.getPgPk()) : '';

		//	Build query @see {CSQLBuilder}.
		this.build();

		//	TODO: Table and other to the tilde.
		this.getConnection().query.apply(
			this.getConnection(),
			!_.isEmpty(this.getParams()) ?
				[ this.getTextQuery() + returning, this.getParams(), callback ] :
				[ this.getTextQuery() + returning, callback ]
		);

		return this;
	},

	/**
	 * Creates and executes a TRUNCATE SQL statement.
	 *
	 * @param {String} table the table to be truncated.
	 * @param {Function} callback
	 */
	truncate: function(table, callback) {
		this.setPgPk(null);
		Cube.CSQLCommand.functions.truncate.call(this, table, callback);

		return this;
	}
});