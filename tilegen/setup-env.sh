#!/bin/sh

mkdir env
cd env

for size in 10m 50m; do
	fname=ne_${size}_admin_0_countries.zip
	dname=$(basename $fname .zip)
	wget -c http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/$size/cultural/$fname
	mkdir -p $dname
	cd $dname
	unzip -o ../$fname
	cd ..
done

echo "Installing required Prequisites"
sudo apt-get install python2.7-dev libgeos-dev libgdal-dev protobuf-compiler

virtualenv -p python2 .
./bin/pip install PyProj Shapely Fiona protobuf

cd ..
