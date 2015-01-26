## Generating Vector-Tiles

## Setting up the Environment
To setup a ready-to-run Environment, call

    ./setup-env.sh

This will
 - Download the 50m and the 10m admin_0_countries-Shapefiles from http://www.naturalearthdata.com/. They contain the 197 sovereign states in the world in a reasonable resolution and with a large Set of metadata.
 - Install the following Packages: `python2.7-dev libgeos-dev libgdal-dev protobuf-compiler`. These Packages are available on Ubuntu 14.10 and Debian 7.
 - Setup a Python2-virtualenv
 - Install the following pips: `PyProj Shapely Fiona protobuf`

## Running the Tile-Generator-Script
To run `tilegen.py` execute the following Commandline:

    ./env/bin/python tilegen.py

This will extract Tiles for the Zoom-Levels 2-8 from the downloaded Shapefiles. Tiles for the Zoom-Levels 2-5 are extracted from the 50m Shapefiles, while Zoom 6-8 are extracted from the higher resolution 10m-Files. If you want to extract from other Files or experiment with other Zoomlevels, just edit the `main()`-Function at the end of the script.

Even on fast CPUs the Script can run multiple Hours. If all you want are the standard Tiles as described above, usually downloading the [http://osm.personalwerk.de/example-vectiles/example-vectiles.zip](Pre-Generated Tiles as a Zip) is faster.
