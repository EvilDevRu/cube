/**
 * Button widget.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

module.exports = Cube.Class({
	extend: Cube.CWebWidget,
	
	/**
	 * Run widget.
	 */
	run: function() {
		'use strict';
		
		//	TODO: size, disable
		var classes = ['btn'],
			types = ['primary', 'info', 'success', 'warning', 'danger', 'inverse', 'link'],
			result = '<button';
			
		if (_.indexOf(types, this.params.type) !== -1) {
			classes.push('btn-' + this.params.type);
		}
			
		if (this.params.class && (_.isArray(this.params.class) || _.isString(this.params.class))) {
			classes = _.merge(classes, _.isArray(this.params.class) ?
				this.params.class :
				this.params.class.split(','));
		}
			
		if (this.params.id) {
			result += ' id="' + this.params.id + '"';
		}
			
		return result + ' class="' + classes.join(' ') + '"' +
			(this.params.onClick ? (' onClick="' + this.params.onClick.split('"').join('\'') + '"') : '') +'>' +
			(this.params.name || '') + '</button>';
	}
});
