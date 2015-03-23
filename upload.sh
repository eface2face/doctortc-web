#!/usr/bin/env bash

set -e


DESTINATION="v2:/var/www/doctortc.aliax.net/"


cd web/

rsync -gpPOrtvz --no-perms --delete-excluded --delete . $DESTINATION
