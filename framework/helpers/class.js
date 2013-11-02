/**
 * Helper class, give support OOP in the application.
 * Based on habrahabr user code.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = function(data) {
	var constructor = function() {},
		prototype = {},
		abstracts = data.abstracts || [],
		statics = data.statics || {},
		extend = data.extend || [];

	extend = _.isArray(extend) ? extend : [ extend ];

	if (!_.isUndefined(data.construct)) {
		constructor = data.construct;
	} else if (extend.length) {
		constructor = function() {
			//	Calling constructors of extending this class.
			if (extend) {
				for (var i = 0; i < extend.length; ++i) {
					extend[ i ].apply(this, arguments);
				}
			}
		};
	}

	_.each(extend, function(parent) {
		if (_.isFunction(parent.construct)) {
			parent.construct.call(constructor);
		}

		_.each(parent.prototype, function(fn, fnName) {
			if (_.isFunction(fn) && fnName !== 'construct') {
				prototype[ fnName ] = fn;
			}
		});

		//	Copy all function without constructor.
		_.each(parent, function(fn, fnName) {
			if (_.isFunction(fn) && fnName !== 'construct') {
				constructor[ fnName ] = fn;
			}
		});
	});
	
	//	Abstract methods.
	_.each(abstracts, function(method) {
		prototype[ method ] = function() {};
	});

	delete data.construct;
	delete data.abstracts;
	delete data.statics;
	delete data.extend;

	//	Methods of this class.
	_.each(data, function(fn, fnName) {
		if (_.isFunction(fn)) {
			prototype[ fnName ] = fn;
		}
	});
	
	//	Static methods.
	_.each(statics, function(fn, fnName) {
		if (_.isFunction(fn)) {
			constructor[ fnName ] = fn;
		}
	});
	
	/*proto.instanceOf = function(_class) {
		if (arguments.length > 1) {
			var res = true;
			for (var i = 0; i < arguments.length; i++)
				res = res && this.instanceOf(arguments[ i ]);
				
			return res;
		}

		if (constructor === _class)
			return true;

		for (var i = 0; i < extend.length; ++i) {
			if (extend[ i ].prototype.instanceOf.call(this, _class))
				return true;
		}

		return _class === Object;
	};*/
	
	//	Static constructor.
	if (_.isFunction(statics.construct)) {
		statics.construct.call(constructor);
	}

	constructor.prototype = prototype;
	constructor.functions = prototype;
	
	return constructor;
};