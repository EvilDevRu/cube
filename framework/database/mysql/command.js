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
	extend: [ Cube.CSQLCommand, Cube.MyBuilder ],

	/**
	 * @constructor
	 */
	construct: function() {
		Cube.MyBuilder.call(this);
		Cube.CSQLCommand.apply(this, arguments);
	},

	/**
	 * Executes the SQL statement.
	 *
	 * @param {Function} callback
	 * @return {MyCommand} this instance.
	 */
	execute: function(callback) {
		//	Build query @see {CSQLBuilder}.
		this.build();

		this.getConnection().query.apply(
			this.getConnection(),
			!_.isEmpty(this.getParams()) ?
				[ this.getTextQuery(), this.getParams(), callback ] :
				[ this.getTextQuery(), callback ]
		);

		return this;
	}
});