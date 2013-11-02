/**
 * elRTE wysiwyg editor widget.
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

		if (!this.params) {
			this.params = {};
		}

		//	If model has't exist.
		if (!this.params.model) {
			return this.withoutModel();
		}

		var attributeName = this.params.model.getAttributeLabel(this.params.attribute),
			//errors = model.getErrors(),
			id = this.params.model.getName() + '_' + this.params.attribute,
			name = this.params.model.getName() + '[' + this.params.attribute + ']';

		return '<textarea class="form-control" name="' + name + '" placeholder="' + (this.params.placeholder || '') +
			'" id="' + id + '">' + Cube.html.entries(this.params.model.get(this.params.attribute, '')) + '</textarea>' +
			'<script>$("#' + id + '").elrte({' +
				'lang: "ru",' +
				'styleWithCSS : false,' +
				'height: 400,' +
				'toolbar: "maxi"' +
			'});</script>';
	},

	/**
	 * If model has't exist
	 */
	withoutModel: function() {
		//	TODO:
		return '';
	}
});
