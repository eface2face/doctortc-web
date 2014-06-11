
var DoctoRTCWeb = (function() {
	"use strict";

	var DoctoRTCWeb;
	var C = {
		INTER_TESTS_DELAY: 1000
	};

	DoctoRTCWeb = function() {
		this.dom = $('#doctortcweb');
		this.dom.hasWebRTC = this.dom.find('.hasWebRTC');
		this.dom.hasWebRTC.result = this.dom.hasWebRTC.find('.result');
		this.dom.networkTestUdp2Udp = this.dom.find('.test.network.udp2udp');
		this.dom.networkTestTcp2Tcp = this.dom.find('.test.network.tcp2tcp');

		this.networkTests = ["udp2udp", "tcp2tcp"];

		this.networkTestsSettings = {
			udpTurn: {
				url: 'turn:turn.ef2f.com:3478?transport=udp',
				username: 'turn',
				credential: 'ef2f'
			},
			tcpTurn: {
				url: 'turn:turn.ef2f.com:3478?transport=tcp',
				username: 'turn',
				credential: 'ef2f'
			},
			options: {
				packetSize: 1250,
				numPackets: 800,
				ignoredInterval: 2500,
				sendingInterval: 10,
				connectTimeout: 5000,
				testTimeout: 40000
			}
		};

		// DoctoRTC.setVerbose(true);  // TMP

		// Hide at start.
		this.dom.hasWebRTC.result.hide();
		this.dom.networkTestUdp2Udp.hide();
		this.dom.networkTestTcp2Tcp.hide();
	};

	DoctoRTCWeb.prototype.run = function() {
		var self = this;
		var hasWebRTC = this.checkWebRTCSupport();

		if (! hasWebRTC) {
			return;
		}

		this.onTestsStart();

		window.setTimeout(function() {
			self.testNetwork();
		}, C.INTER_TESTS_DELAY);
	};

	DoctoRTCWeb.prototype.checkWebRTCSupport = function() {
		if (DoctoRTC.hasWebRTC()) {
			this.dom.hasWebRTC.result.text('your browser has WebRTC support');
			this.dom.hasWebRTC.result.slideDown();
			return true;
		}
		else {
			this.dom.hasWebRTC.result.text('your browser does not support WebRTC');
			this.dom.hasWebRTC.result.slideDown();
			return false;
		}
	};

	DoctoRTCWeb.prototype.testNetwork = function() {
		var self = this;
		var test = this.networkTests.shift();

		// Exit if all the tests are done.
		if (! test) {
			this.onTestsEnd();
			return;
		}

		var parentDom = null;
		var turn = null;
		var options = this.networkTestsSettings.options;
		var ondone = function() {
			// Scroll down.
			$('html, body').animate({ scrollTop: $(document).height() }, 'slow');
			// Next test.
			window.setTimeout(function() {
				self.testNetwork();
			}, C.INTER_TESTS_DELAY);
		};

		switch(test) {
			case 'udp2udp':
				parentDom = this.dom.networkTestUdp2Udp;
				turn = this.networkTestsSettings.udpTurn;

				parentDom.slideDown();

				new DoctoRTCWeb.NetworkTestWidget(parentDom, turn, options, ondone);
				break;

			case 'tcp2tcp':
				parentDom = this.dom.networkTestTcp2Tcp;
				turn = this.networkTestsSettings.tcpTurn;

				parentDom.slideDown();

				new DoctoRTCWeb.NetworkTestWidget(parentDom, turn, options, ondone);
				break;
		}
	};

	DoctoRTCWeb.prototype.onTestsStart = function() {
		// Avoid tab looses focus.
		window.onblur = function() {
			// Remove it now to avid loop.
			window.onblur = null;

			alert("TEST INVALIDATED\n\nPlease, keep the focus on this tab during the test. Otherwise the results are not reliable.");
			window.location.reload();
		};
	};

	DoctoRTCWeb.prototype.onTestsEnd = function() {
		window.onblur = null;
	};

	return DoctoRTCWeb;
}());
