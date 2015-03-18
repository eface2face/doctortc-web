#!/usr/bin/env bash

set -e


DESTINATION="v2:/var/www/doctortc.aliax.net/"


rsync -gpPOrtvz --no-perms --delete-excluded --delete \
	-f"+ /index.html" \
	-f"+ /js/" \
	-f"+ /js/*" \
	-f"+ /css/" \
	-f"+ /css/*" \
	-f"+ /css/*/*" \
	-f"+ /src/" \
	-f"+ /src/css/" \
	-f"+ /src/css/doctortcweb.css" \
	-f"+ /dist/" \
	-f"+ /dist/doctortcweb-devel.js" \
	-f"- *" \
	. $DESTINATION
