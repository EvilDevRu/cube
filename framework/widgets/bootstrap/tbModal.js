/**
 * Modal widget.
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
		var result = '<div class="modal fade"';

		if (this.params.id) {
			result += ' id="' + this.params.id + '" tabindex="-1" role="dialog" aria-labelledby="' + this.params.id + 'Label" aria-hidden="true"';
		}

		result += '><div class="modal-dialog">' +
			'<div class="modal-content">' +
				'<div class="modal-header">' +
					'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
					'<h4 class="modal-title">' + (this.params.title || '') + '</h4>' +
				'</div>' +
				'<div class="modal-body">' + (this.params.body || '') + '</div>' +
				'<div class="modal-footer">';

		if (_.isArray(this.params.buttons)) {
			_.each(this.params.buttons, function(btn) {
				var classes = '';

				if (btn.class) {
					classes = ' ' + _.isArray(btn.class) ? btn.class.join(' ') : btn.class;
				}

				result += '<button type="button" class="btn btn-' + (btn.type || 'default') + classes + '"' +
					(btn.close ? ' data-dismiss="modal"' : '') +
					(btn.loadingText ? ' data-loading-text="' + btn.loadingText + '"' : '') +
					(btn.toggle ? ' data-toggle="button"' : '') +
					(btn.onClick ? ' onclick="' + btn.onClick + '"' : '') +
					(btn.id ? ' id="' + btn.id + '"' : '') + '>' + btn.name + '</button>';
			});
		}

		return result + '</div></div></div></div>';
	}
});
