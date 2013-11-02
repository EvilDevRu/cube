/**
 * Bootstrap mysql database driver.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = function(callback) {
	var config = Cube.app.config.database.mysql;
	if (!config) {
		//	TODO: Throw of not find config file.
		throw 'MySQL config not found';
	}

	Cube.private.dbPrefixes.mysql = {
		db: 'My',
		schema: 'Table'
	};

	Cube.MyConnection = require(__dirname + '/connection.js');
	Cube.MyBuilder = require(__dirname + '/builder.js');
	Cube.MyCommand = require(__dirname + '/command.js');
	Cube.MyTableSchema = require(__dirname + '/tableSchema.js');
	Cube.MyActiveQuery = require(__dirname + '/activeQuery.js');
	Cube.MyActiveRecord = require(__dirname + '/activeRecord.js');

	Cube.app.mysql = new Cube.MyConnection();
	Cube.app.mysql.connect(config, callback);
};