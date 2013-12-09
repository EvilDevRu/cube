/**
 * Builder of query base class for relational database management systems.
 *
 * For example:
 *     var sql = builder
 *         .select('*')
 *         .select(['asd', 'dsa'])
 *         .select(['aaa'])
 *         .distinct()
 *         .all()
 *         .from('table1')
 *         .from(['table3', 'table4'])
 *         .from({ table5: 't5' })
 *         .where('z=4')
 *         .where('z=$1', { $1: 23 }, null, ' OR ')
 *         .where('z=$2', { $2: 32 }, null, ' OR ')
 *         .limit(1, 1)
 *         .order('z DESC')
 *         .build()
 *         .getTextQuery();
 *
 * Result: SELECT ALL *,asd,dsa,aaa FROM table1,table3,table4,table5 AS t5 WHERE z=4 OR z=$1 OR z=$2 ORDER BY z DESC LIMIT 1, 1
 *
 * TODO: GROUP BY, HAVING.
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
	 */
	construct: function() {
		var sqlQuery = '',
			sqlParams = [];

		this.disableBuilder = false;
		this.private = _.merge({
			params: {
				default: {
					selectParam: 0,		//	0 - OFF, 1 - DISTINCT, 2 - DISTINCTROW, 3 - ALL
					select: [],
					from: [],
					where: [],
					limit: '',
					order: ''
				},
				build: {}
			}
		}, this.private || {});

		/**
		 * Specifies the SQL statement to be executed.
		 *
		 * @param {String} statement the SQL statement to be executed.
		 * @return {CSQLBuilder} this instance.
		 */
		this.setTextQuery = function(statement, noBuild) {
			this.disableBuilder = noBuild || false;

			if (!_.isEmpty(statement)) {
				sqlQuery = statement;
			}

			return this;
		};

		/**
		 * Build  and returns the SQL statement to be executed
		 *
		 * @return {String}
		 */
		this.getTextQuery = function() {
			return sqlQuery;
		};

		/**
		 * Adds additional parameters to be bound to the query.
		 * For example:
		 *  .addParams({ $1: 'Jack', $2: 'Captain' });
		 *
		 * @param {Object} params list of query parameter values indexed by parameter placeholders.
		 * @param {Boolean} reset replace parameters if true (default by false).
		 * @return {CSQLBuilder} this instance.
		 */
		this.addParams = function(params, reset) {
			if (reset) {
				sqlParams = [];
			}

			if (_.isArray(params)) {
				sqlParams = _.merge(sqlParams, params);
			}

			return this;
		};

		/**
		 * @return {Object} sql parameters.
		 */
		this.getParams = function() {
			return sqlParams;
		};

		/**
		 * Set build query params.
		 *
		 * @param {Object} params build query params.
		 * @return {CSQLBuilder} this instance.
		 */
		this.setBuildParams = function(params) {
			this.private.params.build = _.merge(this.private.params.build, params);
			return this;
		};

		/**
		 * Reset build query params.
		 *
		 * @param {Object} params reset build query params.
		 * @return {CSQLBuilder} this instance.
		 */
		this.resetBuildParams = function(params) {
			params = _.isArray(params) ? params : [ params ];	//	FIXME: may be bug

			_.each(params, function(param) {
				this.private.params.build[ param ] = this.defaultParams[ param ] || null;
			}.bind(this));

			return this;
		};
	},

	/**
	 * Selecting fields of result execute query.
	 *
	 * @param {Mixed} fields may be array or string fields.
	 * @return {CSQLBuilder} this instance.
	 */
	select: function(fields, reset) {
		if (reset) {
			this.resetBuildParams(['select']);
		}

		if (_.isEmpty(fields)) {
			fields = ['*'];
		}

		this.setBuildParams({
			select: _.isArray(fields) ? fields : [ fields ]
		});

		return this;
	},

	/**
	 * Set DISTINCT.
	 *
	 * @return {CSQLBuilder} this instance.
	 */
	distinct: function() {
		this.private.params.build.selectParam = 1;
		return this;
	},

	/**
	 * Set DISTINCTROW.
	 *
	 * @return {CSQLBuilder} this instance.
	 */
	distinctRow: function() {
		this.private.params.build.selectParam = 2;
		return this;
	},

	/**
	 * Set ALL.
	 *
	 * @return {CSQLBuilder} this instance.
	 */
	all: function() {
		this.private.params.build.selectParam = 3;
		return this;
	},

	/**
	 * Set tables for build query.
	 *
	 * @param {Mixed} tables may be string or array or object with pair tableName-alias.
	 * @param {Boolean} reset clean previous set tables.
	 * @return {CSQLBuilder} this instance.
	 */
	from: function(tables, reset) {
		if (reset) {
			this.resetBuildParams('from');
		}

		var from = [];
		if (_.isString(tables)) {
			from.push(tables);
		} else if (_.isArray(tables)) {
			from = tables;
		} else if (_.isObject(tables, true)) {
			_.each(tables, function(alias, tableName) {
				from.push(tableName + ' AS ' + alias);
			});
		}

		this.setBuildParams({
			from: from
		});

		return this;
	},

	/**
	 * Set condition for build query.
	 * TODO: jsDoc
	 * @param {Mixed} condition may be string or object.
	 * @param {Object} params the parameters as pair name-value to be bound to be query.
	 * @param {String} operator if condition is array then use operator for condition (default by '=').
	 * @return {CSQLBuilder} this instance.
	 */
	where: function(condition, params, operator, join) {
		var where = this.private.params.build.where || [];

		if (!join) {
			join = ' AND ';
		}

		if (_.isObject(condition, true)) {
			if (!operator) {
				operator = '=';
			}

			_.each(condition, function(val, key) {
				val = _.isString(val) ? val.trim() : val;
				if (_.isString(val) && (!/^\$[0-9]+$/.test(val) && val[0] !== ':')) {
					val = '\'' + val + '\'';
				} else if (val[0] === ':') {
					val = val.substr(1);
				}

				where.push((where.length ? join : '') + key + operator + val);
			});
		} else {
			where.push((where.length ? join : '') + condition);
		}

		this.addParams(params);
		this.private.params.build.where = where;

		return this;
	},

	/**
	 * Set order of query.
	 *
	 * @param {String} order order query result.
	 * @return {CSQLBuilder} this instance.
	 */
	order: function(order) {
		this.private.params.build.order = order;
		return this;
	},

	/**
	 * Set limit of query.
	 *
	 * @param {Integer} limit limit or start if length is set.
	 * @param {Integer} length
	 * @return {CSQLBuilder} this instance.
	 */
	limit: function(limit, length) {
		if (length) {
			limit += ', ' + length;
		}

		this.private.params.build.limit = limit;

		return this;
	},

	/**
	 * Building sql query.
	 *
	 * @param {Boolean} forceBuild force build query.
	 */
	build: function(forceBuild) {
		if (this.disableBuilder || !!forceBuild || !_.isEmpty(this.getTextQuery())) {
			return this;
		}

		var buildParams = _.merge(this.private.params.default, this.private.params.build),
			query = 'SELECT ';

		switch (buildParams.selectParam) {
			case 1:
				query += 'DISTINCT ';
				break;

			case 2:
				query += 'DISTINCTROW ';
				break;

			case 3:
				query += 'ALL ';
				break;
		}

		query += buildParams.select.length ?
			buildParams.select.join(',') :
			'*';

		if (buildParams.from.length) {
			query += ' FROM ' + buildParams.from.join(',');
		}

		if (buildParams.where.length) {
			query += ' WHERE ' + buildParams.where.join('');
		}

		if (buildParams.order) {
			query += ' ORDER BY ' + buildParams.order;
		}

		if (buildParams.limit) {
			query += ' LIMIT ' + buildParams.limit;
		}

		this.setTextQuery(query);

		return this;
	},

	/**
	 * Reset builder.
	 *
	 * @return {CSQLBuilder} this instance.
	 */
	reset: function() {
		this.setTextQuery('', false);
		this.addParams([], true);
		this.private.params.build = {};
		this.disableBuilder = false;

		return this;
	}
});