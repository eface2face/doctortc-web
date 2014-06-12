(function(DoctoRTCWeb) {
	var SettingsWidget;

	SettingsWidget = function(parentDom) {
		// this.parentDom is the parent DOM (this is useful to make it inactive while the
		// Settings widget is shown).
		this.parentDom = parentDom;

		// Add the Settings widget DOM into the parent DOM.
		this.parentDom.append(DoctoRTCWeb.Html.SettingsWidget);

		// this.dom is the jQuery object holding the Settings widget DOM.
		this.dom = parentDom.find('.SettingsWidget');

		// Add here this.dom.xxxxx attributes to hold jQuery elements for each UI field
		// (form fields, buttons, etc).
	};

	SettingsWidget.prototype.open = function() {
		// This method must make the Settings widget visible (and make the rest of the web
		// inactive).
	};

	SettingsWidget.prototype.close = function() {
		// This method must make the Settings widget invisible (and make the rest of the web
		// active).
	};

	SettingsWidget.prototype.validate = function() {

	};

	SettingsWidget.prototype.get = function() {
		// This method must return an Object with all the configuration settings, so the unique
		// instance of DoctoRTCWeb can apply it when running the tests.
	};

	DoctoRTCWeb.SettingsWidget = SettingsWidget;
}(DoctoRTCWeb));
