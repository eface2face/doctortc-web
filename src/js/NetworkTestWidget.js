(function(DoctoRTCWeb) {
	var NetworkTestWidget;

	NetworkTestWidget = function(parentDom, turn, options, ondone) {
		parentDom.append(DoctoRTCWeb.Html.NetworkTestWidget);

		this.dom = parentDom.find('.NetworkTestWidget');
		this.turn = turn;
		this.options = options;
		this.ondone = ondone;

		this.dom.status = this.dom.find('.status');
		this.dom.status.description = this.dom.status.find('.description');
		this.dom.status.progressbar = this.dom.status.find('.progressbar');
		this.dom.statistics = this.dom.find('.statistics');

		this.dom.statistics.packetsSentValue = this.dom.statistics.find('.packetsSent .value');
		this.dom.statistics.packetSizeValue = this.dom.statistics.find('.packetSize .value');
		this.dom.statistics.sendingIntervalValue = this.dom.statistics.find('.sendingInterval .value');
		this.dom.statistics.testDurationValue = this.dom.statistics.find('.testDuration .value');
		this.dom.statistics.outOfOrderValue = this.dom.statistics.find('.outOfOrder .value');
		this.dom.statistics.packetLossValue = this.dom.statistics.find('.packetLoss .value');
		this.dom.statistics.RTTValue = this.dom.statistics.find('.RTT .value');
		this.dom.statistics.bandwidthValue = this.dom.statistics.find('.bandwidth .value');

		this.dom.statistics.testDurationOptimal = this.dom.statistics.find('.testDuration .optimal');
		this.dom.statistics.bandwidthOptimal = this.dom.statistics.find('.bandwidth .optimal');

		// Hide stuff.
		this.dom.status.description.hide();
		this.dom.status.progressbar.hide();
		this.dom.statistics.hide();

		this.run();
	};

	NetworkTestWidget.prototype.run = function() {
		var self = this;

		this.setStatus('start');

		// Update the progressbar with each received packet.
		this.options.onPacketReceived = function(received, total) {
			var value = (received / total) * 100;
			self.dom.status.progressbar.progressbar('option', 'value', value);
		};

		DoctoRTC.testNetwork(
			// turnServer
			this.turn,
			// callback
			function(packetsInfo, statistics) {
				self.setStatus('success');
				self.onSuccess(packetsInfo, statistics);

				if (self.ondone) {
					self.ondone();
				}
			},
			// errback
			function(error) {
				self.setStatus('error', error);

				if (self.ondone) {
					self.ondone();
				}
			},
			// options
			this.options
		);

		// Remove the 'onPacketReceived' field of 'option'.
		delete this.options.onPacketReceived;
	};

	NetworkTestWidget.prototype.setStatus = function(status, error) {
		var self = this;

		switch(status) {

			case 'start':
				this.dom.status.description.text('running the test...');

				// Initialize the progressbar.
				this.dom.status.description.slideDown();
				this.dom.status.progressbar.progressbar({
					value: false
				});
				this.dom.status.progressbar.slideDown();

				break;

			case 'success':
				this.dom.status.description.text('test completed:');

				// Hide progressbar.
				window.setTimeout(function() {
					self.dom.status.progressbar.animate({ height: 'toggle', opacity: 'toggle' }, 'normal');
				}, 100);

				break;

			case 'error':
				this.dom.status.description.text('test failed: ' + error);

				// Hide progressbar.
				window.setTimeout(function() {
					self.dom.status.progressbar.animate({ height: 'toggle', opacity: 'toggle' }, 'normal');
				}, 100);

				break;
		}
	};

	NetworkTestWidget.prototype.onSuccess = function(packetsInfo, statistics) {
		this.dom.statistics.slideDown('fast');

		this.dom.statistics.packetsSentValue.text(statistics.packetsSent);
		this.dom.statistics.packetSizeValue.text(statistics.packetSize + ' bytes');
		this.dom.statistics.sendingIntervalValue.text(statistics.sendingInterval + ' ms');
		this.dom.statistics.testDurationValue.text((statistics.testDuration / 1000) + ' s');
		this.dom.statistics.outOfOrderValue.text(statistics.outOfOrder + ' %');
		this.dom.statistics.packetLossValue.text(statistics.packetLoss + ' %');
		this.dom.statistics.RTTValue.text(statistics.RTT + ' ms');
		this.dom.statistics.bandwidthValue.text(statistics.bandwidth + ' kbit/s');

		this.dom.statistics.testDurationOptimal.text(statistics.optimalTestDuration + ' s');
		this.dom.statistics.bandwidthOptimal.text(statistics.optimalBandwidth + ' kbit/s');
	};

	DoctoRTCWeb.NetworkTestWidget = NetworkTestWidget;
}(DoctoRTCWeb));
