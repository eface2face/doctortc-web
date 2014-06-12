(function(DoctoRTCWeb) {
	var Html;

	Html = {
		'NetworkTestWidget': <%= meta.getHtmlFor('NetworkTestWidget') %>,
		'SettingsWidget': <%= meta.getHtmlFor('SettingsWidget') %>
	};

	DoctoRTCWeb.Html = Html;
}(DoctoRTCWeb));
