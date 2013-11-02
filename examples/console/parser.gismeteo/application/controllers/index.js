/**
 * Index controller.
 * Example for CubeFramework version 0.2.
 * 
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */

module.exports = Cube.Class({
	extend: Cube.CConsoleController,
	
	/**
	 * Parse weather.
	 * 
	 * @param {String} city city name.
	 */
	actionIndex: function(city) {
		'use strict';
		
		if (_.isEmpty(city)) {
			throw 'City parameter not set. Use --city=Москва';
		}

		Cube.utils.parser.post('http://informer.gismeteo.ru/getcode/index.php', { a2n: 156 }, function(error, $, body) {
			var cities = $('city'),
				cityId = 0;
				
			for (var i in cities) {
				if (cities.eq(i).text() === city) {
					cityId = cities.eq(i).attr('value');
					break;
				}
			}
			
			if (!cityId) {
				throw 'No find city. Try select other.';
			}
			
			this.get('http://www.gismeteo.ru/city/daily/' + cityId + '/', function(error, $, body) {
				if (error) {
					throw error;
				}
					
				var tempC = $('#weather .temp .m_temp.c').text(),
					tempF = $('#weather .temp .m_temp.f').text(),
					wind = $('#weather .m_wind.ms').text(),
					pressure = $('#weather .m_press.torr').text(),
					hum = $('#weather .wicon.hum').text(),
					waterC = $('#weather .wicon.water .c .unit').eq(1).remove().parent().text(),
					waterF = $('#weather .wicon.water .f .unit').eq(1).remove().parent().text();
					
				console.log('Current temprary: %s/%s (water: %s/%s)', tempC, tempF, waterC, waterF);
				console.log('Wind:', wind);
				console.log('Pressure:', pressure);
				console.log('Humidity:', hum);
				
				Cube.app.end();
			});
		});
	}
});