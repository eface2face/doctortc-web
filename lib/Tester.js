/**
 * Expose the Tester class.
 */
module.exports = Tester;

/**
 * Dependencies.
 */
var debug = require('debug')('doctortcweb:Tester'),
	debugerror = require('debug')('doctortcweb:ERROR:Tester'),
	doctortc = require('doctortc'),

/**
 * Constants.
 */
	INTER_TEST_DELAY = 1200;


debugerror.log = console.warn.bind(console);


function Tester(settings, events) {
	debug('new() | [settings:%o]', settings);

	var self = this,
		key;

	this.settings = settings;
	this.events = events || {};
	this.testTypes = [];
	this.currentNetworkTester = undefined;
	this.closed = false;

	for (key in this.settings) {
		if (key === 'udp') {
			this.testTypes.push('udp');
		} else if (key === 'tcp') {
			this.testTypes.push('tcp');
		} else if (key === 'tls') {
			this.testTypes.push('tls');
		}
	}

	// Run the whole test in next iteration.
	setTimeout(function () {
		run.call(self);
	});
}


/**
 * Public API.
 */


Tester.prototype.cancel = function (description) {
	if (this.closed) {
		return;
	}

	debug('cancel() [description:"%s"]', description);

	if (this.currentNetworkTester) {
		this.currentNetworkTester.cancel(description);
	}

	this.closed = true;
	this.events.cancel(description);
};


/**
 * Private API.
 */


function run() {
	var self = this,
		testIndex = 0,
		testType;

	/**
	 * First check WebRTC support.
	 */

	if (doctortc.hasWebRTC()) {
		debug('WebRTC supported');
		this.events.webrtcsupport(true);
	} else {
		debugerror('no WebRTC support');
		this.events.webrtcsupport(false);

		// Cancel the test.
		this.closed = true;
		this.events.cancel();
		return;
	}

	/**
	 * Run every network test one after the other.
	 */

	setTimeout(function () {
		nextNetworkTest();
	}, INTER_TEST_DELAY);

	function nextNetworkTest() {
		if (self.closed) {
			return;
		}

		// No more network tests.
		if (testIndex === self.testTypes.length) {
			debug('no more network tests');

			// End the test.
			self.closed = true;
			self.events.complete();
			return;
		}

		testType = self.testTypes[testIndex];
		testIndex++;

		debug('starting %s test', testType);
		self.events.networkteststart(testType);

		// Set the onPacketReceived listener.
		self.settings.options.onPacketReceived = self.events.networktestprogress;

		self.currentNetworkTester = doctortc.test(
			// turnServer
			self.settings[testType],
			// callback
			function (statistics, packetsInfo, pendingOngoingData) {
				debug('%s test completed', testType);
				self.events.networktestcomplete(testType, statistics, packetsInfo, pendingOngoingData);

				// Next test.
				setTimeout(function () {
					nextNetworkTest();
				}, INTER_TEST_DELAY);
			},
			// errback
			function (error, description) {
				debug('%s test failed: %s', testType, error);
				self.events.networktesterror(testType, error, description);

				// Next test.
				setTimeout(function () {
					nextNetworkTest();
				}, INTER_TEST_DELAY);
			},
			// options
			self.settings.options
		);
	}
}
