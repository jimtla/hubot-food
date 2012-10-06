#!/bin/bash

if [ ${HUBOT_ENV-hubot} == 'jim' ]; then
    export HUBOT_HIPCHAT_JID="27746_172795@chat.hipchat.com"
    export HUBOT_HIPCHAT_NAME="Jimbot Botson"
    export HUBOT_HIPCHAT_PASSWORD="hubothubot"
    export HUBOT_HIPCHAT_TOKEN="90bfca7c22fd171bb8ba2b5e2d7ebd"
elif [ ${HUBOT_ENV-hubot} == 'ryan' ]; then
    export HUBOT_HIPCHAT_JID="27746_172794@chat.hipchat.com"
    export HUBOT_HIPCHAT_NAME="Hubot Botson"
    export HUBOT_HIPCHAT_PASSWORD="hubothubot"
    export HUBOT_HIPCHAT_TOKEN="90bfca7c22fd171bb8ba2b5e2d7ebd"
else
    export HUBOT_HIPCHAT_JID="27746_172794@chat.hipchat.com"
    export HUBOT_HIPCHAT_NAME="Hubot Botson"
    export HUBOT_HIPCHAT_PASSWORD="hubothubot"
    export HUBOT_HIPCHAT_TOKEN="90bfca7c22fd171bb8ba2b5e2d7ebd"
fi

./bin/hubot -a hipchat -n Hubot