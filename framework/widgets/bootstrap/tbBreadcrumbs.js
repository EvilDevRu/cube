/**
 * Breadcrumbs widget.
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

		//var length = this.params.links.length - 1;
		var html = _.isArray(this.params.homeLink) ?
			'<li><a href="' + this.params.homeLink[1] + '">' + this.params.homeLink[0] + '</a></li> ' :
			'<li><a href="/">Главная</a></li> ';

		if (_.isArray(this.params.links)) {
			_.each(this.params.links, function(item) {
				html += '<li' + (_.isArray(item) ?
					('><a href="' + item[1] + '">' + item[0] + '</a></li> ') :
					(' class="active">' + item + '</li> '));
			}.bind(this));
		}

		return '<ol class="breadcrumb">' + html + '</ol>';
	}
});
