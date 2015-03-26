/**
 * Expose a dummy object.
 */
module.exports = {
	debug: require('debug'),
	jQuery: require('jquery')  // Hack for jQuery plugins (attach it to window).
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
	WebRTCSupportWidget = require('./WebRTCSupportWidget'),

/**
 * Local variables.
 */
	tester,

/**
 * DOM.
 */
	dom = {};


debugerror.log = console.warn.bind(console);


$(document).ready(function () {
	var url = urlParse(global.location.toString(), true),
		testId;

	loadDOM();

	if (url.query.get) {
		testId = Number(url.query.get);
		getTest(testId);
	} else {
		runTest();
	}
});


function loadDOM() {
	dom.test = $('#test > .wrapper');
}


function runTest() {
	debug('runTest()');

	var webrtcSupportWidget,
		networkTestWidget;

	if (tester) {
		tester.cancel();
	}

	webrtcSupportWidget = new WebRTCSupportWidget({
		container: dom.test,
		local: true
	});

	tester = new Tester(settings, {
		cancel: function () {
			debug('test canceled');
		},

		webrtcsupport: function (supported) {
			if (supported) {
				webrtcSupportWidget.supported(true);
			} else {
				webrtcSupportWidget.supported(false);
			}
		},

		networkteststart: function (type) {
			debug('%s test starts', type);

			networkTestWidget = new NetworkTestWidget({
				type: type,
				container: dom.test,
				local: true
			});
		},

		networktestprogress: function (received, total) {
			networkTestWidget.progress(received, total);
		},

		networktestcomplete: function (type, statistics, packetsInfo, pendingOngoingData) {
			debug('%s test completed', type);

			networkTestWidget.draw(statistics, packetsInfo, pendingOngoingData);
		},

		networktesterror: function (type, error) {
			debug('%s test failed', type, error);

			networkTestWidget.fail(error);
		},

		complete: function () {
			debug('test completed');
		}
	});
}


function getTest(testId) {
	debug('getTest() | [testId:%d]', testId);
}
