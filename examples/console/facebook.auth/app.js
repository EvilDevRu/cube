/**
 * Console application working on the cubeframework.
 * Facebook authorisation example.
 * 
 * ATTENTION:
 * 	This example is provided for only reference.
 * 	Do not use in a your projects!
 * 
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @link http://cubeframework.com/
 * @copyright Copyright &copy; Dmitriy Yurchenko 2013
 * @license http://cubeframework.com/license/
 */
require('./../../../framework');

var appDir = __dirname + '/application';

//	Create and run application.
Cube.createConsoleApplication(appDir, function() {
	Cube.run();
});