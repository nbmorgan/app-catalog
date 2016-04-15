#!/bin/bash -el

if [ -d "/home/jenkins/.nvm" ]; then
    source  ~/.nvm/nvm.sh
fi

npm dist-tag ls rally-appsdk > appsdk.tags
