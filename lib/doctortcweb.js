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
	doctortc = require('doctortc'),
	rtcninja = doctortc.rtcninja,
	rtcninjaTemasys = require('rtcninja-temasys'),
	settings = require('../etc/doctortc-settings.json'),
	Tester = require('./Tester'),
	NetworkTestWidget = require('./NetworkTestWidget'),
	WebRTCSupportWidget = require('./WebRTCSupportWidget'),
	SpinnerWidget = require('./SpinnerWidget'),
	ErrorWidget = require('./ErrorWidget'),
	TestShareWidget = require('./TestShareWidget'),
	ButtonWidget = require('./ButtonWidget'),
	TestInfoWidget = require('./TestInfoWidget'),

/**
 * Local variables and functions.
 */
	tester,
	pageUrl,
	dom = {},
	warningHidden = false,
	scrollingDown = false,
	scrollDown = function () {
		if (scrollingDown) {
			return;
		}

		scrollingDown = true;
		$('body').animate({ scrollTop: $(document).height() }, 1000, function () {
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
	debug('runTest() [browser:"%s"]', doctortc.browser);

	rtcninjaTemasys({},
		// alreadyInstalledCb
		function () {
			rtcninja({plugin: rtcninjaTemasys});
			run();
		},
		// needInstallCb
		function () {
			debugerror('runTest() | WebRTC plugin required');

			showError('Error: This browser requires a WebRTC plugin');
		},
		// notRequiredCb
		function () {
			rtcninja();
			run();
		}
	);

	function run() {
		var webrtcSupportWidget,
			networkTestWidget,
			results = {},
			isFirstNetworkTest = true;

		if (tester) {
			tester.cancel();
		}

		webrtcSupportWidget = new WebRTCSupportWidget({
			container: dom.test,
			local: true
		});

		tester = new Tester(settings, {
			cancel: function (description) {
				debug('test canceled: %s', description);

				hideWarning();
				showError('test canceled: ' + description);
				showTestButton('Repeat the test');
			},

			webrtcsupport: function (supported) {
				if (supported) {
					webrtcSupportWidget.supported(true);

					setTimeout(function () {
						if (!warningHidden) {
							showWarning();
						}
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

				scrollDown();

				if (isFirstNetworkTest) {
					global.addEventListener('blur', function () {
						tester.cancel('browser tab lost focus');
					});
				}
				isFirstNetworkTest = false;
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

			networktesterror: function (type, error, description) {
				debug(type + ' test failed: ' + error + (description ? ' (' + description + ')' : ''));

				networkTestWidget.fail(error, description);

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
}


function showWarning() {
	// Show the warning for a while.
	dom.warning.fadeIn(500);

	setTimeout(function () {
		if (!warningHidden) {
			dom.warning.fadeOut(1000);
		}
	}, 10000);

	$(document).click(function () {
		if (!warningHidden) {
			dom.warning.fadeOut(500);
		}
	});
}


function hideWarning() {
	warningHidden = true;
	dom.warning.fadeOut(250);
}


function uploadTest(results) {
	debug('uploadTest()');

	var url = settings.REST.put,
		data,
		type,
		networkTest,
		spinnerWidget,
		testShareWidget,
		locationHeader,
		testId;

	data = {
		browser: doctortc.browser,
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

	scrollDown();

	$.ajax(url, {
		method: 'PUT',
		contentType: 'application/json',
		processData: false,
		data: JSON.stringify(data),
		global: false,
		success : function (data, textStatus, jqXHR) {
			debug('upload success');

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

			testShareWidget = new TestShareWidget({
				container: dom.test,
				text: 'Share the following link with others:',
				link: pageUrl + '?testId=' + testId
			});

			showTestButton('Repeat the test');

			scrollDown();
		},
		error: function (jqXHR, textStatus, errorThrown) {
			debugerror('upload error [status:%s, error:%s]', textStatus, errorThrown);

			showError('Error uploading test data: ' + errorThrown);

			showTestButton('Repeat the test');
		},
		complete: function () {
			spinnerWidget.remove();
		}
	});
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
			showTestButton('Test now!');
		},
		error: function (jqXHR, textStatus, errorThrown) {
			debugerror('get error [status:%s, error:%s]', textStatus, errorThrown);

			spinnerWidget.remove(true);

			errorWidget = new ErrorWidget({
				container: dom.test,
				text: 'Error downloading test data: ' + errorThrown
			});

			showTestButton('Test now!');
		}
	});

	function showTest(data) {
		var i,
			len,
			testInfoWidget,
			webrtcSupportWidget,
			connectivityTestDatas,
			networkTest,
			networkTestWidget,
			statistics,
			chartData;

		testInfoWidget = new TestInfoWidget({  // jshint ignore:line
			container: dom.test,
			testId: data.id,
			companyId: data.companyId || '-',
			browser: doctortc.browser,
			IP: data.ip,
			date: data.timestamp
		});

		webrtcSupportWidget = new WebRTCSupportWidget({
			container: dom.test,
			local: false
		});

		webrtcSupportWidget.supported(data.webrtcSupport);

		// Order network tests (udp, tcp, tls).
		connectivityTestDatas = data.connectivityTestDatas.sort(function (a, b) {
			if (a.type.toLowerCase() === 'udp') {
				return -1;
			} else if (a.type.toLowerCase() === 'tcp' && b.type.toLowerCase() === 'udp') {
				return 1;
			} else if (a.type.toLowerCase() === 'tcp' && b.type.toLowerCase() === 'tls') {
				return -1;
			} else if (a.type.toLowerCase() === 'tls') {
				return 1;
			} else {
				return 0;
			}
		});

		for (i = 0, len = connectivityTestDatas.length; i < len; i++) {
			networkTest = connectivityTestDatas[i];

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


function showTestButton(text) {
	var buttonWidget = new ButtonWidget({  // jshint ignore:line
		container: dom.test,
		text: text,
		link: pageUrl
	});
}


function showError(text) {
	var errorWidget = new ErrorWidget({  // jshint ignore:line
		container: dom.test,
		text: text
	});

	scrollDown();
}
