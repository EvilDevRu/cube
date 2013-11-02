/**
 * ActiveRecord class for Redis.
 *
 * Data base structure:
 * objectName:
 *   ID:
 *     attribute1
 *     attribute2
 *     attribute3
 *       _:
 *         relations:
 *           objectName1 (set|zset)
 *           objectName2 (set|zset)
 *   _:
 *     lists:
 *       list1 (set|zset)
 *       list2 (set|zset)
 *     attributes: (for search by attributes)
 *       attribute1 -> id
 *       attribute2 -> id
 *       attribute3 -> id
 * objectName:
 *   ...
 *
 * NOTICE: Welcome to hell :)
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
		var attributes = {},
			attrsTTL = {},
			isNewRecord = true,
			arKey = '',
			identifier,
			cmdSetList = {
				list: 'rpush',
				set: 'sadd',
				zset: 'zadd'
			},
			cmdGetList = {
				list: 'lrange',
				set: 'smembers',
				zset: 'zrange'
			};

		/**
		 * @var {Object} private methods.
		 */
		this.private = {
			/**
			 * Converting key of value to redis command.
			 *
			 * @param {String} key
			 * @param {String} defVal
			 * @return {String} command name for attribute. Default by set command.
			 */
			name2Command: function(name, defVal) {
				return cmdSetList[ this.structure()[ name ].type ] || (!_.isUndefined(defVal) ? defVal : 'set');
			}.bind(this),

			/**
			 * @var {Array}
			 */
			relations: [],

			/**
			 * Retrieve record data by id.
			 *
			 * @param {String} object name of object.
			 * @param {Integer} id identify of record.
			 * @param {Object} qParams query params.
			 * @param {Function} callback
			 */
			findRecordDataById: function(object, id, qParams, callback) {
				var structure = [],
					result = {};

				if (!object) {
					object = this.objectName();
					structure = this.structure();
				} else {
					structure = Cube.models.redis(object).structure();
				}

				if (!qParams) {
					qParams = {};
				}

				structure.record = _.pairs(structure.record);
				//structure.lists = _.pairs(structure.lists);
				//structure.relations = _.pairs(structure.relations);

				Cube.app.redis.command().keys(object + ':' + id + ':*', function(err, keys) {
					if (err) {
						callback(err);
						return;
					}

					if (!keys.length) {
						callback();
						return;
					}

					/**
					 * Find item of a record recursive.
					 */
					var FindItemRecursive = function() {
						if (!structure.record.length) {
							if (this.private.relations.length && (!qParams.noRelations)) {
								//	Find relation.
								this.private.findRecordRelation(structure, object, id, result, qParams, callback);
							} else {
								callback(null, result, id);
							}

							return;
						}

						var item = structure.record.pop(),
							command = cmdGetList[ item[1].type ] || 'get',
							params = [ object + ':' + id + ':' + item[0] ];

						if (command.indexOf('range') !== -1) {
							params.push(0);
							params.push(-1);
						}

						params.push(function(err, data) {
							if (err) {
								callback(err);
								return;
							}

							result[ item[0] ] = item[1].type === 'integer' ? parseInt(data, 10) : data;
							FindItemRecursive();
						});

						Cube.app.redis.command(command).apply(Cube.app.redis.command(), params);
					}.bind(this);

					FindItemRecursive();
				}.bind(this));
			}.bind(this),

			/**
			 * Retrieve records data by ids.
			 *
			 * @param {String} object
			 * @param {Array} ids
			 * @param {Object} qParams
			 * @param {Function} callback
			 */
			findRecordDataByIds: function(object, ids, qParams, callback) {
				var result = {};

				/**
				 * Find recursive
				 */
				var FindDataRecursive = function() {
					if (!ids.length) {
						callback(null, result);
						return;
					}

					var id = ids.pop();

					qParams.noRelations = true;

					this.private.findRecordDataById(object, id, qParams, function(err, data) {
						if (err) {
							callback(err);
							return;
						}

						result[ id ] = data;
						FindDataRecursive();
					});
				}.bind(this);

				FindDataRecursive();
			}.bind(this),

			/**
			 * Find id by key record.
			 *
			 * @param {String} object name of object.
			 * @param {Object} attribute name of attribute for search.
			 * @param {Object} params params for search.
			 * @param {Function} callback
			 */
			findRecordIdByAttribute: function(object, attribute, params, callback) {
				var name = _.keys(attribute),
					value = _.values(attribute);

				if (!object) {
					object = this.objectName();
				}

				Cube.app.redis.command().get(object + ':_:attributes:' + name[0] + ':' + value[0], function(err, id) {
					if (err) {
						callback(err);
						return;
					}

					this.private.findRecordDataById(object, id, params, callback);
				}.bind(this));
			}.bind(this),

			/**
			 * Find relation of record.
			 *
			 * @param {Object} structure record structure.
			 * @param {String} object name of object.
			 * @param {Integer} id identify record.
			 * @param {Object} data data of record.
			 * @param {Object} qParams query params.
			 * @param {Function} callback
			 */
			findRecordRelation: function(structure, object, id, data, qParams, callback) {
				var relations = _.clone(this.private.relations);

				if (_.isEmpty(structure.relations)) {
					//	TODO: Throw
					callback('Relation not exist in structure!');
					return;
				}

				/**
				 * Find relation recursive.
				 */
				var FindRelationsRecursive = function() {
					if (!relations.length) {
						callback(null, data, id);
						return;
					}

					var relName = relations.pop(),
						relType = structure.relations[ relName ];

					if (!relType) {
						//	TODO: Throw
						console.warn('Redis active record. Relation not found!');
						FindRelationsRecursive();
						return;
					}

					var key = object + ':' + id + ':_:relations:' + relName;

					/**
					 * Callback for find by ids method.
					 */
					var FindByIdsCallback = function(err, relData) {
						if (err) {
							callback(err);
							return;
						}

						data[ relName ] = relData;

						//	Query params.
						if (qParams.relations && qParams.relations[ relName ]) {
							if (qParams.relations[ relName ].scores && relType === 'zset') {
								this.private.findScoresByValues(key, _.keys(relData), function(err, scores) {
									if (err) {
										//	TODO: Throw
										console.error('Could\'t get scores from redis!');
										FindRelationsRecursive();
										return;
									}

									for (var i in scores) {
										if (scores.hasOwnProperty(i)) {
											scores[ i ] = { score: scores[ i ] };
										}
									}

									data[ relName ] = _.merge(scores, data[ relName ]);

									FindRelationsRecursive();
								});
								return;
							}
						}

						FindRelationsRecursive();
					}.bind(this);

					if (relType === 'zset') {
						Cube.app.redis.command().zrange(key, 0, -1, function(err, ids) {
							if (err) {
								callback(err);
								return;
							}

							this.private.findRecordDataByIds(relName, ids, { noRelations: true }, FindByIdsCallback);
						}.bind(this));
					} else {
						Cube.app.redis.command().smembers(key, function(err, ids) {
							if (err) {
								callback(err);
								return;
							}

							this.private.findRecordDataByIds(relName, ids, { noRelations: true }, FindByIdsCallback);
						}.bind(this));
					}
				}.bind(this);

				FindRelationsRecursive();
			}.bind(this),

			/**
			 * Find scores by values.
			 *
			 * @param {String} key
			 * @param {Array} values
			 * @param {Function} callback
			 */
			findScoresByValues: function(key, values, callback) {
				var vals = _.clone(values),
					scores = {};

				/**
				 * Find scores recursive.
				 */
				var FindRecursive = function() {
					if (!vals.length) {
						callback(null, scores);
						return;
					}

					var value = vals.pop();

					Cube.app.redis.command().zscore(key, value, function(err, score) {
						if (err) {
							callback(err);
							return;
						}

						scores[ value ] = parseInt(score, 10);

						FindRecursive();
					});
				};

				FindRecursive();
			}
		};

		/**
		 * Getter and setter for isNewRecord.
		 *
		 * @param {Boolean} isNew if is exist, set new record state.
		 * @return {Boolean} true if this is a new record.
		 */
		this.isNewRecord = function(isNew) {
			if (!_.isUndefined(isNew)) {
				isNewRecord = isNew;
			}

			return isNewRecord;
		};

		/**
		 * Setter for attributes.
		 *
		 * @param {String|Integer|Float} name redis key name.
		 * @param {Mixed} value
		 * @return {RedisActiveRecord} this instance.
		 */
		this.set = function(name, value) {
			if (_.isObject2(name)) {
				attributes = _.merge(attributes, name);
				return this;
			}

			attributes[ name ] = value;
			return this;
		}.bind(this);

		/**
		 * Getter for attribute.
		 *
		 * @param {String|Integer|Float} name redis key name.
		 * @return {Mixed} attribute value.
		 */
		this.get = function(name) {
			return attributes[ name ];
		};

		/**
		 * @return {Object} all attributes.
		 */
		this.getAll = function() {
			return attributes;
		};

		/**
		 * Sets the attributes to be null.
		 *
		 * @param {Array} names list of attributes to be set null. If this parameter is not given,
		 *     all attributes will have their values unset.
		 * @return {RedisActiveRecord} this instance.
		 */
		this.unset = function(names) {
			if (!names) {
				attributes = {};
				return;
			}

			_.each((!_.isArray(names) ? [ names ] : names), function(value, name) {
				delete attributes[ name ];
			});

			return this;
		};

		/**
		 * Method for append and prepend method.
		 *
		 * @param {String} name name of attibute.
		 * @param {Integer|String|Float} value
		 * @param {Integer|Float} scope argument for sorting subset of the zset type.
		 * @return {RedisActiveRecord} this instance.
		 */
		var PrependAppend = function(name, value, scope, isPrepend) {
			var type = this.structure()[ name ].type;
			if (_.indexOf(['list', 'set', 'zset'], type) === -1) {
				console.warn('Did\'t append value');
				return this;
			}

			var val = (type === 'list' ? value : [ scope, value ]);

			if (!attributes[ name ]) {
				attributes[ name ] = [ val ];
				return this;
			}

			attributes[ name ][ isPrepend ? 'unshift' : 'push' ](val);
			return this;
		}.bind(this);

		/**
		 * Append new item to the list or set.
		 * In the case of the type of set, value will be set to attributes. If value is exist, then it will be overwritten.
		 *
		 * @param {String} name name of attibute.
		 * @param {Integer|String|Float} value
		 * @param {Integer|String|Float} sort argument for sorting subset of the zset type.
		 * @return {RedisActiveRecord} this instance.
		 */
		this.append = function(name, value, sort) {
			return PrependAppend(name, value, sort);
		};

		/**
		 * Prepend new item to the list or set.
		 * In the case of the type of set, value will be set to attributes. If value is exist, then it will be overwritten.
		 *
		 * @param {String} name name of attibute.
		 * @param {Integer|String|Float} value
		 * @return {RedisActiveRecord} this instance.
		 */
		this.prepend = function(name, value) {
			return PrependAppend(name, value, null, true);
		};

		/**
		 * Setter for identifier.
		 *
		 * @param {Integer} id redis object id.
		 * @return {RedisActiveRecord} this instance.
		 */
		this.setId = function(id) {
			identifier = parseInt(id, 10);
			return this;
		}.bind(this);

		/**
		 * Getter for identifier.
		 *
		 * @return {Integer} object identifier.
		 */
		this.getId = function() {
			return identifier;
		};

		/**
		 * Setter for TTL.
		 *
		 * @return {String|Integer|Float} name
		 * @param {Integer} ttl
		 * @return {RedisActiveRecord} this instance.
		 */
		this.setTTL = function(name, ttl) {
			if (ttl !== false && ttl > -1) {
				attrsTTL[ name ] = ttl;
			} else {
				delete attrsTTL[ name ];
			}
			return this;
		}.bind(this);

		/**
		 * Getter for TTL.
		 *
		 * @param {String|Integer|Float} name
		 * @param {Mixed} defaultValue
		 * @return {Mixed} ttl else defaultValue (default by false).
		 */
		this.getTTL = function(name, defaultValue) {
			return !_.isUndefined(attrsTTL[ name ]) ? attrsTTL[ name ] : (defaultValue || false);
		};

		/**
		 * Getter for key.
		 *
		 * @return {String} key of record.
		 */
		this.getKey = function() {
			return arKey;
		};

		/**
		 * Key builder.
		 *
		 * @param {Function} callback
		 */
		this.keyPrefixBuild = function(callback) {
			var redis = Cube.app.redis.command(),
				lastIdKey = this.objectName() + ':_lastId';

			if (!_.isFunction(callback)) {
				//	TODO: Throw
				console.error('You lost callback method!!');
				return;
			}

			/**
			 * SuccessWrapper
			 */
			var SuccessCallback = function() {
				arKey = this.objectName() + ':' + this.getId() + ':';
				callback(null, arKey);
			}.bind(this);

			if (this.getId()) {
				//	If set manual id.
				if (this.isNewRecord()) {
					redis.get(lastIdKey, function(err, lastId) {
						if (err) {
							callback(err);
							return;
						}

						//	FIXME: If not integer.
						if (this.getId() > lastId) {
							redis.set(lastIdKey, this.getId(), function(err) {
								if (err) {
									callback(err);
									return;
								}

								SuccessCallback();
							});

							return;
						}

						SuccessCallback();
					}.bind(this));

					return;
				}

				SuccessCallback();
				return;
			}

			redis.incr(lastIdKey, function(err, lastId) {
				if (err) {
					callback(err);
					return;
				}

				this.setId(lastId);
				SuccessCallback();
			}.bind(this));
		}.bind(this);

		/**
		 * Reset of the ActiveRecord.
		 *
		 * @return {RedisActiveRecord} this instance.
		 */
		this.reset = function() {
			this.isNewRecord(true);
			this.private.relations = [];
			identifier = null;
			return this.unset();
		}.bind(this);
	},

	/**
	 * @return {Object} active record structure.
	 */
	structure: function() {
		return {};
	},

	/**
	 * TODO: Testing for integer and float.
	 * @return {String|Integer|Float} object name.
	 */
	objectName: function() {
		return '';
	},

	/**
	 * Add relate.
	 *
	 * @param {Array|String} name
	 * @return {RedisActiveRecord} this instance.
	 */
	with: function(name) {
		if (_.isArray(name)) {
			_.merge(this.private.relations, name);
		} else {
			this.private.relations.push(name);
		}

		return this;
	},

	/**
	 * Save record.
	 *
	 * @param {Function} callback
	 */
	save: function(callback) {
		/*//	Convert attributes to array as [[key, value], ...].
		var attributes = _.pairs(this.getAll()),
			keyStack = [];

		*//**
		 * Recursive save keys for find.
		 *//*
		var SaveFindKeysRecursive = function() {
			if (!keyStack.length) {
				callback(null, this);
				return;
			}

			Cube.app.redis.command().set.apply(Cube.app.redis.command(), keyStack.pop());
		}.bind(this);

		*//**
		 * Recursive save attributes.
		 *
		 * @param {String} keyPrefix full key prefix for value.
		 *//*
		var SaveRecursive = function() {
			if (!attributes.length) {
				//	Build keys for find.
				_.each(this.keys(), function(key) {
					keyStack.push([ this.objectName() + ':_keys:' + key + ':' + this.get(key), this.getId(), SaveFindKeysRecursive ]);
				}.bind(this));

				SaveFindKeysRecursive();
				return;
			}

			var attribute = _.flatten(attributes.pop()),
				parts = [],
				command = this.private.name2Command(attribute[0]),
				needClean = (attribute[0] !== 'set'),
				ttl = this.getTTL(attribute[0]),
				keyPrefix = this.getKey();

			//	TODO: Move to validation method.
			if (!this.structure()[ attribute[0] ]) {
				//	TODO: Throw
				console.warn('Attribute is not in a structure and don\'t saved');
				SaveRecursive();
				return;
			}

			//	Split attribute items to parts if them too many.
			if (attribute.length > 100) {
				parts = _.chunk(this.get(attribute[0]), 100);
			}

			*//**
			 * Callback function for attribute.
			 *
			 * @param {Mixed} err
			 *//*
			var CallbackAttribute = function(err) {
				if (err) {
					callback(err);
					return;
				}

				if (needClean) {
					//	If the attribute has too many items.
					if (parts.length) {
						var part = _.flatten(parts.pop());
						if (!parts.length) {
							needClean = false;
						}

						Cube.app.redis.command(command).apply(Cube.app.redis.command(), [ attribute[0] ].concat(part, CallbackAttribute));
						return;
					}

					Cube.app.redis.command(command).apply(Cube.app.redis.command(), attribute);
					needClean = false;
					return;
				}

				if (ttl !== false) {
					Cube.app.redis.command().expire(attribute[0], ttl, CallbackAttribute);
					ttl = false;
					return;
				}

				SaveRecursive();
			};

			//	Add prefix to key.
			attribute[0] = keyPrefix + attribute[0];

			//	Append callback function.
			attribute.push(CallbackAttribute);

			if (needClean) {
				Cube.app.redis.command().del(attribute[0], CallbackAttribute);
				return;
			}

			//	TODO: May be replace to SET?
			Cube.app.redis.command(command).apply(Cube.app.redis.command(), attribute);
		}.bind(this);

		*//**
		 * If it is new model, invoke find method before save.
		 *//*
		var Start = function() {
			if (this.isNewRecord()) {
				this.find(this.getId(), function(err) {
					if (err) {
						//	TODO: Throw
						callback('Err find before save!');
						return;
					}

					SaveRecursive();
				});
				return;
			}

			SaveRecursive();
		};

		if (this.getKey()) {
			Start();
			return this;
		}

		this.keyPrefixBuild(function(err, keyPrefix) {
			if (err) {
				callback(err);
				return;
			}

			this.setKey(keyPrefix);
			Start();
		});*/
	},

	/**
	 * Find the record.
	 *
	 * @param {Object|String} q query
	 * @param {Object} qParams query params.
	 * @returns {*}
	 */
	find: function(q, qParams) {
		var ids = _.values(arguments),
			//scores = {},
			forAllResult = {};

		/**
		 * Get data of record recursive.
		 *
		 * @param {Function} callback
		 */
		var GetAllDataRecursive = function(callback) {
			if (!ids.length) {
				callback(null, forAllResult);
				return;
			}

			var id = parseInt(ids.pop(), 10);

			this.private.findRecordDataById(null, id, qParams, function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				if (data) {
					forAllResult[ id ] = data;
				}

				GetAllDataRecursive(callback);
			});
		}.bind(this);

		return {
			/**
			 * Find one active record.
			 */
			one: function(callback) {
				/**
				 * Callback function for find method.
				 */
				var FindCallback = function(err, data, id) {
					if (err) {
						callback(err);
						return;
					}

					if (data) {
						this.set(data);
						this.setId(id);
						this.isNewRecord(false);
					}

					callback(null, this);
				}.bind(this);

				if (_.isObject2(q)) {
					this.private.findRecordIdByAttribute(null, q, qParams, FindCallback);
					return;
				}

				this.private.findRecordDataById(null, q, qParams, FindCallback);
			}.bind(this),

			/**
			 * Find all data of object.
			 */
			all: function(callback) {
				if (!q) {
					Cube.app.redis.command().keys(this.objectName() + ':*', function(err, data) {
						if (err) {
							callback(err);
							return;
						}

						_.each(data, function(item) {
							ids.push(item.split(':')[1]);
						});

						ids = _.uniq(ids);
						GetAllDataRecursive(callback);
					}.bind(this));

					return;
				}

				if (_.isArray(q)) {
					ids = q;
				}

				GetAllDataRecursive(callback);
			}.bind(this),

			/**
			 * Find records by list.
			 *
			 * @param {Function} callback
			 */
			list: function(callback) {
				if (!q) {
					q = 'all';
				}

				//	TODO: Limit param need test.
				var type = this.structure().lists[ q ],
					command = '',
					params = qParams || {},
					argvs = [ this.objectName() + ':_:lists:' + q ];

				switch (type) {
					case 'set':
						command = 'smembers';
						break;

					case 'zset':
						command = 'zrange';
						if (params.limit) {
							if (_.isArray(params.limit)) {
								argvs.push(params.limit[0]);
								argvs.push(params.limit[1]);
							} else {
								argvs.push(0);
								argvs.push(params.limit);
							}
						} else {
							argvs.push(0);
							argvs.push(-1);
						}
						break;

					default:
						//	TODO: Throw
						callback('Error structure `' + this.objectName() + '` list section.');
						return;
				}

				argvs.push(function(err, data) {
					if (err) {
						callback(err);
						return;
					}

					ids = data;
					if (_.isNumber(params.limit) && ids.length > params.limit) {
						ids = ids.slice(0, params.limit);
					}

					if (params.scores) {
						GetAllDataRecursive(function(err, data) {
							if (err) {
								callback(err);
								return;
							}

							this.private.findScoresByValues(argvs[0], _.keys(data), function(err, scores) {
								if (err) {
									callback(err);
									return;
								}

								_.each(data, function(item, id) {
									data[ id ].score = scores[ id ];
								});

								callback(null, data);
							});
						}.bind(this));

						return;
					}

					GetAllDataRecursive(callback);
				}.bind(this));

				Cube.app.redis.command(command).apply(Cube.app.redis.command(), argvs);
			}.bind(this)
		};
	},

	/**
	 * Delete record.
	 *
	 * @param {Function} callback
	 */
	delete: function(callback) {
		if (!this.getId()) {
			//	TODO: Throw.
			callback('You need id of active record');
			return;
		}

		/**
		 * Find all keys and delete them.
		 */
		var Delete = function() {
			var keyStack = [];

			/**
			 * Recursive delete keys for find.
			 */
			var DeleteFindKeysRecursive = function() {
				if (!keyStack.length) {
					callback(null, this);
					return;
				}

				Cube.app.redis.command().del.apply(Cube.app.redis.command(), keyStack.pop());
			};

			Cube.app.redis.command().keys(this.getKey() + '*', function(err, keys) {
				if (err || _.isEmpty(keys)) {
					//	TODO: Throw.
					callback(err || 'Record is not exist!');
					return;
				}

				/**
				 * Recursive delete method.
				 */
				var DeleteRecursive = function() {
					if (!keys.length) {
						//	Build keys for find.
						_.each(this.keys(), function(key) {
							keyStack.push([ this.objectName() + ':_keys:' + key + ':' + this.get(key), DeleteFindKeysRecursive ]);
						}.bind(this));

						DeleteFindKeysRecursive();
						return;
					}

					Cube.app.redis.command().del(keys.pop(), function(err) {
						if (err) {
							callback(err);
							return;
						}

						DeleteRecursive();
					});
				}.bind(this);

				DeleteRecursive();
			}.bind(this));
		}.bind(this);

		if (this.getKey()) {
			Delete();
			return this;
		}

		this.keyPrefixBuild(function(err) {
			if (err) {
				callback(err);
				return;
			}

			Delete();
		});
	}
});