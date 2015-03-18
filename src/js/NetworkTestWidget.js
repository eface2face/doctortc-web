(function(DoctoRTCWeb) {
	var NetworkTestWidget;

	NetworkTestWidget = function(resultDom, turn, options, ondone) {
		resultDom.empty();
		resultDom.append(DoctoRTCWeb.Html.NetworkTestWidget);

		this.dom = resultDom.find('.NetworkTestWidget');
		this.turn = turn;
		this.options = options;
		this.ondone = ondone;

		this.dom.status = this.dom.find('.status');
		this.dom.status.description = this.dom.status.find('.description');
		this.dom.status.progressbar = this.dom.status.find('.progressbar');
		this.dom.statistics = this.dom.find('.statistics');

		this.dom.statistics.numPacketsValue = this.dom.statistics.find('.numPackets .value');
		this.dom.statistics.packetSizeValue = this.dom.statistics.find('.packetSize .value');
		this.dom.statistics.sendingIntervalValue = this.dom.statistics.find('.sendingInterval .value');
		this.dom.statistics.testDurationValue = this.dom.statistics.find('.testDuration .value');
		this.dom.statistics.outOfOrderValue = this.dom.statistics.find('.outOfOrder .value');
		this.dom.statistics.packetLossValue = this.dom.statistics.find('.packetLoss .value');
		this.dom.statistics.RTTValue = this.dom.statistics.find('.RTT .value');
		this.dom.statistics.bandwidthValue = this.dom.statistics.find('.bandwidth .value');

		this.dom.statistics.testDurationOptimal = this.dom.statistics.find('.testDuration .optimal');
		this.dom.statistics.bandwidthOptimal = this.dom.statistics.find('.bandwidth .optimal');

		this.dom.showChartButton = this.dom.find('.showChart');
		this.dom.chart = this.dom.find('.chart');
		this.dom.chart.flot = this.dom.chart.find('.flot');

		// Hide stuff.
		this.dom.status.description.hide();
		this.dom.status.progressbar.hide();
		this.dom.statistics.hide();
		this.dom.showChartButton.hide();
		this.dom.chart.hide();

		// Set events.
		var self = this;
		this.dom.showChartButton.click(function() {
			self.dom.chart.slideDown();
			$(this).slideUp();
			return false;
		});

		this.test = null;
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

		this.test = DoctoRTC.testNetwork(
			// turnServer
			this.turn,
			// callback
			function(statistics, packetsInfo, pendingOngoingData) {
				self.setStatus('success');
				self.onSuccess(statistics, packetsInfo, pendingOngoingData);

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

	NetworkTestWidget.prototype.cancel = function() {
		this.test.cancel();
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
				this.dom.status.progressbar.slideDown('slow');

				break;

			case 'success':
				this.dom.status.description.text('test completed:');

				// Hide progressbar.
				window.setTimeout(function() {
					self.dom.status.progressbar.slideUp();
				}, 500);

				break;

			case 'error':
				this.dom.status.description.text('test failed: ' + error);

				// Hide progressbar.
				window.setTimeout(function() {
					self.dom.status.progressbar.slideUp();
				}, 500);

				break;
		}
	};

	NetworkTestWidget.prototype.onSuccess = function(statistics, packetsInfo, pendingOngoingData) {
		// Show statistics.

		this.dom.statistics.numPacketsValue.text(statistics.numPackets);
		this.dom.statistics.packetSizeValue.text(statistics.packetSize + ' bytes');
		this.dom.statistics.sendingIntervalValue.text(statistics.sendingInterval + ' ms');
		this.dom.statistics.testDurationValue.text((statistics.testDuration / 1000) + ' s');
		this.dom.statistics.outOfOrderValue.text(statistics.outOfOrder + ' %');
		this.dom.statistics.packetLossValue.text(statistics.packetLoss + ' %');
		this.dom.statistics.RTTValue.text(statistics.RTT + ' ms');
		this.dom.statistics.bandwidthValue.text(statistics.bandwidth + ' kbit/s');

		this.dom.statistics.testDurationOptimal.text(statistics.optimalTestDuration + ' s');
		this.dom.statistics.bandwidthOptimal.text(statistics.optimalBandwidth + ' kbit/s');

		this.dom.statistics.slideDown('normal');


		// Show RTT chart.

		var plotOptions = {
			series: {
			},
			grid: {
				borderWidth: 1,
				markings: [
					{
						x1axis: { from: 0, to: statistics.ignoredInterval },
						color: "#DDD"
					}
				]
			},
			xaxes: [
				// X axis 1 (shared)
				{
					min: 0,
					show: true,
					tickFormatter: function(v, axis) {
						return (v / 1000) + " s";
					}
				}
			],
			yaxes: [
				// Y axis 1 (fake data)
				{
					show: false
				},
				// Y axis 2 (pending ongoing data)
				{
					min: 0,
					show: true,
					position: "right",
					font: {
 						color: "#0180d9"
					},
					tickFormatter: function(v, axis) {
						return (v / 1000).toFixed(0) + " kbytes";
					}
				},
				// Y axis 3 (RTT)
				{
					min: 0,
					show: true,
					position: "left",
					font: {
						color: "#ea4e39"
					},
					tickFormatter: function(v, axis) {
						return v + " ms";
					}
				},
			],
			legend: {
				show: true,
				backgroundOpacity: 0.9
			}
		};

		var dataRTT = [];
		// Total number of packets (not just the not ignored).
		var numPackets = packetsInfo.length;
		for(var i=0; i < numPackets; i++) {
			dataRTT[i] = [packetsInfo[i].sentTime, packetsInfo[i].elapsedTime];
		}

		var RTTSerie = {
			data: dataRTT,
			xaxis: 1,
			yaxis: 3,
			label: "RTT per packet",
			color: "#ea4e39",
			points: {
				show: true,
				radius: 1
			}
		};

		var pendingOngoingSerie = {
			data: pendingOngoingData,
			xaxis: 1,
			yaxis: 2,
			label: "Pending ongoing data",
			color: "#69bbe8",
			lines: {
				show: true,
				steps: false,
				lineWidth: 0,
				fill: true,
				fillColor: { colors: [ { opacity: 0.7 }, { opacity: 0.2 } ] }
			}
		};

		// Fake data serie just for showing a label for the "unused" X interval.
		var fakeSerie = {
			data: [],
			xaxis: 1,
			yaxis: 1,
			label: "Ignored data",
			color: "#AAA",
		};

		// Must show the flot (and then hide) so Flot can calculate its real width/height.
		this.dom.chart.show();
		this.dom.chart.flot.plot([fakeSerie, pendingOngoingSerie, RTTSerie], plotOptions);
		this.dom.chart.hide();


		// Show "chart" button.
		this.dom.showChartButton.slideDown();
	};

	DoctoRTCWeb.NetworkTestWidget = NetworkTestWidget;
}(DoctoRTCWeb));
