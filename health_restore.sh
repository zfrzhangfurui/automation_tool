#!/bin/bash

interval=86400;
last_timestamp=$(date +%s);

while :
do
    current_timestamp=$(date +%s);
    a=`expr $current_timestamp - $last_timestamp`;
    if ((a > interval)); then
        echo "restore health of rates import application";

        image=$(docker images | awk '/wcb_rates_import_automation/ {print $3}');

        container=$(docker ps -a | awk -v pattern="$image" '$0 ~ pattern {print $1}');
        
        if ! docker stop $container &> /dev/null; then

            echo "no docker container is running, starting one";
        
        fi

        if ! docker start $container ; then
        
            echo " error start docker container";

            last_timestamp=`expr $current_timestamp`
        fi
        
        echo "docker started"

        last_timestamp=`expr $current_timestamp`

    fi

    echo "Waiting for the next health restore to be scheduled."
    sleep 3600
done