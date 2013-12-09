/**
 * Helper library contains functional of underscore library
 * and additional functions for Cube framework.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = {
	/**
	 * Returns trailing name component of path.
	 *
	 * @param {String} path path to a file.
	 * @param {String} suffix if path ends for suffix then erase it.
	 * @return {String}
	 */
	baseName: function(path, suffix) {
		path = path.replace(/^.*[\/\\]/g, '');
		if (_.isString(suffix) && path.substr(path.length - suffix.length) === suffix) {
			path = path.substr(0, path.length - suffix.length);
		}

		return path;
	},

	/**
	 * Given a string containing the path of a file or directory.
	 *
	 * @param path path to a directory or file.
	 * @return {String}
	 */
	dirName: function(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
	},

	/**
	 * Returns extension of a file.
	 *
	 * @param {String} fileName name of file.
	 * @return {String} file extension.
	 */
	fileExt: function(fileName) {
		return _.isString(fileName) ? _.last(fileName.split('.')) : '';
	},

	/**
	 * Tells whether the path is a regular file.
	 *
	 * @param {String} path path to a file.
	 * @returns {Boolean}
	 */
	isFile: function(path) {
		try {
			return Cube.fs.lstatSync(path).isFile();
		}
		catch (e) {
			return false;
		}
	},

	/**
	 * Tells whether the dirName is a directory.
	 *
	 * @param {String} path path to a directory.
	 * @returns {Boolean}
	 */
	isDir: function(path) {
		try {
			return Cube.fs.lstatSync(path).isDirectory();
		}
		catch (e) {
			return false;
		}
	},

	/**
	 * Make directory.
	 *
	 * @param {String} path path to a directory.
	 * @param {Integer} mode directory access mode.
	 * @returns {Boolean} returns true if directory is successfully created.
	 */
	mkDir: function(path, mode) {
		try {
			Cube.fs.mkdirSync(path, mode);
		}
		catch (e) {
			return false;
		}

		return true;
	},

	/**
	 * Copy file or directory.
	 * If callback is a function then files will be copying as async
	 * or else copying sync if callback is not a function.
	 *
	 * @param {String} source
	 * @param {String} destination
	 * @param {Function} callback (optional)
	 * @return {Boolean}
	 */
	copy: function(source, destination, callback) {
		var params = {
			forceDelete: true,
			excludeHiddenUnix: false
		};

		try {
			//	TODO: Rewrite without outside modules.
			if (_.isFunction(callback)) {
				Cube.wrench.copyDirRecursive(source, destination, params, callback);
				return;
			}

			Cube.wrench.copyDirSyncRecursive(source, destination, params);
		}
		catch (e) {
			console.error(e);
			return false;
		}

		return true;
	},
};