#!/bin/bash

display_usage() {
    echo "Possible commands: configure, start, stop"
    echo -e "\nUsage:\n$0 [arguments] \n"
}

 # if less than 1 arguments supplied, display usage
if [  $# -le 0 ]
then
    display_usage
    exit 1
fi

if [ $1 == "configure" ]
then
    path=$(pwd)
    cat environment/configurations/local/nginx/nginx.conf.tpl | sed -e 's|<DEVELOPMENT_DIST>|'$path'|' > environment/configurations/local/nginx/nginx.conf
fi

if [ $1 == "start" ]
then
    config=$(pwd)"/environment/configurations/local/nginx/nginx.conf"
    nginx -c $config
fi

if [ $1 == "stop" ]
then
    nginx -s stop
fi




