/**
 * ActiveRecord manage component.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

module.exports = Cube.Singleton({
	/**
	 * @constructor
	 */
	construct: function() {
		var models = {
			mysql: {},
			redis: {}
		};

		/**
		 * Returns a model.
		 *
		 * @param {String} db database name.
		 * @param {String} name model name.
		 * @return {Object} model if is exists.
		 */
		this.getModel = function(db, name) {
			//	FIXME: TESTING
			var Model = models[ db ][ name ] || null;
			try {
				if (!Model) {
					//	TODO: Throw
					throw db + ' ' + name + ' model not found!';
				}
			}
			catch (e) {
				//	TODO: Throw
				console.error(db + ' model "' + name + '" not found!', e);
				Cube.app.end(1);
			}

			return new Model();
		};

		/**
		 * Set model.
		 *
		 * @param {String} db database name.
		 * @param {String} name model name.
		 * @param {Object} model setting model.
		 */
		this.setModel = function(db, name, model) {
			models[ db ][ name ] = model;
		};
	},

	/**
	 * Load models.
	 *
	 * @param {Function} callback
	 */
	init: function(callback) {
		'use strict';

		//	No load models if not exist database settings.
		//	TODO: Throw.
		if (!Cube.app.config.database) {
			return callback();
		}

		try {
			var that = this,
				path = Cube.app.basePath + '/models',
				dirDb = Cube.fs.readdirSync(path);

			_.each(dirDb, function(database) {
				try {
					var pathModels = path + '/' + database,
						dirModels = Cube.fs.readdirSync(pathModels);

					_.each(dirModels, function(model) {
						var name = _.baseName(model, '.js'),
							module = require(pathModels + '/' + model);

						that.setModel(database, name, module);
					});
				}
				catch (e) {
					throw 'Make sure the correct "model" directory structure!';
				}
			});
		}
		catch (e) {
			console.error('[model] error init models (%s)', e);
			Cube.app.end(1);
		}

		callback();
	},

	/**
	 * Returns a mysql model.
	 *
	 * @param {String} name mysql model name.
	 * @return {Cube.MySQLModel} mysql model.
	 */
	mysql: function(name) {
		'use strict';
		return new this.getModel('mysql', name);
	},

	/**
	 * Returns a redis model.
	 *
	 * @param {String} name redis model name.
	 * @return {Cube.RedisModel} redis model.
	 */
	redis: function(name) {
		'use strict';
		return new this.getModel('redis', name);
	}
});