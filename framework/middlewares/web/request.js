/**
 * Request middleware for web application class.
 *
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

var RequestMiddleware = Cube.Class({
	/**
	 * @constructor
	 */
	construct: function(req, res) {
		this.req = req;
		this.res = res;
	},

	/**
	 * Returns the named post parameter value.
	 * If the POST parameter does not exist, the second parameter to this method will be returned.
	 *
	 * @param {String} name
	 * @param {Mixed} defVal
	 * @param {String} name the post parameter name.
	 */
	get: function(name, defVal) {
		return !_.isUndefined(this.req.body[ name ]) ? this.req.body[ name ] : defVal;
	},

	/**
	 * Returns all post values.
	 *
	 * @return {Object}
	 */
	getAll: function() {
		return this.req.body || {};
	},

	/**
	 * Return query param by name.
	 *
	 * @param {String} name
	 * @param {Mixed} defVal
	 * @return {Mixed}
	 */
	getParam: function(name, defVal) {
		return !_.isUndefined(this.req.params[ name ]) ? this.req.params[ name ] : defVal;
	},

	/**
	 * Returns the currently requested URL.
	 *
	 * @returns {String}
	 */
	getUrl: function() {
		return this.req.protocol + '://' + this.req.get('host') + this.req.url;
	},

	/**
	 * Return true if the request is sent via secure channel (https).
	 *
	 * @returns {Boolean}
	 */
	isSecureConnection: function() {
		return (this.req.protocol === 'HTTPS');
	},

	/**
	 * Return true if this is a POST request.
	 *
	 * @returns {Boolean}
	 */
	isPostRequest: function() {
		return (this.req.method === 'POST');
	},

	/**
	 * Return true if this is a DELETE request.
	 *
	 * @returns {Boolean}
	 */
	isDeleteRequest: function() {
		return (this.req.method === 'DELETE');
	},

	/**
	 * Return true if this is a PUT request.
	 *
	 * @returns {Boolean}
	 */
	isPutRequest: function() {
		return (this.req.method === 'PUT');
	},

	/**
	 * End response.
	 */
	end: function() {
		this.res.end();
	},

	/**
	 * Send to client json status and message.
	 *
	 * @param {Integer} status
	 * @param {Mixed} data
	 */
	send: function(status, data) {
		this.res.write(JSON.stringify({
			status: status,
			data: data
		}));
		this.res.end();
	},

	/**
	 * Returns the URL referrer or null if not present.
	 *
	 * @returns {String|Null}
	 */
	getUrlReferer: function() {
		return this.req.headers.referer || null;
	},

	/**
	 * Returns the user agent or null if not present.
	 *
	 * @returns {String|Null}
	 */
	getUserAgent: function() {
		return this.req.headers['user-agent'] || null;
	},

	/**
	 * Returns the user IP address.
	 *
	 * @returns {String}
	 */
	getUserHostAddress: function() {
		return this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
	},

	/**
	 * Returns the user host name or null if it cannot be determined.
	 *
	 * @returns {String|Null}
	 */
	getUserHost: function() {
		return this.req.host;
	},

	/**
	 * @return {String} user current page location.
	 */
	getLocation: function() {
		return this.req.path;
	},

	/**
	 * TODO: Returns information about the capabilities of user browser.
	 *
	 * @param {String} userAgent the user agent to be analyzed. Don't use, meaning using the
	 *  current User-Agent HTTP header information.
	 * @return {String}
	 */
	getBrowser: function(userAgent) {
		var ua = (userAgent ? userAgent : this.getUserAgent()) || '';
		console.log(ua);
		//	Internet Explorer
		if (ua.indexOf('MSIE')) {
			//
		}
	},

	/**
	 * Redirects the browser to the specified URL.
	 *
	 * @param {String} url URL to be redirected to.
	 * @param {Integer} statusCode the HTTP status code. Defaults to 302.
	 *  See {@link http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html}
	 *  for details about HTTP status code.
	 */
	redirect: function(url, statusCode) {
		var params = _.isNumber(statusCode) ? [ statusCode, url ] : [ url ];
		this.res.redirect.apply(this.res, params);
	},

	/**
	 * Sends a file to user.
	 *
	 * @param {String} fileName file name.
	 * @param {String} statusCode
	 */
	sendFile: function(fileName, statusCode) {
		if (_.isNumber(statusCode)) {
			this.res.status(statusCode);
		}

		this.res.sendfile(fileName);
	}
});

module.exports = function(req, res, next) {
	if (!req.middlewares) {
		req.middlewares = {};
	}

	req.middlewares.request = new RequestMiddleware(req, res);

	next();
};