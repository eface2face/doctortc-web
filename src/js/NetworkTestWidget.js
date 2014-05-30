(function(DoctoRTCWeb) {
	var NetworkTestWidget;

	NetworkTestWidget = function(parentDom, turn, options, ondone) {
		parentDom.append(DoctoRTCWeb.Html['NetworkTestWidget']);

		this.dom = parentDom.find('.NetworkTestWidget');
		this.turn = turn;
		this.options = options;
		this.ondone = ondone;

		this.dom.status = this.dom.find('.status');
		this.dom.status.description = this.dom.status.find('.description');
		this.dom.status.progressbar = this.dom.status.find('.progressbar');

		// Hide stuff.
		this.dom.status.description.hide();
		this.dom.status.progressbar.hide();

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
				// self.onSuccess(packetsInfo, statistics);

				if (self.ondone) {
					self.ondone();
				}
			},
			// errback
			function(error) {
				self.setStatus('error');
				// self.onError(error);

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

	NetworkTestWidget.prototype.setStatus = function(status) {
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
				this.dom.status.description.text('test completed');

				// Hide progressbar.
				window.setTimeout(function() {
					self.dom.status.progressbar.animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
				}, 1000);

				break;

			case 'error':
				this.dom.status.description.text('test failed');

				// Hide progressbar.
				window.setTimeout(function() {
					self.dom.status.progressbar.animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
				}, 1000);

				break;
		}
	};

	NetworkTestWidget.prototype.onSucess = function() {

	};

	DoctoRTCWeb.NetworkTestWidget = NetworkTestWidget;
}(DoctoRTCWeb));
