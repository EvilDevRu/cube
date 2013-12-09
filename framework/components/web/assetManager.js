/**
 * Asset manager componen of web application.
 *
 * TODO: Middleware for setBaseUrl for true work of publish method..
 * TODO: https://github.com/nodeca/mincer
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
	 */
	construct: function() {
		var baseUrl = '/',
			basePath = Cube.app.basePath + '/assets';

		if (!_.fs.isDir(basePath)) {
			//	TODO: Throw
			throw this.basePath + ' path not exist. Make sure assets folder is exist!';
		}

		this.private = {
			published: {},
			fileMode: '0666',	//	TODO:
			dirMode: '0777',
			forceCopy: Cube.app.getIsDebugMode()
		};

		Cube.app.private.express.use(Cube.app.private.Express.static(basePath));

		/**
		 * @return {String} base path to assets folder.
		 */
		this.getBasePath = function() {
			return basePath;
		};

		/**
		 * @return {String} base url to assets folder.
		 */
		this.getBaseUrl = function() {
			return baseUrl;
		};

		/**
		 * @param {String} url url to assets folder.
		 */
		this.setBaseUrl = function(url) {
			baseUrl = (url + '').trim();
		};
	},

	/**
	 * @param {String} url the base url that the published asset files can be accessed.
	 */
	setBaseUrl: function(url) {
		this.baseUrl = (url + '').trim();
	},

	/**
	 * TODO: JsDoc
	 * TODO: Level support
	 * Publishes a file or a directory.
	 * This method will copy the specified asset to a web accessible directory
	 * and return the URL for accessing the published asset.
	 *
	 * @param {String} path
	 * @param {Integer} level
	 * @param {Boolean} path
	 */
	publish: function(path, level, forceCopy) {
		if (_.isEmpty(path)) {
			console.error('Empty asset path: ' + path);
			return '';
		}

		if (_.isUndefined(forceCopy)) {
			forceCopy = this.private.forceCopy;
		}

		if (this.private.published[ path ]) {
			return this.private.published[ path ];
		}

		var sourcePath = _.fs.isFile(path) ? _.fs.dirName(path) : path,
			assetsDir = this.genPath(path),
			assetsPath = this.getBasePath() + '/' + assetsDir;

		if ((_.isDir(assetsPath) && forceCopy) || !_.isDir(assetsPath)) {
			if (!_.copy(sourcePath, assetsPath)) {
				//	TODO: Throw
				throw 'Copying assets';
			}

			this.private.published[ path ] = this.getBaseUrl() + assetsDir + '/' + _.fs.baseName(path);
			return this.private.published[ path ];
		}
	},

	/**
	 * Path generator.
	 *
	 * @param {String} path
	 * @return {String}
	 */
	genPath: function(path) {
		return Cube.crc.crc32(_.dirName(path) + Cube.getVersion());
	}
});