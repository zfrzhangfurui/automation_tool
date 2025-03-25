#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is NOT installed." &&
    apt-get update &&
    apt-get install ca-certificates curl &&
    install -m 0755 -d /etc/apt/keyrings &&
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc &&
    chmod a+r /etc/apt/keyrings/docker.asc &&
    echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null &&
   sudo apt-get update -y &&
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 
fi

last_image=$(docker images | awk '/wcb_rates_import_automation/ {print $3}');

last_container=$(docker ps -a | awk -v pattern="$last_image" '$0 ~ pattern {print $1}');

docker stop $last_container &> /dev/null;

echo "docker container ${last_container} stopped";

docker rm $last_container &> /dev/null;

echo "docker container removed";

docker rmi $last_image;

docker build --target prod -t wcb_rates_import_automation:latest . ;

current_image=$(docker images | awk '/wcb_rates_import_automation/ {print $3}');

docker run -d --cap-add=SYS_ADMIN $current_image;

echo "docker container started"

echo "starting the Daemon Service"

cp ./health_restore.service /etc/systemd/system/ &&

cp ./restart.sh ./health_restore.sh ../ &&

systemctl daemon-reload &&

systemctl enable health_restore.service &&

sudo systemctl start health_restore.service &&

echo "install finished"

