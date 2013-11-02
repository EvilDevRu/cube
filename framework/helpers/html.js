/**
 * HTML is a collection of helper methods for creating HTML views.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = {
	/**
	 * Generates the data suitable for list-based HTML elements.
	 *
	 * @param data a list of model objects. This parameter can also be array.
	 * @param valueField the attribute name for list option values.
	 * @param textField the attribute name for list option texts.
	 * @return {Array} the list data that can be used in dropDownList, listBox, etc.
	 */
	listData: function(data, valueField, textField) {
		var result = [];

		_.each(data, function(item) {
			result.push([ item[ valueField ], item[ textField ]  ]);
		});

		return result;
	},

	/**
	 * PHP function htmlentries.
	 *
	 * @param text
	 * @return {String}
	 */
	entries: function(text) {
		return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
};