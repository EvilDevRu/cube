/**
 * MySQL command class.
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
	 * Executes the SQL statement.
	 *
	 * @param {Function} callback
	 * @return {PgCommand} this instance.
	 */
	execute: function(callback) {
		//	Build query @see {CSQLBuilder}.
		this.build();

		//	TODO: Table and other to the tilde.
		this.getConnection().query.apply(
			this.getConnection(),
			!_.isEmpty(this.getParams()) ?
				[ this.getTextQuery(), this.getParams(), callback ] :
				[ this.getTextQuery(), callback ]
		);

		return this;
	}
});