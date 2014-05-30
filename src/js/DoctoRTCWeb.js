
var DoctoRTCWeb = (function() {
	"use strict";

	var DoctoRTCWeb;

	DoctoRTCWeb = function() {
		this.dom = $('#doctortcweb');
		this.dom.hasWebRTC = this.dom.find('.hasWebRTC');
		this.dom.hasWebRTC.result = this.dom.hasWebRTC.find('.result');

		this.networkTests = ["udp2udp", "tcp2tcp"];  // TODO
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
				numPackets: 200
			}
		};

		DoctoRTC.setVerbose(true);  // TMP

		// Hide at start.
		this.dom.hasWebRTC.result.hide();
	};

	DoctoRTCWeb.prototype.setEvents = function() {

	};

	DoctoRTCWeb.prototype.run = function() {
		var self = this;
		var hasWebRTC = this.checkWebRTCSupport();

		if (! hasWebRTC) {
			return;
		}

		window.setTimeout(function() {
			self.testNetwork();
		}, 500);
	};

	DoctoRTCWeb.prototype.checkWebRTCSupport = function() {
		if (DoctoRTC.hasWebRTC()) {
			this.dom.hasWebRTC.result.text('your browser has WebRTC support');
			this.dom.hasWebRTC.result.slideDown();
			return true;
		}
		else {
			this.dom.hasWebRTC.result.text('your browser has not WebRTC support');
			this.dom.hasWebRTC.result.slideDown();
			return false;
		}
	};

	DoctoRTCWeb.prototype.testNetwork = function() {
		var self = this;
		var test = this.networkTests.shift();

		// Exit if all the tests are done.
		if (! test) {
			return;
		}

		var parentDom = null;
		var turn = null;
		var options = this.networkTestsSettings.options;
		var ondone = function() {
			self.testNetwork();
		};

		switch(test) {

			case 'udp2udp':
				parentDom = this.dom.find('.test.network.udp2udp');
				turn = this.networkTestsSettings.udpTurn;

				console.log("running UDP-UDP test...");
				new DoctoRTCWeb.NetworkTestWidget(parentDom, turn, options, ondone);
				break;

			case 'tcp2tcp':
				parentDom = this.dom.find('.test.network.tcp2tcp');
				turn = this.networkTestsSettings.tcpTurn;

				console.log("running TCP-TCP test...");
				new DoctoRTCWeb.NetworkTestWidget(parentDom, turn, options, ondone);
				break;
		}
	};

	return DoctoRTCWeb;
}());
