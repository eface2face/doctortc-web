var fs = require('fs');


module.exports = {
	NetworkTestWidget:   fs.readFileSync('html/NetworkTestWidget.html', 'utf8'),
	WebRTCSupportWidget: fs.readFileSync('html/WebRTCSupportWidget.html', 'utf8')
};

