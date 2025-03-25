#!/bin/bash

image=$(docker images | awk '/wcb_rates_import_automation/ {print $3}');

container=$(docker ps -a | awk -v pattern="$last_image" '$0 ~ pattern {print $1}');

echo $container;
docker stop $container &> /dev/null;

docker start $container;

echo "docker restarted"