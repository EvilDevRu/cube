/**
 * Command base class for relational database management systems.
 *
 * TODO: MERGE, CREATE, ALTER, DROP, GRANT
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
	 * @param {CSQLConnection} connection
	 * @param {String} textQuery
	 * @param {Object} params the parameters as pair name-value to be bound to be query.
	 */
	construct: function(connection, textQuery, params) {
		this.setTextQuery(textQuery);
		this.addParams(params);

		this.getConnection = function() {
			return connection;
		};
	},

	/**
	 * Executes the SQL statement.
	 *
	 * @param {Function} callback
	 */
	execute: function(callback) {
		callback('Execute not invoke.');
	},

	/**
	 * Executes the SQL statement and send to callback one or all or scalar query result
	 * depending on `one` or `all` returns method.
	 * TODO: Disable update, delete, insert methods.
	 *
	 * @return {{one: Function, all: Function}}
	 */
	query: function() {
		/**
		 * @param {Integer} type may be `all` or `one` or `scalar`.
		 * @param {Function} callback
		 * @param {Object} context
		 * @return {CSQLCommand} this instance.
		 */
		var query = function(type, callback, context) {
			if (!context) {
				context = this;
			}

			if (type !== 'all') {
				this.limit(1);
			}

			//	Build query @see {CSQLBuilder}.
			this.build();

			var wrapper = function(err, data) {
				if (err) {
					callback.call(context, err);
					return;
				}

				//	FIXME: Detected data location by DataBase type.
				data = data.rows || data;

				switch (type) {
					case 'one':
						callback.call(context, null, data[0] || data);
						break;

					case 'all':
						callback.call(context, null, data);
						break;

					case 'scalar':
						callback.call(context, null, _.first(_.values(_.first(data))));
						break;
				}
			};

			this.getConnection().query.apply(
				this.getConnection(),
				!_.isEmpty(this.getParams()) ?
					[ this.getTextQuery(), this.getParams(), wrapper ] :
					[ this.getTextQuery(), wrapper ]
			);

			//	Reset builder.
			this.reset();

			return this;
		}.bind(this);

		return {
			/**
			 * Executes the SQL statement and send to callback one query result.
			 *
			 * @param {Function} callback
			 * @param {Object} context
			 * @return {CSQLCommand} this instance.
			 */
			one: function(callback, context) {
				return query('one', callback, context);
			},

			/**
			 * Executes the SQL statement and send to callback all query result.
			 *
			 * @param {Function} callback
			 * @param {Object} context
			 * @return {CSQLCommand} this instance.
			 */
			all: function(callback, context) {
				return query('all', callback, context);
			},

			/**
			 * Executes the SQL statement and send to callback the value of the first
			 * column in the first row of data.
			 *
			 * @param {Function} callback
			 * @param {Object} context
			 * @return {CSQLCommand} this instance.
			 */
			scalar: function(callback, context) {
				return query('scalar', callback, context);
			}
		};
	},

	/**
	 * Returns which functions Creates and executes a INSERT SQL statement.
	 *
	 * For example:
	 *     1. Inserting one row.
	 *     Cube.app.RelationalDatabase.createCommand().insert().one('cities', { name: 'asdasdas' }, function(err, data) {});
	 *
	 *     2. Inserting few rows.
	 *     Cube.app.RelationalDatabase.createCommand().insert().all('cities', ['name', 'pos'],
	 *         [ ['Jack', 'Captain'], ['Clone of Jack', 'Also captain'] ], function(err, data) {});
	 *
	 * @return {Function} function of inserting one or all data to table.
	 */
	insert: function() {
		return {
			/**
			 * Creates and executes an INSERT SQL statement for one row.
			 *
			 * @param {String} table table name.
			 * @param {Object} columns columns data as pair name-value of column.
			 * @param {Function} callback
			 * @return {CSQLCommand} this instance.
			 */
			one: function(table, columns, callback) {
				var params = _.values(columns),
					values = [];

				if (_.isUndefined(columns)) {
					//	TODO: Throw
					callback('Columns is empty!');
					return;
				}

				_.each(new Array(params.length), function(value, key) {
					values.push('$' + (key + 1));
				});

				this.setTextQuery('INSERT INTO ' + table + ' (' + this.private.wrapChar +
						_.keys(columns).join(this.private.wrapChar + ',' + this.private.wrapChar) + this.private.wrapChar +
						') VALUES (' + values.join(',') + ')')
					.addParams(params)
					.execute(_.isFunction(callback) ? callback : function() {});

				//	Reset builder.
				this.reset();

				return this;
			}.bind(this),

			/**
			 * Creates and executes an INSERT SQL statement for few rows.
			 *
			 * @param {String} table table name.
			 * @param {Array} columns columns data as array of names columns.
			 * @param {Array} data data for inserting as array columns of pairs name-value.
			 * @param {Function} callback
			 * @return {CSQLCommand} this instance.
			 */
			all: function(table, columns, data, callback) {
				var values = [],
					counter = 1;

				_.each(data, function(row) {
					var rowVals = [];

					_.each(columns, function(item, key) {
						if (!_.isUndefined(row[ key ])) {
							rowVals.push('$' + counter);
							++counter;
						} else {
							rowVals.push('NULL');
						}
					});

					values.push('(' + rowVals.join(',') + ')');
				});

				//	TODO: Table and other to the tilde.
				this.setTextQuery('INSERT INTO ' + table + ' (' + columns.join(',') + ') VALUES ' + values.join(','))
					.addParams(_.flatten(data))
					.execute(_.isFunction(callback) ? callback : function() {});

				//	Reset builder.
				this.reset();

				return this;
			}.bind(this)
		};
	},

	/**
	 * Creates and executes an UPDATE SQL statement.
	 *
	 * For example:
	 *     Cube.app.RelationalDatabase.createCommand().update('captains',
	 *         { name: 'Jack' }, 'id > $1 OR id < $2', [1099, 1111], function(err, data) {});
	 *
	 * @param {String} table the table to be updated.
	 * @param {Object} columns the column data as pairs name-value to be updated.
	 * @param {String} conditions the conditions that will be put in the WHERE part.
	 * @param {Object} params the data to be bound to the query. Do not use column names as parameter names here.
	 * @param {Function} callback
	 * @return {CSQLCommand} this instance.
	 */
	update: function(table, columns, conditions, params, callback) {
		var set = [],
			counter = 1,
			where = '';

		_.each(columns, function(value, key) {
			set.push(key + ' = $' + counter);
			++counter;
		}.bind(this));

		if (conditions) {
			//	Replacing params in conditions.
			_.each(params || [], function(value, key) {
				conditions = conditions.replace('$' + (key + 1), '$' + counter);
				++counter;
			});

			where = ' WHERE ' + conditions;
		}

		this.setTextQuery('UPDATE ' + table + ' SET ' + set.join(', ') + where)
			.addParams(_.merge(_.values(columns), params))
			.execute(_.isFunction(callback) ? callback : function() {});

		//	Reset builder.
		this.reset();

		return this;
	},

	/**
	 * Creates and executes a DELETE SQL statement.
	 *
	 * For example:
	 *     Cube.app.RelationalDatabase.createCommand().delete('cities', 'id>$1', [1097], function(err, data) {});
	 *     Cube.app.RelationalDatabase.createCommand().delete('cities', { id: 1097 }, function(err, data) {});
	 *     Cube.app.RelationalDatabase.createCommand().delete('cities', { id: [1097, 1098] }, function(err, data) {});
	 *     Cube.app.RelationalDatabase.createCommand().delete('cities', null, function(err, data) {});
	 *
	 * @param {String} table the table where the data will be deleted from.
	 * @param {Mixed} condition the conditions that will be put in the WHERE part of the DELETE SQL.
	 *     It may be string or object type of argument as pairs column-value.
	 */
	delete: function(table, condition, params, callback) {
		//	TODO: Table and other to the tilde.
		var query = 'DELETE FROM ' + table;

		if (condition) {
			query += ' WHERE ';
			if (_.isObject(condition, true)) {
				var where = [];
				_.each(condition, function(value, key) {
					var cond = _.isArray(value) && value.length > 1 ?
						' IN ($' + (where.length + 1) + ')' :
						' = $' + (where.length + 1);

					where.push(key + cond);
				});

				query += where.join(' AND ');
			} else {
				query += condition;
			}
		}

		if (_.isFunction(params)) {
			callback = params;
			this.addParams(_.values(condition));
		} else {
			this.addParams(params);
		}

		this.setTextQuery(query)
			.execute(_.isFunction(callback) ? callback : function() {});

		//	Reset builder.
		this.reset();

		return this;
	},

	/**
	 * Creates and executes a TRUNCATE SQL statement.
	 *
	 * @param {String} table the table to be truncated.
	 * @param {Function} callback
	 */
	truncate: function(table, callback) {
		this.disableBuilder = true;
		this.setTextQuery('TRUNCATE TABLE ' + table)
			.execute(_.isFunction(callback) ? callback : function() {});

		//	Reset builder.
		this.reset();

		return this;
	},

	/**
	 * All for work with tables.
	 *
	 * @param {String} table table name.
	 */
	table: function(table) {
		table = this.private.wrapChar + table + this.private.wrapChar;

		return {
			/**
			 * Create new table.
			 * @example
			 * Cube.app.db.createCommand().table('tmp_table').create({
			 *		id: 'pk',
			 *		alias: 'VARCHAR(128)'
			 *	}, 'ENGINE=InnoDB', function(err) {
			 *		//
			 *	});
			 *
			 * @param {Object} columns
			 * @param {String} options
			 * @param {Function} callback
			 */
			create: function(columns, options, callback) {
				var body = [];

				if (!_.isString(options)) {
					options = '';
				}

				if (!options) {
					options = 'ENGINE=InnoDB';
				}

				_.each(columns, function(type, name) {
					switch (type.trim()) {
						case 'pk':
							type = 'INT NOT NULL AUTO_INCREMENT PRIMARY KEY';
							break;
					}

					//	TODO: Add regexp for validate columns.
					body.push(name + ' ' + type);
				});

				if (body.length === 0) {
					//	TODO: throw
					callback('No columns during create table');
					return;
				}

				this.disableBuilder = true;
				return this.setTextQuery('CREATE TABLE ' + table + ' (' + body.join(',') + ') ' + options)
					.execute(_.isFunction(callback) ? callback : function() {})
					.reset();
			}.bind(this),

			/**
			 * Drop table.
			 * @example
			 * Cube.app.db.createCommand().table('tmp_table').drop(function(err) {
			 *		//
			 * });
			 *
			 * @param {Function} callback
			 */
			drop: function(callback) {
				this.disableBuilder = true;
				return this.setTextQuery('DROP TABLE ' + table)
					.execute(_.isFunction(callback) ? callback : function() {})
					.reset();
			}.bind(this),

			/**
			 * Rename table.
			 * @example
			 * Cube.app.db.createCommand().table('tmp_table').rename('new_name', function(err) {
			 *		//
			 *	});
			 *
			 * @param {String} name new name of table.
			 * @param {Function} callback
			 */
			rename: function(newName, callback) {
				this.disableBuilder = true;
				return this.setTextQuery('RENAME TABLE ' + table + ' TO ' + newName)
					.execute(_.isFunction(callback) ? callback : function() {})
					.reset();
			}.bind(this)
		};
	},

	/**
	 * All for work with columns of table.
	 *
	 * @param {String} table
	 * @param {String} column
	 */
	column: function(table, column) {
		table = this.private.wrapChar + table + this.private.wrapChar;
		column = this.private.wrapChar + column + this.private.wrapChar;

		return {
			/**
			 * Add new column.
			 * @example
			 * Cube.app.db.createCommand().column('table_name', 'column_name').add('VARCHAR(60)', '', function(err) { ...
			 *
			 * @param {String} type
			 * @param {Function} callback
			 */
			add: function(type, after, callback) {
				after = after ? ' AFTER ' + this.private.wrapChar + after + this.private.wrapChar : '';
				this.disableBuilder = true;
				return this.setTextQuery('ALTER TABLE ' + table + ' ADD ' + column + ' ' + type + after)
					.execute(_.isFunction(callback) ? callback : function() {})
					.reset();
			}.bind(this),

			/**
			 * Rename column.
			 * @example
			 * Cube.app.db.createCommand().column('table_name', 'column_name').rename('new_col_name', 'VARCHAR(60)', function(err) { ...
			 *
			 * @param {String} newName
			 * @param {String} type
			 * @param {Function} callback
			 */
			rename: function(newName, type, callback) {
				this.disableBuilder = true;
				return this.setTextQuery('ALTER TABLE ' + table + ' CHANGE ' + column + ' ' + newName + ' ' + type)
					.execute(_.isFunction(callback) ? callback : function() {})
					.reset();
			}.bind(this),

			/**
			 * Drop column.
			 * @example
			 * Cube.app.db.createCommand().column('table_name', 'column_name').drop(function(err) { ...
			 *
			 * @param {Function} callback
			 */
			drop: function(callback) {
				this.disableBuilder = true;
				return this.setTextQuery('ALTER TABLE ' + table + ' DROP ' + column)
					.execute(_.isFunction(callback) ? callback : function() {})
					.reset();
			}.bind(this)
		}
	}
});