#!/bin/bash -e

function cp_with_exclude() {
  echo "Copying ${1##*/} into $2..."
  mkdir -p $2
  rsync -a --delete --exclude=node_modules $1/ $2/
}

cp_with_exclude node_modules/rally-ext-lean lib/ext/4.2.2
cp_with_exclude node_modules/rally-sencha-cmd bin/sencha
cp_with_exclude node_modules/rally-webdriver lib/webdriver
cp_with_exclude node_modules/rally-appsdk/rui lib/sdk

rm -f lib/ext/4.2.2/package.json

