/**
 * Expose the NetworkTestWidget class.
 */
module.exports = NetworkTestWidget;


/**
 * Dependencies.
 */
var domify = require('domify'),
	$ = require('jquery'),
	html = require('./html/output.js').NetworkTestWidget;


function NetworkTestWidget(data) {
	var self = this;

	// Whether this is a locally generated test or a remotely retrieved one.
	this.local = data.local;

	// Create the widget dom and append it to the container.
	this.dom = $(domify(html));
	data.container.append(this.dom);

	// Set the dom fields.
	this.dom.title = this.dom.find('.title');
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
	this.dom.showChart = this.dom.find('.showChart');
	this.dom.showChart.button = this.dom.find('.showChart > a');
	this.dom.chart = this.dom.find('.chart');
	this.dom.chart.flot = this.dom.chart.find('.flot');

	// Set the title.
	this.dom.title.text('WebRTC ' + data.type.toUpperCase() + ' Connectivity Test');

	if (this.local) {
		// Initial status.
		this.dom.status.description.text('Running the test...');
	}

	// Click event to show the chart.
	this.dom.showChart.button.click(function () {
		self.dom.chart.slideDown();
		self.dom.showChart.slideUp();
		return false;
	});

	if (this.local) {
		// Initialize the status progressbar.
		this.dom.status.progressbar.progressbar({ value: false });
		this.dom.status.progressbar.slideDown(500);
	}
}


/**
 * Public API.
 */


NetworkTestWidget.prototype.progress = function (received, total) {
	var value = (received / total) * 100;

	this.dom.status.progressbar.progressbar('option', 'value', value);
};


NetworkTestWidget.prototype.draw = function (statistics, packetsInfo, pendingOngoingData) {
	var self = this,
		plotOptions,
		dataRTT,
		numPackets,
		RTTSerie,
		pendingOngoingSerie,
		fakeSerie,
		i;

	this.dom.status.description.text('Test completed:');

	if (this.local) {
		// Hide progressbar.
		setTimeout(function () {
			self.dom.status.progressbar.slideUp();
		}, 500);
	}

	/**
	 * Show statistics.
	 */

	this.dom.statistics.numPacketsValue.text(statistics.numPackets);
	this.dom.statistics.packetSizeValue.text(statistics.packetSize + ' bytes');
	this.dom.statistics.sendingIntervalValue.text(statistics.sendingInterval + ' ms');
	this.dom.statistics.testDurationValue.text((statistics.testDuration / 1000) + ' s');
	this.dom.statistics.outOfOrderValue.text(statistics.outOfOrder.toFixed(2) + ' %');
	this.dom.statistics.packetLossValue.text(statistics.packetLoss.toFixed(2) + ' %');
	this.dom.statistics.RTTValue.text(statistics.RTT.toFixed(2) + ' ms');
	this.dom.statistics.bandwidthValue.text(statistics.bandwidth.toFixed(2) + ' kbit/s');
	this.dom.statistics.testDurationOptimal.text((statistics.optimalTestDuration / 1000).toFixed(2) + ' s');
	this.dom.statistics.bandwidthOptimal.text(statistics.optimalBandwidth.toFixed(2) + ' kbit/s');

	if (this.local) {
		this.dom.statistics.slideDown(500);
	} else {
		this.dom.statistics.show();
	}

	/**
	 * Show RTT chart.
	 */

	plotOptions = {
		series: {},
		grid: {
			borderWidth: 1,
			markings: [
				{
					x1axis: { from: 0, to: statistics.ignoredInterval },
					color: '#DDD'
				}
			]
		},
		xaxes: [
			// X axis 1 (shared)
			{
				min: 0,
				show: true,
				tickFormatter: function (v) {
					return (v / 1000) + ' s';
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
				position: 'right',
				font: {
						color: '#0180d9'
				},
				tickFormatter: function (v) {
					return (v / 1000).toFixed(0) + ' kbytes';
				}
			},
			// Y axis 3 (RTT)
			{
				min: 0,
				show: true,
				position: 'left',
				font: {
					color: '#f14b3e'
				},
				tickFormatter: function (v) {
					return v + ' ms';
				}
			}
		],
		legend: {
			show: true,
			backgroundOpacity: 0.9
		}
	};

	dataRTT = [];
	// Total number of packets (not just the not ignored).
	numPackets = packetsInfo.length;
	for (i = 0; i < numPackets; i++) {
		dataRTT[i] = [packetsInfo[i].sentTime, packetsInfo[i].elapsedTime];
	}

	RTTSerie = {
		data: dataRTT,
		xaxis: 1,
		yaxis: 3,
		label: 'RTT per packet',
		color: '#f14b3e',
		points: {
			show: true,
			radius: 1
		}
	};

	pendingOngoingSerie = {
		data: pendingOngoingData,
		xaxis: 1,
		yaxis: 2,
		label: 'Pending ongoing data',
		color: '#69bbe8',
		lines: {
			show: true,
			steps: false,
			lineWidth: 0,
			fill: true,
			fillColor: {
				colors: [
					{
						opacity: 0.7
					},
					{
						opacity: 0.2
					}
				]
			}
		}
	};

	// Fake data serie just for showing a label for the 'unused' X interval.
	fakeSerie = {
		data: [],
		xaxis: 1,
		yaxis: 1,
		label: 'Ignored data',
		color: '#aaa'
	};

	// Must show the flot (and then hide) so Flot can calculate its real width/height.
	this.dom.chart.show();
	this.dom.chart.flot.plot([fakeSerie, pendingOngoingSerie, RTTSerie], plotOptions);
	this.dom.chart.hide();

	// Show 'chart' button.
	if (this.local) {
		this.dom.showChart.slideDown();
	} else {
		this.dom.showChart.show();
	}
};


NetworkTestWidget.prototype.fail = function (error, description) {
	var self = this;

	this.dom.status.description.addClass('error');
	this.dom.status.description.text('Test failed: ' + error + (description ? ' (' + description + ')' : ''));

	if (this.local) {
		// Hide progressbar.
		setTimeout(function () {
			self.dom.status.progressbar.slideUp();
		}, 500);
	}
};
