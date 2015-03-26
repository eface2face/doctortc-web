/**
 * Expose a dummy object.
 */
module.exports = {
	debug: require('debug')
};


/**
 * Dependencies.
 */
var debug = require('debug')('doctortcweb'),
	debugerror = require('debug')('doctortcweb:ERROR'),
	urlParse = require('url-parse'),
	$ = require('jquery'),
	settings = require('../etc/doctortc-settings.json'),
	Tester = require('./Tester'),
	NetworkTestWidget = require('./NetworkTestWidget'),

/**
 * Local variables.
 */
	tester;


debugerror.log = console.warn.bind(console);


$(document).ready(function () {
	var url = urlParse(global.location.toString(), true),
		testId;

	if (url.get) {
		testId = Number(url.get);
		getTest(testId);
	} else {
		runTest();
	}
});


function runTest() {
	debug('runTest()');

	var widget;

	if (tester) {
		tester.cancel();
	}

	tester = new Tester(settings, {
		cancel: function () {
			debug('test canceled');
		},

		webrtcsupport: function (result) {
			debug('haswebrtc: %s', result);
		},

		networkteststart: function (type) {
			debug('%s test starts', type);

			widget = new NetworkTestWidget(type);
		},

		networktestcomplete: function (type, statistics, packetsInfo, pendingOngoingData) {
			debug('%s test completed', type);

			widget.draw(statistics, packetsInfo, pendingOngoingData);
		},

		networktesterror: function (type, error) {
			debug('%s test failed', type, error);

			widget.fail(error);
		},

		complete: function () {
			debug('test completed');
		}
	});
}


function getTest(testId) {
	debug('getTest() | [testId:%d]', testId);
}
