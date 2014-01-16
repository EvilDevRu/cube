/**
 * ActiveRecord base class for relational database management systems.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	abstracts: ['createActiveQuery'],

	/**
	 * @constructor
	 * @param {String} name name of this model.
	 * @param {CSQLTableSchema} tableSchema
	 */
	construct: function(name, tableSchema) {
		var validateErrors = {},
			attributeLabels = this.attributeLabels(),
			attributes = {},
			isNewRecord = true;

		//	TODO: Throw
		if (!tableSchema) {
			console.error('No table schema!');
			Cube.app.end(1);
		}

		/**
		 * Getter and setter for isNewRecord.
		 *
		 * @param {Boolean} isNew if is exist, set new record state.
		 * @return {Boolean} true if this is new record.
		 */
		this.isNewRecord = function(isNew) {
			if (!_.isUndefined(isNew)) {
				isNewRecord = isNew;
			}

			return isNewRecord;
		};

		/**
		 * @return {String} active record name.
		 */
		this.getName = function() {
			return name;
		};

		/**
		 * @return {CSQLTableSchema} table schema of this active record.
		 */
		this.getTableSchema = function() {
			return tableSchema;
		};

		/**
		 * @return {String} full table name of this model.
		 */
		this.getTableName = function() {
			return this.getTableSchema().getTableName();
		};

		/**
		 * @return {Array} primary keys of this active record instance.
		 */
		this.getPrimaryKey = function() {
			return this.getTableSchema().getPrimaryKey();
		};

		/**
		 * Returns a value indicating whether there is any validation error.
		 *
		 * @param {String} attribute attribute name. Use null to check all attributes.
		 * @return {Mixed} errors for all attributes or the specified attribute.
		 *     Use string for the specified attribute of array for all.
		 *     Empty object is returned if no error.
		 */
		this.getErrors = function(attribute) {
			return (attribute ? validateErrors[ attribute ] : validateErrors) || {};
		};

		/**
		 * Returns a value indicating whether there is any validation error.
		 *
		 * @param {String} attribute attribute name. Use null to check all attributes.
		 * @return {Mixed} errors for all attributes or the specified attribute.
		 *     Use string for the specified attribute of array for all.
		 *     Empty object is returned if no error.
		 */
		this.hasErrors = function() {
			return _.size(validateErrors);
		};

		/**
		 * Add errors to list of errors.
		 *
		 * @param {Object} errors a list of errors.
		 */
		this.addErrors = function(errors) {
			if (_.isObject(errors, true)) {
				validateErrors = _.merge(validateErrors, errors);
			}
		};

		/**
		 * Add a error to list of errors.
		 *
		 * @param {String} attribute attribute name.
		 * @param {String} message error message.
		 */
		this.addError = function(attribute, message) {
			validateErrors[ attribute ] = message;
		};

		/**
		 * Remove errors for all attributes or a single attribute.
		 *
		 * @param {String} attribute attribute name. Use null for clear all errors.
		 */
		this.clearErrors = function(attribute) {
			if (attribute) {
				delete validateErrors[ attribute ];
			} else {
				validateErrors = {};
			}
		};

		/**
		 * Returns the text label for the specified attribute.
		 *
		 * @param {String} attribute the attribute name.
		 * @return {String} the attribute label.
		 */
		this.getAttributeLabel = function(attribute) {
			return attributeLabels[ attribute ] || attribute;
		};

		/**
		 * Returns attribute value by name or all if empty name.
		 *
		 * @param {String} name the attribute name.
		 * @param {Mixed} defVal
		 * @return {Mixed} attribute value.
		 */
		this.get = function(name, defVal) {
			return attributes[ name ] || defVal;
		};

		/**
		 * Returns all attribute values.
		 *
		 * @param {String} name the attribute name.
		 * @return {Mixed} attribute value.
		 */
		this.getAll = function() {
			return attributes;
		};

		/**
		 * Sets the named attribute value.
		 *
		 * @param {Mixed} name the attribute name.
		 *     You can use object as name argument for set more attributes.
		 * @param {String} value the attribute value.
		 * @return {CSQLActiveRecord} this instance.
		 */
		this.set = function(name, value) {
			if (_.isObject(name, true)) {
				attributes = _.merge(attributes, name);
				return this;
			}

			attributes[ name ] = value;
			return this;
		};

		/**
		 * Sets the attributes to be null without primary key.
		 * TODO: Test
		 *
		 * @param {Array} names list of attributes to be set null. If this parameter is not given,
		 *     all attributes will have their values unset.
		 * @return {CSQLActiveRecord} this instance.
		 */
		this.unset = function(names) {
			if (names) {
				names = !_.isArray(names) ? [ names ] : names;
				_.each(names, function(name) {
					delete attributes[ name ];
				});
			} else {
				//	Unset without primary key.
				var columns = this.getPrimaryKey();
				_.each(attributes, function(value, name) {
					if (_.indexOf(columns, name) === -1) {
						attributes[ name ] = null;
					}
				});
			}

			return this;
		};

		/**
		 * Reset ActiveRecord.
		 * Sets the attributes to be null and set flag to new MySQLActiveRecord.
		 *
		 * @return {MySQLActiveRecord} this model instance
		 */
		this.reset = function() {
			attributes = {};
			this.isNewRecord(true);
			return this;
		};
	},

	/**
	 * @return {String} the name of the associated database table.
	 */
	tableName: function() {
		return '';
	},

	/**
	 * @return {Array} the validation rules for model attributes.
	 */
	rules: function() {
		return [];
	},

	/**
	 * @return {Array} the attribute labels as pair name-value.
	 */
	attributeLabels: function() {
		return {};
	},

	/**
	 * TODO: JsDoc
	 * Creates an CSQLActiveQuery instance for query purpose.
	 *
	 * @example
	 * Cube.model.mysql('ModelName').find(5, ...
	 * Cube.model.mysql('ModelName').find('PrimaryKeyName', ...
	 * Cube.model.mysql('ModelName').find({ id: 5, pid: 10 })...
	 *
	 * @param {Mixed} condition the query parameter. This can be one of the followings:
	 *     - a scalar value (integer or string): query by a single primary key value and return the
	 *       corresponding record.
	 *     - an object of name-value pairs: query by a set of column values and return a single record matching all of them.
	 *     - null: return a new CSQLActiveQuery object for further query purpose.
	 * @return {Mixed}
	 *     - when `query` is null, a new CSQLActiveQuery instance is returned.
	 *     - ...
	 */
	find: function(condition) {
		var activeQuery = this.createActiveQuery();
		if (condition) {
			if (!_.isObject(condition, true)) {
				var pks = this.getPrimaryKey();
				condition = {};

				_.each(_.values(arguments), function(value, key) {
					//	TODO: new Throw if not exist PK
					condition[ pks[ key ] ] = value;
				});
			}

			activeQuery.builder.where(condition);
		}

		return activeQuery;
	},

	/**
	 * Executes before save active record.
	 *
	 * @param {Function} callback
	 */
	beforeSave: function(callback) {
		callback();
	},

	/**
	 * Executes after save active record.
	 *
	 * @param {Function} callback
	 */
	afterSave: function(callback) {
		callback();
	},

	/**
	 * Executes before find active record.
	 *
	 * @param {Function} callback
	 */
	beforeFind: function(callback) {
		callback();
	},

	/**
	 * Executes after find active record.
	 *
	 * @param {Function} callback
	 */
	afterFind: function(callback) {
		callback();
	},

	/**
	 * Save active record if is it not new.
	 *
	 * @param {Function} callback
	 * @param {Object} context
	 */
	save: function(callback, context) {
		/**
		 * Callback wrapper.
		 *
		 * @param {Mixed} err
		 */
		var CallbackWrapper = function(err) {
			//	After afterSave method of model record is not new.
			this.isNewRecord(false);

			if (context) {
				callback.call(context, err, this);
				return;
			}

			callback(err, this);
		}.bind(this);

		this.beforeSave(function(err) {
			if (err) {
				CallbackWrapper(err);
				return;
			}

			/**
			 * Wrapper for 'save' method give active record in attributes.
			 *
			 * @param err
			 */
			var AfterSaveCallback = function(err) {
				if (err) {
					CallbackWrapper(err);
					return;
				}

				CallbackWrapper();
			}.bind(this);

			if (this.isNewRecord()) {
				this.createCommand().insert().one(this.getTableName(), this.getAll(), function(err, data) {
					if (err) {
						CallbackWrapper(err);
						return;
					}

					this.savePks2Attr(data);
					this.afterSave(AfterSaveCallback);
				}.bind(this));
			} else {
				var condition = [],
					params = [];

				_.each(this.getPrimaryKey(), function(pk, key) {
					condition.push(pk + '=$' + (key + 1));
					params.push(this.get(pk));
				}.bind(this));

				this.createCommand().update(this.getTableName(), this.getAll(), condition.join(','), params, function(err) {
					if (err) {
						CallbackWrapper(err);
						return;
					}

					this.afterSave(AfterSaveCallback);
				}.bind(this));
			}
		}.bind(this));
	},

	/**
	 * TODO: delete
	 *
	 * @param {Array|Integer|String} ids
	 * @return {Object}
	 */
	delete: function(ids) {
		return {
			/**
			 * Remove all rows by `ids` parameter.
			 *
			 * @param {Function} callback
			 */
			all: function(callback) {
				this.createCommand().delete(this.getTableName(), { id: ids }, function(err, data) {
					callback(err, data);
				});
			}.bind(this)
		};
	}
});