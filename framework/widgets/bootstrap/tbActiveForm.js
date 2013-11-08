/**
 * Active form widget.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Class({
	extend: Cube.CWebWidget,
	
	/**
	 * Init widget. Render form open tag.
	 */
	open: function() {
		var result = '<form method="' + (this.params.method || 'POST') + '"' +
				(this.params.action ? ' action="' + this.params.action + '"' : '') +
				(!_.isUndefined(this.params.id) ? ' id="' + this.params.id + '"' : ''),
			classes = [];
			
		if (this.params.type === 'horizontal') {
			classes.push('form-horizontal');
		}
			
		return result + (classes.length ? ' class="' + classes.join(' ') + '"' : '') + '>';
	},
	
	/**
	 * End widget.
	 */
	close: function() {
		return '</form>';
	},
	
	/**
	 * Text field.
	 *
	 * @param model
	 * @param attribute
	 * @param params
	 */
	textFieldRow: function(model, attribute, params) {
		if (!model) {
			//	TODO: Throw
			console.error('Model is need!');
			return;
		}

		var attributeName = model.getAttributeLabel(attribute),
			//errors = model.getErrors(),
			id = model.getName() + '_' + attribute,
			name = model.getName() + '[' + attribute + ']';

		if (!params) {
			params = {};
		}

		return '<div class="form-group">' +
				'<label for="' + attribute + '" class="col-lg-2 control-label">' + attributeName + '</label>' +
				'<div class="col-lg-10">' +
					'<input type="text" name="' + name + '" class="form-control" id="' + id + '" placeholder="' + (params.placeholder || '') +
						'" value="' + model.get(attribute, '') + '">' +
					(params.hint ? ('<span class="help-block">' + params.hint + '</span>') : '') +
				'</div>' +
			'</div>';
	},
	
	/**
	 * Password field.
	passwordFieldRow: function(model, attribute, params) {
		//TODO
	},
	 */

	/**
	 * Textarea.
	 *
	 * @param model
	 * @param attribute
	 * @param params
	 */
	textAreaRow: function(model, attribute, params) {
		var attributeName = model.getAttributeLabel(attribute),
			//errors = model.getErrors(),
			id = model.getName() + '_' + attribute,
			name = model.getName() + '[' + attribute + ']',
			editor = '';

		if (!params) {
			params = {};
		}

		switch (params.type) {
			case 'ckeditor':
				editor = '<textarea class="form-control ckeditor" name="' + name + '" id="' + id + '" placeholder="' +
					(params.placeholder || '') + '">' + Cube.html.entries(model.get(attribute, '')) + '</textarea>';
				break;

			case 'elrte':
				//	TODO: Params support.
				editor = '<textarea class="form-control" name="' + name + '" placeholder="' +
					(params.placeholder || '') + '" id="' + id + '">' + Cube.html.entries(model.get(attribute, '')) + '</textarea>' +
					'<script>$("#' + id + '").elrte({' +
						'lang: "ru",' +
						'styleWithCSS : false,' +
						'height: 400,' +
						'toolbar: "maxi"' +
					'});</script>';
				break;

			default:
				editor = '<textarea class="form-control" name="' + name + '" id="' + id + '" placeholder="' +
					(params.placeholder || '') + '"' + (!_.isUndefined(params.rows) ? ' rows="' + params.rows + '"' : '') +
					'>' + Cube.html.entries(model.get(attribute, '')) + '</textarea>';
				break;
		}

		return '<div class="form-group">' +
				'<label for="' + attribute + '" class="col-lg-2 control-label">' + attributeName + '</label>' +
				'<div class="col-lg-10">' + editor +
					(params.hint ? ('<span class="help-block">' + params.hint + '</span>') : '') +
				'</div>' +
			'</div>';
	},

	/**
	 * Select row.
	 *
	 * @param params
	 * @returns {string}
	 */
	dropDownListRow: function(model, attribute, listData, params) {
		var attributeName = model.getAttributeLabel(attribute),
			//errors = model.getErrors(),
			id = model.getName() + '_' + attribute,
			name = model.getName() + '[' + attribute + ']',
			currentVal = model.get(attribute, ''),
			html = '';

		if (!params) {
			params = {};
		}

		_.each(listData, function(item) {
			html += '<option value="' + item[0] + '"' + (currentVal === item[0] ? ' selected' : '') + '>' + item[1] + '</option>';
		});

		return '<div class="form-group">' +
				'<label for="' + attribute + '" class="col-lg-2 control-label">' + attributeName + '</label>' +
				'<div class="col-lg-4">' +
					'<select class="form-control" name="' + name + '" id="' + id + '">' + html + '</select>' +
					(params.hint ? ('<span class="help-block">' + params.hint + '</span>') : '') +
				'</div>' +
			'</div>';
	},

	/**
	 * Checkbox row.
	 *
	 * @param params
	 * @returns {string}
	 */
	checkBoxRow: function(model, attribute, params) {
		var attributeName = model.getAttributeLabel(attribute),
			id = model.getName() + '_' + attribute,
			name = model.getName() + '[' + attribute + ']',
			value = model.get(attribute, '');

		if (!params) {
			params = {};
		}

		return '<div class="form-group">' +
				'<div class="col-sm-offset-2 col-sm-10">' +
					'<div class="checkbox">' +
						'<label><input type="checkbox" name="' + name + '" id="' + id + '"' + (value ? ' checked' : '') +
						(params.disabled ? ' disabled="disabled"' : '') +
						'> ' + attributeName + '</label>' +
					'</div>' +
				'</div>' +
			'</div>';
	},

	/**
	 * Submit form button.
	 */
	submit: function(params) {
		return '<div class="form-group">' +
				'<div class="col-lg-offset-2 col-lg-10">' +
					'<button type="submit" class="btn btn-default">' + (params.name || 'Submit') + '</button>' +
				'</div>' +
			'</div>';
	}
});
