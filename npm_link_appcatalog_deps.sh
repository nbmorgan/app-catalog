#!/bin/bash -e

rm -rf lib bin/sencha
mkdir -p lib/ext bin

ln -fns ../node_modules/rally-appsdk  lib/sdk
ln -fns ../../node_modules/rally-ext-lean lib/ext/4.2.2
rm -f lib/ext/4.2.2/package.json
ln -fns ../node_modules/rally-sencha-cmd bin/sencha
ln -fns ../node_modules/rally-webdriver lib/webdriver
