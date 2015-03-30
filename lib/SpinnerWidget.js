/**
 * Expose the SpinnerWidget class.
 */
module.exports = SpinnerWidget;


/**
 * Dependencies.
 */
var domify = require('domify'),
	$ = require('jquery'),
	Spinner = require('../vendor/spin'),
	html = require('./html/output.js').SpinnerWidget;


function SpinnerWidget(data) {
	var spinOptions,
		target;

	// Create the widget dom and append it to the container.
	this.dom = $(domify(html));
	data.container.append(this.dom);

	// Set the dom fields.
	this.dom.find('.text').text(data.text);

	// Add the spinner.
	spinOptions = {
		lines: 13, // The number of lines to draw
		length: 18, // The length of each line
		width: 9, // The line thickness
		radius: 30, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 55, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: true, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	};

	target = this.dom.find('.spinner')[0];
	this.spinner = new Spinner(spinOptions).spin(target);
}


/**
 * Public API.
 */


SpinnerWidget.prototype.remove = function (slow) {
	var self = this;

	if (!slow) {
		this.spinner.stop();
		this.dom.remove();
	} else {
		this.dom.slideUp(500, function () {
			self.spinner.stop();
			self.dom.remove();
		});
	}
};
