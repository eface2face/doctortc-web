var fs = require('fs');


module.exports = {
	NetworkTestWidget:   fs.readFileSync('html/NetworkTestWidget.html', 'utf8'),
	WebRTCSupportWidget: fs.readFileSync('html/WebRTCSupportWidget.html', 'utf8'),
	SpinnerWidget:       fs.readFileSync('html/SpinnerWidget.html', 'utf8'),
	ErrorWidget:         fs.readFileSync('html/ErrorWidget.html', 'utf8'),
	TestInfoWidget:      fs.readFileSync('html/TestInfoWidget.html', 'utf8'),
	ButtonWidget:        fs.readFileSync('html/ButtonWidget.html', 'utf8')
};
