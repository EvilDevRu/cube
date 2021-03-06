/**
 * ActiveQuery class for MySQL database.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	extend: [ Cube.CSQLActiveQuery ],

	/**
	 * @constructor
	 */
	construct: function(activeRecord) {
		this.builder = new Cube.MyBuilder();
		Cube.CSQLActiveQuery.call(this, activeRecord);
	},

	/**
	 * Creates a mysql command that can be used to execute this query.
	 *
	 * @return {MySQLCommand} the created mysql command instance.
	 */
	createCommand: function() {
		Cube.CSQLActiveQuery.functions.createCommand.call(this);
		return Cube.app.mysql.createCommand(this.builder.getTextQuery(), this.builder.getParams());
	}
});