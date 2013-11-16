/**
 * NavBar widget.
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

		var result = '<nav class="navbar navbar-default' + (this.params.fixed ? ' navbar-fixed-' + this.params.fixed : '') +
			(this.params.isInverse ? ' navbar-inverse' : '') + '" role="navigation">' +
			(this.params.inContainer ? '<div class="container">' : '') +
			'<div class="navbar-header">' +
				'<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">' +
					'<span class="sr-only">Toggle navigation</span>' +
					'<span class="icon-bar"></span>' +
					'<span class="icon-bar"></span>' +
					'<span class="icon-bar"></span>' +
				'</button>' +
				(this.params.brand ? '<a class="navbar-brand" href="' + (this.params.brand.href || '#') + '">' + this.params.brand.name + '</a>' : '') +
			'</div>' +
			'<div class="collapse navbar-collapse navbar-ex1-collapse">';

		//	Build menu.
		_.each(Cube.app.config.navbar, function(nav, pull) {
			result += '<ul class="nav navbar-nav' + (pull !== 'middle' ? ' pull-' + pull : '') + '">';
			_.each(nav, function(item) {
				item.name = _.strReplace(item.name || '', '{USER_NAME}', this.middlewares.user.get('name'));
				item.name = _.strReplace(item.name || '', '{SITE_NAME}', Cube.app.config.siteName);
				item.url = _.strReplace(item.url || '', '{SITE_URL}', Cube.app.config.siteUrl);

				if (item.submenu.length) {
					result += '<li class="dropdown"><a href="' + (item.url || '#') + '" class="dropdown-toggle" data-toggle="dropdown">' +
						(item.params.icon ? ' <span class="glyphicon glyphicon-' + item.params.icon + '"></span>&nbsp;&nbsp;' : '') +
						item.name + ' <span class="caret"></span></a>';
				} else {
					result += '<li><a href="' + (item.url || '#') + '">' +
						(item.params.icon ? ' <span class="glyphicon glyphicon-' + item.params.icon + '"></span>&nbsp;&nbsp;' : '') +
						item.name + '</a>';
				}

				if (item.submenu.length) {
					result += '<ul class="dropdown-menu">';
					_.each(item.submenu, function(subitem) {
						result += '<li><a href="' + (subitem.url || '#') + '">' +
							(subitem.params.icon ? ' <span class="glyphicon glyphicon-' + subitem.params.icon + '"></span>&nbsp;&nbsp;' : '') +
							subitem.name + '</a></li>';
					});
					result += '</ul>';
				}

				result += '</li>';
			}.bind(this));
			result += '</ul>';
		}.bind(this));

				/*'<ul class="nav navbar-nav">' +
					'<li class="active"><a href="#">Link</a></li>' +
					'<li><a href="#">Link</a></li>' +
					'<li class="dropdown">' +
						'<a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <b class="caret"></b></a>' +
						'<ul class="dropdown-menu">' +
							'<li><a href="#">Action</a></li>' +
							'<li><a href="#">Another action</a></li>' +
							'<li><a href="#">Something else here</a></li>' +
							'<li><a href="#">Separated link</a></li>' +
							'<li><a href="#">One more separated link</a></li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<form class="navbar-form navbar-left" role="search">' +
					'<div class="form-group">' +
						'<input type="text" class="form-control" placeholder="Search">' +
					'</div>' +
					'<button type="submit" class="btn btn-default">Submit</button>' +
				'</form>' +
				'<ul class="nav navbar-nav navbar-right">' +
					'<li><a href="#">Link</a></li>' +
					'<li class="dropdown">' +
						'<a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <b class="caret"></b></a>' +
						'<ul class="dropdown-menu">' +
							'<li><a href="#">Action</a></li>' +
							'<li><a href="#">Another action</a></li>' +
							'<li><a href="#">Something else here</a></li>' +
							'<li><a href="#">Separated link</a></li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +*/


		return result + '</div>' + (this.params.inContainer ? '</div>' : '') + '</nav>';
	}
});
