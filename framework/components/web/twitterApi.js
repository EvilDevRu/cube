/**
 * Twitter API component class.
 *
 * @see https://github.com/ttezel/twit
 * @author Dmitriy Yurchenko <feedback@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

'use strict';

module.exports = Cube.Singleton({
	/**
	 * @constructor
	 */
	construct: function() {
		var config = Cube.app.config.components.twitterApi,
			Twit = require('twit');

		/* jshint camelcase: false */
		this.private = {
			twit: new Twit({
				consumer_key: config.consumerKey,
				consumer_secret: config.consumerSecret,
				access_token: config.accessToken,
				access_token_secret: config.accessTokenSecret
			})
		};

		this.private.twit.get('followers/ids', { screen_name: 'evildev10' },  function(err, reply) {
			this.private.followers = reply.ids;
		}.bind(this));
		/* jshint camelcase: true */
	}
});