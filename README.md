# DoctoRTCWeb

A web application powered by [eFace2Face](http://www.eface2face.com) that checks WebRTC support and network connectivity from your browser.

This application uses internally the [doctortc.js](https://bitbucket.org/ibc_aliax/doctortc.js) library.


## Dependencies

*  **nodejs** (provides `npm` command).
*  **grunt-cli** (provides `grunt` command):
```
$ npm install -g grunt-cli
```
*  **ruby** >= 1.9.
*  **compass** >= 1.0.0.alpha.19 Ruby gem:
```
$ gem install compass --pre
```

## Build

* Get the source code and enter the root directory.
```
$ cd doctortcweb/
```

* Install Node dependencies:
```
$ npm install
```

* Build `dist/doctortcweb-devel.js` library:
```
grunt devel
```

* Build `dist/doctortcweb-X.Y.Z.js` and `dist/doctortcweb-X.Y.Z.min.js` libraries:
```
grunt dist
```

## Run the web

Open the `index.html` in the browser.


## Author

Iñaki Baz Castillo at eFace2Face, inc. (inaki.baz@eface2face.com)


## License

Copyright © 2014 eFace2Face, inc. ([www.eface2face.com](http://www.eface2face.com)), All Rights Reserved.
