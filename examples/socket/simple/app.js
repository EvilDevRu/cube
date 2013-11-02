/**
 * Socket application working on the cubeframework.
 * 
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

require('./../../../framework');

//	Path to application folder.
var appDir = __dirname + '/application';

//	Create and run application.
Cube.createSocketApplication(appDir, function() {
	'use strict';

/*	var builder = new Cube.CSQLBuilder();
	var sql = builder
		.select('*')
		.select(['asd', 'dsa'])
		.select(['aaa'])
		.distinct()
		.all()
		.from('table1')
		.from(['table3', 'table4'])
		.from({ table5: 't5' })
		.where('z=4')
		.where('z=$1', { $1: 23 }, null, ' OR ')
		.where('z=$2', { $2: 32 }, null, ' OR ')
		.limit(1, 1)
		.order('z DESC')
		.build()
		.getTextQuery();

	console.log(sql);*/

/*	Cube.app.db.createCommand()
		.select('name')
		.from('test')
		.query().all(function(err, data) {
			console.log(err, data);
		});*/

/*	Cube.app.db.createCommand()
		.select('name')
		.from('test')
		.query().one(function(err, data) {
			console.log(err, data);
		});*/

/*	Cube.app.db.createCommand()
		.select('name')
		.from('test')
		.query().scalar(function(err, data) {
			console.log(err, data);
		});*/

	//	TODO: Testing for more one methods.
	//Cube.app.db.createCommand().insert().one('test', { name: 'test' });
/*	var cmd = Cube.app.db.createCommand().insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' })
		.insert().one('test', { name: 'test' });*/

/*	Cube.app.db.createCommand().insert().all('test', ['name'], [ ['title1'], ['title2'], ['title3'], ['title4'] ], function(err) {
		console.log(err);
	});*/

/*	Cube.app.db.createCommand().update('test', { name: 'Jack' }, 'id IN ($1, $2, $3)', [42, 43, 44], function(err) {
		console.log(err);
	});*/
/*	Cube.app.db.createCommand().delete('test', 'id IN ($1, $2)', [45, 46], function(err) {
		console.log(err);
	});*/

	//Cube.app.db.createCommand().truncate('test');


/*	cmd.query().scalar(function(err, data) {
		console.log(arguments);
	});*/
/*	var cmd = Cube.app.db.createCommand('INSERT INTO test (name) VALUES(\'sas\')');
	cmd.execute(function(err, data) {
		console.log(err, data);
	});*/

	/**
	 * ActiveRecord
	 */
/*	var test = Cube.app.model.mysql('test');

	test.attributes = {
		name: 'ttt234'
	};*/

/*	test.save(function(err) {
		if (err) {
			console.log(err);
		}

		var id = test.get('id');
		test.reset();
		test.find(id).one(function(err, test) {
			console.log(err, test.get('name'));
		});
	});*/

/*	test.find(20).one(function(err, test) {
		if (err) {
			console.log(err);
			return;
		}

		test.set('name', 'replaced1');
		test.save(function(err, test) {
			if (err) {
				console.log(err);
				return;
			}

			console.log(test.get('name'));
		});
	});*/

	var redis = Cube.app.model.redis('test');
/*	redis.setId(9).delete(function(err) {
		console.log(err);
	});*/

	redis.setId(9)
		.set('name', 'Jack Sparrow!')
		.set('loc', 'Captain!!!')
		.set('id', 1)
		.setTTL('id', false)
		.append('mylist', '1')
		.append('mylist', '2')
		.append('mylist', '3')
		.prepend('mylist', '4');

	for (var i = 0; i < 100; ++i) {
		redis.append('myzset', i + ' ' + Math.random() * 5, i * 2);
	}

	redis.save(function(err, redis) {
		console.log(err, 2);
		//console.log(err);

		redis.delete(function(err) {
			console.log(err);
		});
	});

/*	redis.find(9, function(err, redis) {
		//console.log(err, redis);
	});*/
});

/*
require('./../../../framework/helpers/underscore.ex.js');

var array1 = {
	db: 'sdf'
},
array2 = {
	db: {
		asd: 1
	}
}

console.log(_.merge(array1, array2));*/
