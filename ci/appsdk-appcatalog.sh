#!/bin/bash -el

if [ -d "/home/jenkins/.nvm" ]; then
    source  ~/.nvm/nvm.sh
fi

browser=$1
npm install
grunt clean

if [ ! -z "$APPSDK_SRC_VERSION" ]; then
    npm install rally-appsdk@${APPSDK_SRC_VERSION}
    grunt shell:link-npm-modules
fi

grunt test:${browser}:faster --maxSpecRunners=4
