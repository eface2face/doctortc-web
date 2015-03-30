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
	var dom = $(domify(html));

	data.container.append(dom);

	// Set the dom fields.
	dom.find('.testId').text(data.testId);
	dom.find('.companyId').text(data.companyId);
	dom.find('.browser').text(data.browser);
	dom.find('.IP').text(data.IP);
	dom.find('.date').text(data.date);
}
