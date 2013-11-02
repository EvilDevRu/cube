/**
 * Models manager class for all database management systems.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Singleton({
	/**
	 * @constructor
	 * @param {Function} callback invoke after successful init this manager.
	 */
	construct: function(callback) {
		var activeRecords = {};

		/**
		 * Returns a new model.
		 *
		 * @param {String} db database name.
		 * @param {String} name model name.
		 * @return {Mixed} model if is exists.
		 */
		this.getModel = function(database, name) {
			try {
				//	TODO: Throw.
				if (!activeRecords[ database ] || !activeRecords[ database ][ name ]) {
					throw database + ' ' + name + ' model not found!';
				}

				return new activeRecords[ database ][ name ].model(name, activeRecords[ database ][ name ].TableSchema);
			}
			catch (e) {
				//	TODO: Throw.
				console.error(e);
				Cube.app.end(1);
			}
		};

		/**
		 * Set a model.
		 * TODO: JsDoc
		 * @param {String} database database name.
		 * @param {String} name model name.
		 * @param {Mixed} model set a model.
		 * @param {Function} callback invoke after get table schema.
		 * @throw
		 */
		this.setModel = function(database, name, model, callback) {
			//	TODO: delete.
			if (!Cube.private.dbPrefixes[ database ]) {
				//	TODO: Throw
				console.warn('Not used model `' + name + '` for ' + database.toUpperCase() + ' because connect to database not established!');
				callback();
				return;
			}

			var pfxDb = Cube.private.dbPrefixes[ database ].db,
				pfxSchema = Cube.private.dbPrefixes[ database ].schema;

			if (!activeRecords[ database ]) {
				activeRecords[ database ] = {};
			}

			activeRecords[ database ][ name ] = {
				model: model
			};

			if (Cube[ pfxDb + pfxSchema + 'Schema' ]) {
				activeRecords[ database ][ name ][ pfxSchema + 'Schema' ] =
					new Cube[ pfxDb + pfxSchema + 'Schema' ](model.functions[ pfxSchema.toLowerCase() + 'Name' ](), function(err) {
						callback(err);
					});
			} else {
				callback();
			}
		};


		//	Initialize.
		if (!Cube.app.config.database) {
			callback();
			return;
		}

		try {
			var dirModels = Cube.getPathOfAlias('app.models'),
				dbs = Cube.fs.readdirSync(dirModels),
				stackModels = [];

			//	First get all model names.
			_.each(dbs, function(database) {
				try {
					var dirDb = dirModels + '/' + database,
						models = Cube.fs.readdirSync(dirDb);

					_.each(models, function(model) {
						stackModels.push({
							file: model,
							database: database
						});
					}.bind(this));
				}
				catch (e) {
					throw 'Make sure the correct "model" directory structure!';
				}
			}.bind(this));

			/**
			 * Recursive models load from the stack of models with table schema.
			 */
			var LoadModelsRecursive = function() {
				if (!stackModels.length) {
					callback();
					return;
				}

				var model = stackModels.pop(),
					name = _.ucFirst(_.baseName(model.file, '.js')),
					module = require(dirModels + '/' + model.database + '/' + model.file);

				this.setModel(model.database, name, module, function(err) {
					if (err) {
						callback(err);
						return;
					}

					LoadModelsRecursive();
				});
			}.bind(this);

			LoadModelsRecursive();
		}
		catch (e) {
			//	TODO: Throw
			callback('Error init model manager: ' + e);
		}
	},

	/**
	 * Returns a mysql ActiveRecord.
	 *
	 * @param {String} name activeRecord name.
	 * @return {MySQLActiveRecord}
	 */
	mysql: function(name) {
		return this.getModel('mysql', name);
	},

	/**
	 * Returns a postgres ActiveRecord.
	 *
	 * @param {String} name activeRecord name.
	 * @return {PgActiveRecord}
	 */
	postgresql: function(name) {
		return this.getModel('postgresql', name);
	},

	/**
	 * Alias for postgres activerecord.
	 *
	 * @param {String} name activeRecord name.
	 * @return {PgActiveRecord}
	 */
	pg: function(name) {
		return this.getModel('postgresql', name);
	},

	/**
	 * Returns a redis ActiveRecord.
	 *
	 * @param {String} name activeRecord name.
	 * @return {RedisActiveRecord}
	 */
	redis: function(name) {
		return this.getModel('redis', name);
	}
});