/**
 * Date formatter using `moment`.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

var moment = require('moment');

module.exports = Cube.Singleton({
	/**
	 * @constructor
	 */
	construct: function() {
		moment.lang(Cube.app.config.application.language);
	},

	/**
	 * Date format by template.
	 *
	 * @param {String} template
	 * @param {Date} date
	 * @return {String} formatted date.
	 */
	format: function(template, date) {
		return moment(date).format(template);
	}
});