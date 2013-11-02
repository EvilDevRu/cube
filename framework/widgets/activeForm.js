/**
 * Active form widget.
 * 
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

module.exports = Cube.Class({
	extend: Cube.CWebWidget,
	
	/**
	 * Init widget. Render form open tag.
	 */
	open: function() {
		'use strict';
		
		var result = '<form method="' + (this.params.method || 'POST') + '"',
			classes = [];

		if (this.params.action)
			result += ' action="' + this.params.action + '"';
			
		if (this.params.type == 'horizontal')
			classes.push('form-horizontal');
			
		if (this.params.id)
			result += ' id="' + this.params.id + '"';
			
		return result + (classes.length ? ' class="' + classes.join(' ') + '"' : '') + '>';
	},
	
	/**
	 * End widget.
	 */
	close: function() {
		'use strict';
		return '</form>';
	},
	
	/**
	 * Text field.
	 */
	textFieldRow: function(model, attribute, params) {
		'use strict';
		
		var attributeName = model.getAttributeLabel(attribute),
			errors = model.getErrors();

		if (!params)
			params = {};

		return '<div class="control-group">' +
			'<label class="control-label" for="' + attribute + '">' + attributeName + '</label>' +
			'<div class="controls">' +
				'<input type="text" ' + (params.id ? ' id="' + params.id + '"' : '') +
					' name="' + attribute + '"' +
					' value="' + this.req.request.get(attribute, '') + '" ' +
					' placeholder="">' +
				(params.hint ? ('<p class="help-block">' + params.hint + '</p>') : '') +
			'</div>' +
		'</div>';
	},
	
	/**
	 * Password field.
	 */
	passwordFieldRow: function(model, attribute, htmlOptions) {
		'use strict';
		
		if (!params)
			params = {};
		
		return '<div class="control-group">' +
			'<label class="control-label" for="' + attribute + '">' + attribute + '</label>' +
			'<div class="controls">' +
				'<input type="password" id="' + attribute + '" name="' + attribute + '" placeholder="">' +
				(!_.isEmpty(params.hint) ? ('<p class="help-block">' + params.hint + '</p>') : '') +
			'</div>' +
		'</div>';
	}
});
