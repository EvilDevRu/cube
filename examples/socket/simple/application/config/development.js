/**
 * Development configuration file.
 * 
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */
module.exports = {
	application: {
		host: 'localhost',
		port: 3030,
		profiler: true,
		
		//	Session storage (e.g. memory (by default), redis).
		session: {
			name: 'sid',
			store: 'memory'
		},
		
		//	Application socket params.
		socket: {
			//authorization: true,
			minification: true,
			etag: true,
			gzip: true,
			logLevel: 1
		}
	},
	
	//	Database settings section.
	database: {
		default: 'postgresql',						//	Database driver by default (mysql by default).
		mysql: {
			host: 'localhost',
			user: 'root',
			password: '123',
			database: 'evildev'
		},
		postgresql: {
			host: 'evildev.ru',
			user: 'evildev',
			password: '#wyLM+h*nH=}Gn<{DN.yHNTwm',
			database: 'evildev',
			ssl: true
		},
		redis: {
			host: 'localhost',
			password: '123'
			//database: 0
		}
	}
};
