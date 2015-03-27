/**
 * Expose the TestInfoWidget class.
 */
module.exports = TestInfoWidget;


/**
 * Dependencies.
 */
var domify = require('domify'),
	$ = require('jquery'),
	html = require('./html/output.js').TestInfoWidget;


function TestInfoWidget(data) {
	var dom = $(domify(html)),
		link;

	data.container.append(dom);

	link = dom.find('.link');

	// Set the dom fields.
	dom.find('.text').text(data.text);
	link.text(data.link);
	link.attr('href', data.link);
}
