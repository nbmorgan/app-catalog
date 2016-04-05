#!/bin/bash -e

rm -rf bin/sencha lib

function cp_with_exclude() {
  echo "Copying ${1##*/} into $2..."
  rsync -a --exclude=node_modules $1/ $2/
}

mkdir -p lib/ext bin/
cp_with_exclude node_modules/rally-ext-lean lib/ext/4.2.2
rm -f lib/ext/4.2.2/package.json

cp_with_exclude node_modules/rally-sencha-cmd bin/sencha
cp_with_exclude node_modules/rally-webdriver lib/webdriver
cp_with_exclude node_modules/rally-appsdk/rui lib/sdk
