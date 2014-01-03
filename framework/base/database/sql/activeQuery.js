/**
 * ActiveQuery base class for relational database management systems.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	/**
	 * @constructor
	 * @param {CSQLActiveRecord} activeRecord
	 */
	construct: function(activeRecord) {
		/**
		 * @return {CSQLActiveRecord}
		 */
		this.getActiveRecord = function() {
			return activeRecord;
		};
	},

	/**
	 * Executes query and provides a single row of result.
	 *
	 * @param {Function} callback function has two arguments: errors and CSQLActiveRecord.
	 * @param {Object} context
	 */
	one: function(callback, context) {
		if (!context) {
			context = this;
		}

		this.getActiveRecord().beforeFind(function() {
			this.createCommand().query().one(function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				if (!_.isEmpty(data)) {
					this.getActiveRecord().set(data).isNewRecord(false);
					this.getActiveRecord().afterFind(function() {
						callback.call(context, null, this.getActiveRecord());
					}.bind(this));

					return;
				}

				//	TODO: Throw (need message);
				this.getActiveRecord().afterFind(function() {
					callback.call(context, 'Item not found');
				});
			}, this);
		}.bind(this));
	},

	/**
	 * Executes query and provides all results as an array.
	 *
	 * @param {Function} callback function has two arguments: errors and query results.
	 */
	all: function(callback, context) {
		this.createCommand().query().all(callback, context);
	},

	/**
	 * Provide the query result as a scalar value.
	 * The value returned will be the first column in the first row of the query results.
	 *
	 * @param {Function} callback function has two arguments: errors and
	 *     the first column value. Invoked after successfully query.
	 */
	scalar: function(callback) {
		this.createCommand().query().scalar(callback);
	},

	/**
	 * Provide the number of records.
	 *
	 * @param {String|Function} q the COUNT expression. Defaults to '*'. May be use as callback function.
	 * @param {Function} callback function has two arguments: errors and number of records.
	 */
	count: function(q, callback) {
		if (_.isFunction(q)) {
			callback = q;
			q = null;
		}

		//	TODO: Security
		this.builder.select('COUNT(' + (q ? q : '*') + ')');
		this.createCommand().query().scalar(callback);
	},

	/**
	 * Provide the sum of the specified column values.
	 *
	 * @param {String} q the column name or expression.
	 * @param {Function} callback function has two arguments: errors and
	 *     the sum of the specified column values.
	 */
	sum: function(q, callback) {
		//	TODO: Expression and security
		if (!q) {
			callback('No column name for sum!');
			return;
		}

		//	TODO: Security
		this.builder.select('SUM(' + q + ')');
		this.createCommand().query().scalar(callback);
	},

	/**
	 * Provide the average of the specified column values.
	 *
	 * @param {String} q the column name or expression.
	 * @param {Function} callback function has two arguments: errors and
	 *     the average of the specified column values.
	 */
	average: function(q, callback) {
		//	TODO: Expression and security
		if (!q) {
			callback('No column name for average!');
			return;
		}

		//	TODO: Security
		this.builder.select('AVG(' + q + ')');
		this.createCommand().query().scalar(callback);
	},

	/**
	 * Provide the minimum of the specified column values.
	 *
	 * @param {String} q the column name or expression.
	 * @param {Function} callback function has two arguments: errors and
	 *     the minimum of the specified column values.
	 */
	min: function(q, callback) {
		//	TODO: Expression and security
		if (!q) {
			callback('No column name for min!');
			return;
		}

		//	TODO: Security
		this.builder.select('MIN(' + q + ')');
		this.createCommand().query().scalar(callback);
	},

	/**
	 * Provide the maximum of the specified column values.
	 *
	 * @param {String} q the column name (TODO: or expression).
	 * @param {Function} callback function has two arguments: errors and
	 *     the maximum of the specified column values.
	 */
	max: function(q, callback) {
		//	TODO: Expression and security
		if (!q) {
			callback('No column name for max!');
			return;
		}

		//	TODO: Security
		this.builder.select('MAX(' + q + ')');
		this.createCommand().query().scalar(callback);
	},

	/**
	 * Provide a value indicating whether the query result contains any row of data.
	 * The value returned will be the first column in the first row of the query results.
	 *
	 * @param {Function} callback function has two arguments: errors and
	 *     the first column value. Invoked after successfully query.
	exists: function(callback) {
		'use strict';

		//	TODO: Expression
	},
	 */

	/**
	 * Sets the ORDER BY part of the query.
	 *
	 * @returns {*}
	 */
	orderBy: function(columns) {
		this.builder.order(columns);
		return this;
	},

	/**
	 * TODO: JsDoc
	 */
	createCommand: function() {
		if (_.isEmpty(this.builder.private.params.build.from)) {
			this.builder.from(this.getActiveRecord().getTableName());
		}

		this.builder.build();

		return this.getActiveRecord().createCommand(this.builder.getTextQuery(), this.builder.getParams());
	}
});