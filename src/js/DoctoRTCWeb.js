
var DoctoRTCWeb = (function() {
	"use strict";

	var DoctoRTCWeb;
	var C = {
		INTER_TESTS_DELAY: 1000
	};

	DoctoRTCWeb = function() {
		this.running = false;

		this.dom = $('#doctortcweb');
		this.dom.hasWebRTC = this.dom.find('.hasWebRTC');
		this.dom.hasWebRTC.result = this.dom.hasWebRTC.find('.result');
		this.dom.networkTestUdp2Udp = this.dom.find('.test.network.udp2udp');
		this.dom.networkTestTcp2Tcp = this.dom.find('.test.network.tcp2tcp');
		this.dom.networkTestTls2Tls = this.dom.find('.test.network.tls2tls');
		this.dom.networkTestUdp2Udp.result = this.dom.networkTestUdp2Udp.find('.result');
		this.dom.networkTestTcp2Tcp.result = this.dom.networkTestTcp2Tcp.find('.result');
		this.dom.networkTestTls2Tls.result = this.dom.networkTestTls2Tls.find('.result');

		//add the link element
		// this.dom.settingsButton = this.dom.find('.settingsButton');

		// Add the Settings widget.
		this.settingsWidget = new DoctoRTCWeb.SettingsWidget(this.dom);

		// var _settingsWidget = this.settingsWidget;

		//open settings functionality on click of settings button
		// this.dom.settingsButton
		// .on("click", function(){
		// 	console.log("Settings clicked");
		// 	_settingsWidget.open();
		// 	return false;
		// });

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
			tlsTurn: {
				url: 'turns:turn.ef2f.com:443?transport=tcp',
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

		DoctoRTC.setVerbose(true);  // TMP

		this.reset();
	};

	DoctoRTCWeb.prototype.run = function() {
		if (this.running) {
			throw("already running");
		}
		this.running = true;

		this.reset();

		var self = this;
		var hasWebRTC = this.checkWebRTCSupport();

		if (! hasWebRTC) {
			this.running = false;
			return;
		}

		this.onTestsStart();

		window.setTimeout(function() {
			self.testNetwork();
		}, C.INTER_TESTS_DELAY);
	};

	DoctoRTCWeb.prototype.stop = function() {
		if (! this.running) {
			return;
		}

		this.running = false;
		if (this.currentNetworkTestWidget) {
			this.currentNetworkTestWidget.cancel();
		}
	};

	DoctoRTCWeb.prototype.reset = function() {
		this.networkTests = ["udp2udp", "tcp2tcp", "tls2tls"];

		// Hold the current network test (so it can be cancelled).
		this.currentNetworkTestWidget = null;

		// Hide at start.
		this.dom.hasWebRTC.result.hide();
		this.dom.networkTestUdp2Udp.hide();
		this.dom.networkTestTcp2Tcp.hide();
		this.dom.networkTestTls2Tls.hide();
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

		// Exit if cancelled.
		if (! this.running) {
			this.onTestsEnd();
			return;
		}

		// Exit if all the tests are done.
		if (! test) {
			this.running = false;
			this.onTestsEnd();
			return;
		}

		var resultDom = null;
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
				this.dom.networkTestUdp2Udp.slideDown();
				resultDom = this.dom.networkTestUdp2Udp.result;
				turn = this.networkTestsSettings.udpTurn;

				resultDom.slideDown();

				this.currentNetworkTestWidget = new DoctoRTCWeb.NetworkTestWidget(resultDom, turn, options, ondone);
				break;

			case 'tcp2tcp':
				this.dom.networkTestTcp2Tcp.slideDown();
				resultDom = this.dom.networkTestTcp2Tcp.result;
				turn = this.networkTestsSettings.tcpTurn;

				resultDom.slideDown();

				this.currentNetworkTestWidget = new DoctoRTCWeb.NetworkTestWidget(resultDom, turn, options, ondone);
				break;

			case 'tls2tls':
				this.dom.networkTestTls2Tls.slideDown();
				resultDom = this.dom.networkTestTls2Tls.result;
				turn = this.networkTestsSettings.tlsTurn;

				resultDom.slideDown();

				this.currentNetworkTestWidget = new DoctoRTCWeb.NetworkTestWidget(resultDom, turn, options, ondone);
				break;
		}
	};

	DoctoRTCWeb.prototype.onTestsStart = function() {
		// Avoid tab looses focus.
		// window.onblur = function() {
		// 	// Remove it now to avid loop.
		// 	window.onblur = null;

		// 	alert("TEST INVALIDATED\n\nPlease, keep the focus on this tab during the test. Otherwise the results are not reliable.");
		// 	window.location.reload();
		// };
	};

	DoctoRTCWeb.prototype.onTestsEnd = function() {
		this.currentNetworkTestWidget = null;
		window.onblur = null;
	};

	return DoctoRTCWeb;
}());
