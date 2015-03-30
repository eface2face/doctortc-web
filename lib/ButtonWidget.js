/**
 * Expose the ButtonWidget class.
 */
module.exports = ButtonWidget;


/**
 * Dependencies.
 */
var domify = require('domify'),
	$ = require('jquery'),
	html = require('./html/output.js').ButtonWidget;


function ButtonWidget(data) {
	var dom;

	// Create the widget dom and append it to the container.
	dom = $(domify(html));
	data.container.append(dom);

	// Set the dom fields.
	dom.find('.text').text(data.text);
	dom.find('.text').attr('href', data.link);
}
