/**
 * AccessControl filtering middleware.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

/**
 * AccessControl performs authorization checks for the specified actions.
 *
 * How to use:
 *   Для начала вам необходимо активировать этот фильтр в классе, в котором вы хотите его использовать.
 *   filters: function() {
 *     return ['AccessControl'];
 *   },
 *
 *   Далее необходимо задать правила фильтрации. Для этого создадим метод `filterAccessControl`:
 *   filterAccessControl: function() {
 *     return {
 *       authPage: '/login/', // Optionally
 *       mainPage: '/',	// Optionally
 *       beforeFilter: function(callback) {	// Not support. TODO!
 *         callback();
 *       },
 *       afterFilter: function(callback) {	// Not support. TODO!
 *         callback();
 *       }
 *       rules: [
 *         ['allow', { actions: 'login', users: '?' }],
 *         ['deny', { actions: '*', users: '?' }],
 *         ['allow', { actions: '*', users: '@' }]
 *       ];
 *     }
 *   }
 *
 * actions - фильтруемые действия. Можно указать '*', тогда правила будут применены ко всем действиям.
 * users - пользователи, для которых действует правило. Могут быть:
 *   * - Любой пользователь.
 *   @ - Авторизированный пользователь.
 *   ? - Анонимный пользователь.
 * roles - роли пользователей TODO!
 * ips - фильтрация по ip адресам. TODO!
 * verbs - фильтрация по типу запросов. TODO!
 * expression - фильтрация по выражению. TODO!
 */

module.exports = function(req, res, next) {
	//	Check for enable filter.
	if (_.indexOf(this.filters(), 'AccessControl') === -1) {
		next();
		return;
	}

	var routes = this.routes(),
		fnAction = '',
		params = this.filterAccessControl(),
		authPage = params.authPage || '/login/',
		mainPage = params.mainPage || '/',
		userChars = {
			true: '?',
			false: '@'
		};

	//	Find called function name.
	_.every(routes, function(route, key) {
		if (route === req.route.path) {
			fnAction = key;
			return false;
		}

		return true;
	});

	//	Find rule.
	var status = _.every(params.rules || [], function(rule) {
		rule[1].actions = _.isArray(rule[1].actions) ? rule[1].actions : [ rule[1].actions ];

		if (_.indexOf(rule[1].actions, fnAction) !== -1 || rule[1].actions[0] === '*') {
			if ((rule[0] === 'allow' && _.indexOf([ userChars[ req.middlewares.user.isGuest() ], '*' ], rule[1].users) !== -1) ||
				(rule[0] === 'deny' && _.indexOf([ userChars[ !req.middlewares.user.isGuest() ], '*' ], rule[1].users) !== -1)) {
				next();
			}
			else if (rule[0] === 'deny' && _.indexOf([ userChars[ req.middlewares.user.isGuest() ], '*' ], rule[1].users) !== -1) {
				req.middlewares.request.redirect(authPage);
			}
			else {
				req.middlewares.request.redirect(mainPage);
			}

			return false;
		}

		return true;
	});

	//	TODO: Throw
	if (status) {
		console.warn('No rule for action', fnAction);
		req.middlewares.request.redirect(authPage);
	}
};