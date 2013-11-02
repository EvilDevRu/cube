/**
 * Bootstrap postgresql database driver.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = function(callback) {
	var config = Cube.app.config.database.postgresql;
	if (!config) {
		//	TODO: Throw of not find config file.
		throw 'Postgres config not found';
	}

	Cube.private.dbPrefixes.postgresql = {
		db: 'Pg',
		schema: 'Table'
	};

	Cube.PgConnection = require(__dirname + '/connection.js');
	Cube.PgBuilder = require(__dirname + '/builder.js');
	Cube.PgCommand = require(__dirname + '/command.js');
	Cube.PgTableSchema = require(__dirname + '/tableSchema.js');
	Cube.PgActiveQuery = require(__dirname + '/activeQuery.js');
	Cube.PgActiveRecord = require(__dirname + '/activeRecord.js');

	Cube.app.postgresql = new Cube.PgConnection();
	Cube.app.postgresql.connect(config, callback);
};