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
	SpinnerWidget = require('./SpinnerWidget'),
	ErrorWidget = require('./ErrorWidget'),
	TestInfoWidget = require('./TestInfoWidget'),

/**
 * Local variables and functions.
 */
	tester,
	pageUrl,
	dom = {},
	scrollingDown = false,
	scrollDown = function () {
		if (scrollingDown) {
			return;
		}

		scrollingDown = true;
		$('body').animate({ scrollTop: $(document).height() }, 2000, function () {
			scrollingDown = false;
		});
	};


debugerror.log = console.warn.bind(console);


$(document).ready(function () {
	var url = urlParse(global.location.toString(), true),
		testId;

	pageUrl = url.protocol + '//' + url.host + url.pathname;
	if (pageUrl[pageUrl.length - 1] !== '/') {
		pageUrl = pageUrl + '/';
	}

	loadDOM();

	if (url.query.testId) {
		testId = Number(url.query.testId);
		getTest(testId);
	} else {
		runTest();
	}
});


function loadDOM() {
	dom.test = $('#test > .wrapper');
	dom.warning = $('.warning');
}


function runTest() {
	debug('runTest()');

	var webrtcSupportWidget,
		networkTestWidget,
		results = {};

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

			hideWarning();
		},

		webrtcsupport: function (supported) {
			if (supported) {
				webrtcSupportWidget.supported(true);

				setTimeout(function () {
					showWarning();
				}, 2000);
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

			// Scroll down.
			scrollDown();

			// Store the result.
			results[type] = {
				statistics: statistics,
				packetsInfo: packetsInfo,
				pendingOngoingData: pendingOngoingData
			};
		},

		networktesterror: function (type, error) {
			debug('%s test failed', type, error);

			networkTestWidget.fail(error);

			// Scroll down.
			scrollDown();
		},

		complete: function () {
			debug('test completed');

			hideWarning();

			// Upload the results.
			uploadTest(results);
		}
	});
}


function showWarning() {
	// Show the warning for a while.
	dom.warning.fadeIn(500);

	setTimeout(function () {
		dom.warning.fadeOut(1000);
	}, 6000);

	$(document).click(function () {
		dom.warning.fadeOut(500);
	});
}


function hideWarning() {
	dom.warning.fadeOut(250);
}


function uploadTest(results) {
	debug('uploadTest()');

	var url = settings.REST.put,
		data,
		type,
		networkTest,
		spinnerWidget,
		testInfoWidget,
		errorWidget,
		locationHeader,
		testId;

	data = {
		webrtcSupport: true,
		connectivityTestDatas: []
	};

	for (type in results) {
		networkTest = results[type];

		data.connectivityTestDatas.push({
			type:                 type.toUpperCase(),
			packetCount:          networkTest.statistics.numPackets,
			packetSize:           networkTest.statistics.packetSize,
			sendingInterval:      networkTest.statistics.sendingInterval,
			duration:             networkTest.statistics.testDuration,
			optimalDuration:      networkTest.statistics.optimalTestDuration,
			outOrderPackets:      networkTest.statistics.outOfOrder,
			packetLoss:           networkTest.statistics.packetLoss,
			rtt:                  networkTest.statistics.RTT,
			bandwidth:            networkTest.statistics.bandwidth,
			optimalBandwidth:     networkTest.statistics.optimalBandwidth,
			ignoredInterval:      networkTest.statistics.ignoredInterval,
			chartData:            JSON.stringify({
				packetsInfo:          networkTest.packetsInfo,
				pendingOngoingData:   networkTest.pendingOngoingData
			})
		});
	}

	spinnerWidget = new SpinnerWidget({
		container: dom.test,
		text: 'uploading test data ...'
	});

	$.ajax(url, {
		method: 'PUT',
		contentType: 'application/json',
		processData: false,
		data: JSON.stringify(data),
		global: false,
		success : function (data, textStatus, jqXHR) {
			debug('upload success [textStatus:%s, data:%o]', textStatus, data);

			locationHeader = jqXHR.getResponseHeader('Location');
			if (!locationHeader) {
				showError('Error uploading test data: no Location header in response');
				return;
			}

			testId = locationHeader.match(/^http.*\/(\d+)$/i);
			if (!testId) {
				showError('Error uploading test data: no testId in response');
				return;
			}
			testId = testId[1];

			testInfoWidget = new TestInfoWidget({
				container: dom.test,
				text: 'Share the following link with others:',
				link: pageUrl + '?testId=' + testId
			});

			scrollDown();
		},
		error: function (jqXHR, textStatus, errorThrown) {
			debugerror('upload error [status:%s, error:%s]', textStatus, errorThrown);

			showError('Error uploading test data: ' + errorThrown);
		},
		complete: function () {
			spinnerWidget.remove();
		}
	});

	function showError(text) {
		errorWidget = new ErrorWidget({
			container: dom.test,
			text: text
		});

		scrollDown();
	}
}


function getTest(testId) {
	debug('getTest() | [testId:%d]', testId);

	var url = settings.REST.get + testId,
		spinnerWidget,
		errorWidget;

	spinnerWidget = new SpinnerWidget({
		container: dom.test,
		text: 'downloading test data ...'
	});

	$.ajax(url, {
		method: 'GET',
		processData: false,
		dataType: 'json',
		headers: {
			Accept: 'application/json'
		},
		global: false,
		success : function (data) {
			debug('get success [data:%o]', data);

			spinnerWidget.remove(true);
			showTest(data);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			debugerror('get error [status:%s, error:%s]', textStatus, errorThrown);

			spinnerWidget.remove(true);

			errorWidget = new ErrorWidget({
				container: dom.test,
				text: 'Error downloading test data: ' + errorThrown
			});
		}
	});

	function showTest(data) {
		var i,
			len,
			networkTest,
			webrtcSupportWidget,
			networkTestWidget,
			statistics,
			chartData;

		webrtcSupportWidget = new WebRTCSupportWidget({
			container: dom.test,
			local: false
		});

		webrtcSupportWidget.supported(data.webrtcSupport);

		for (i = 0, len = data.connectivityTestDatas.length; i < len; i++) {
			networkTest = data.connectivityTestDatas[i];

			statistics = {
				numPackets:            networkTest.packetCount,
				packetSize:            networkTest.packetSize,
				sendingInterval:       networkTest.sendingInterval,
				testDuration:          networkTest.duration,
				optimalTestDuration:   networkTest.optimalDuration,
				outOfOrder:            networkTest.outOrderPackets,
				packetLoss:            networkTest.packetLoss,
				RTT:                   networkTest.rtt,
				bandwidth:             networkTest.bandwidth,
				optimalBandwidth:      networkTest.optimalBandwidth,
				ignoredInterval:       networkTest.ignoredInterval
			};

			chartData = JSON.parse(networkTest.chartData);

			networkTestWidget = new NetworkTestWidget({
				type: networkTest.type.toLowerCase(),
				container: dom.test
			});

			networkTestWidget.draw(statistics, chartData.packetsInfo, chartData.pendingOngoingData);
		}
	}
}

