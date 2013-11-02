/**
 * Bootstrap redis database driver.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = function(callback) {
	var config = Cube.app.config.database.redis;
	if (!config) {
		//	TODO: Throw of not find config file.
		throw 'Redis config not found';
	}

	Cube.private.dbPrefixes.redis = {
		db: 'Redis',
		type: 'Object'
	};

	Cube.RedisConnection = require(__dirname + '/connection.js');
	Cube.RedisActiveRecord = require(__dirname + '/activeRecord.js');
	Cube.RedisObjectSchema = require(__dirname + '/objectSchema.js');

	Cube.app.redis = new Cube.RedisConnection();
	Cube.app.redis.connect(config, callback);
};