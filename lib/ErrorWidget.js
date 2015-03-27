/**
 * Expose the ErrorWidget class.
 */
module.exports = ErrorWidget;


/**
 * Dependencies.
 */
var domify = require('domify'),
	$ = require('jquery'),
	html = require('./html/output.js').ErrorWidget;


function ErrorWidget(data) {
	// Create the widget dom and append it to the container.
	this.dom = $(domify(html));
	data.container.append(this.dom);

	// Set the dom fields.
	this.dom.find('.text').text(data.text);

	this.dom.fadeIn(500);
}


/**
 * Public API.
 */


ErrorWidget.prototype.remove = function (slow) {
	var self = this;

	if (!slow) {
		this.dom.remove();
	} else {
		this.dom.slideUp(500, function () {
			self.dom.remove();
		});
	}
};
