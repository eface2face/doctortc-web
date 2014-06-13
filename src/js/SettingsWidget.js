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
		this.dom.packetSizeSlider = this.dom.find("#packetSizeSlider");
		this.dom.numberPacketsSlider = this.dom.find("#numberPacketsSlider");
		this.dom.sendIntervalSlider = this.dom.find("#sendIntervalSlider");
		this.dom.connectTimeoutSlider = this.dom.find("#connectTimeoutSlider");
		this.dom.testTimeoutSlider = this.dom.find("#testTimeoutSlider");
		this.dom.packetsBeforeTestSlider = this.dom.find("#packetsBeforeTestSlider");
		
		this.dom.settingsSlidersArray = [
			{id:"packetSize", default:2500, min:10, max:10000, tooltip:"The size (in bytes) of each packet to be sent during each test."},
			{id:"numberPackets", default:200, min:10, max:2000, tooltip:"Number of packets to be sent during each test."},
			{id:"sendInterval", default:20, min:5, max:1000, tooltip:"Interval of sending packets."},
			{id:"connectTimeout", default:6, min:2, max:30, tooltip:"Maximum time for establishing the connection with the TURN server and the DataChannel."},
			{id:"testTimeout", default:30, min:2, max:120, tooltip:"Maximum duration of each test (it fails if it takes longer)."},
			{id:"packetsBeforeTest", default:150, min:0, max:1000, tooltip:"Number of packets to be sent before each test in order to stabilize the packets flow across the DataChannel (first packets get a poor RTT so resulting statistics become inaccurate)."}
		];
		
		var _parentDom = this.parentDom;
		var _dom = this.dom;
		
		this.dom.dialog({	modal: true, 
							autoOpen: false, 
							width:"40%", 
							buttons: [ { text: "Run tests", click: function() { 
								var newOptions = {
									packetSize: $("#packetSizeAmount").val(),
									numPackets: $("#numberPacketsAmount").val(),
									numPreTestPackets: $("#sendIntervalAmount").val(),
									sendingInterval: $("#connectTimeoutAmount").val(),
									connectTimeout: $("#testTimeoutAmount").val(),
									testTimeout: $("#packetsBeforeTestAmount").val()
								};
								DoctoRTCWeb.networkTestsSettings.options = newOptions;
								$(_dom).dialog( "close" ); 
								DoctoRTCWeb.stop();
								DoctoRTCWeb.reset();
								DoctoRTCWeb.run();
						} } ] });
								
		var sliders = this.dom.settingsSlidersArray;
		for(var x = 0; x< sliders.length; x++){
			var slider = sliders[x];
			//console.log("slider", slider, slider.id);
			$( "#"+sliders[x].id+"Slider" ).slider({
			  range: false,
			  min: sliders[x].min,
			  max: sliders[x].max,
			  value: sliders[x].default,
			  slide: function( event, ui ) {
				  //console.log("slide", slider.id, ui.value, $( "#"+slider.id+"Amount" ));
				$(this)
				.closest("li")
				.find("input")
				.val( ui.value );
			  }
			})
			.parent()
			.find("i.helpNote")
			.prop("title", slider.tooltip);
			//.tooltip();
			
			$( "#"+slider.id+"Amount" )
			.val( $("#"+slider.id+"Slider" ).slider( "value" ))
			.off("change")
			.on("change", function(){
				$(this)
				.closest("li")
				.find(".ui-slider")
				.slider( "value", $(this).val() );
			});
		}

		// Add here this.dom.xxxxx attributes to hold jQuery elements for each UI field
		// (form fields, buttons, etc).
	};

	SettingsWidget.prototype.open = function() {
		// This method must make the Settings widget visible (and make the rest of the web
		// inactive).
		console.log("SettingsWidget.prototype.open", this.dom);
		this.dom.dialog( "open" );
	};
	

	SettingsWidget.prototype.close = function() {
		// This method must make the Settings widget invisible (and make the rest of the web
		// active).
		console.log("SettingsWidget.prototype.close");
		this.dom.dialog( "close" );
	};

	SettingsWidget.prototype.validate = function() {
		console.log("SettingsWidget.prototype.validate");
	};

	SettingsWidget.prototype.get = function() {
		// This method must return an Object with all the configuration settings, so the unique
		// instance of DoctoRTCWeb can apply it when running the tests.
		console.log("SettingsWidget.prototype.get");
	};

	DoctoRTCWeb.SettingsWidget = SettingsWidget;
}(DoctoRTCWeb));
