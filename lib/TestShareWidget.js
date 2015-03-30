/**
 * Expose the TestShareWidget class.
 */
module.exports = TestShareWidget;


/**
 * Dependencies.
 */
var domify = require('domify'),
	$ = require('jquery'),
	html = require('./html/output.js').TestShareWidget;


function TestShareWidget(data) {
	var dom = $(domify(html)),
		link;

	data.container.append(dom);

	link = dom.find('.link');

	// Set the dom fields.
	dom.find('.text').text(data.text);
	link.text(data.link);
	link.attr('href', data.link);
}
