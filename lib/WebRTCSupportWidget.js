/**
 * Expose the WebRTCSupportWidget class.
 */
module.exports = WebRTCSupportWidget;


/**
 * Dependencies.
 */
var domify = require('domify'),
	$ = require('jquery'),
	html = require('./html/output.js').WebRTCSupportWidget;


function WebRTCSupportWidget(data) {
	// Whether this is a locally generated test or a remotely retrieved one.
	this.local = data.local;

	// Create the widget dom and append it to the container.
	this.dom = $(domify(html));
	data.container.append(this.dom);

	// Set the dom fields.
	this.dom.status = this.dom.find('.status');
	this.dom.status.description = this.dom.status.find('.description');
}


/**
 * Public API.
 */


WebRTCSupportWidget.prototype.supported = function (supported) {
	if (supported) {
		this.dom.status.description.text('WebRTC supported');
	} else {
		this.dom.status.description.addClass('error');
		this.dom.status.description.text('WebRTC unsupported');
	}

	if (this.local) {
		this.dom.status.description.slideDown(500);
	} else {
		this.dom.status.description.show();
	}
};
