/**
 * Render middleware of web application.
 *
 * Allow use render view into a action of controller.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = function(req, res, next) {
	if (!req.middlewares) {
		req.middlewares = {};
	}

	/**
	 * Render view.
	 *
	 * @param {Object} context context of a action.
	 * @param {String} view name of view.
	 * @param {Object} data
	 */
	req.middlewares.render = function(context, view, data) {
		var ext = Cube.app.private.express.get('view engine');
		if (!_.isEmpty(view)) {
			view = view + ext;
		}

		res.render(context.viewDir + view, _.extend({
			layout: !_.isEmpty(context.layout) ? ('layouts/' + context.layout + ext) : false,
			it: req.middlewares,
			pageTitle: context.pageTitle || Cube.app.pageTitle,

			/**
			 * Creates a widget and execute it.
			 *
			 * @param {String} name widget name (can be in path alias format).
			 * @param {Object} params initial parameters.
			 * @return {String} execute result.
			 */
			widget: function(name, params) {
				name = 'C' + _.ucFirst(name) + 'Widget';
				if (!Cube[ name ]) {
					throw 'Widget ' + name + ' not found!';
				}

				return new Cube[ name ](req.middlewares, params).run();
			},

			/**
			 * Creates a widget and initialize it.
			 * This method is similar to widget() except that it is expecting a endWidget() call to end the execution.
			 *
			 * @param {String} name widget name (can be in path alias format).
			 * @param {Object} params initial parameters.
			 * @return {Widget}
			 */
			createWidget: function(name, params) {
				name = 'C' + _.ucFirst(name) + 'Widget';
				if (!Cube[ name ]) {
					throw 'Widget ' + name + ' not found! (createWidget)';
				}

				var widget = new Cube[ name ](req.middlewares, params);
				widget.init();

				return widget;
			}
		}, data));
	};

	/**
	 * Render error page.
	 *
	 * @param {Object} context
	 * @param {Integer} code error code for user
	 * @param {String} message error message for user
	 * @param {String} console error message for console output
	 */
	req.middlewares.error = function(context, code, error, consoleError) {
		var site = Cube.app.config.application.name || (Cube.app.config.application.host + ':' + Cube.app.config.application.port);

		if (!Cube.app.config.application.errors[ code ]) {
			if (Cube.app.config.application.errors['unknown']) {
				code = 'unknown';
			} else {
				//	TODO: Throw
				console.error('[' + site + '][' + code + '] (VIEW NOT FOUND!!!) ' + message + ' ::: ' + consoleError);
				return;
			}
		}

		if (consoleError) {
			//	TODO: Throw
			//	TODO: Full user info,
			console.error('[' + site + '][' + code + '] ' + consoleError);
		}

		var ext = Cube.app.private.express.get('view engine'),
			config = Cube.app.config.application.errors[ code ],
			view = 'layouts/' + config.view + ext;

		res.status(code).render(view, {
			it: req.middlewares,
			pageTitle: config.pageTitle || Cube.app.pageTitle,
			code: code,
			error: error
		});
	};

	next();
};