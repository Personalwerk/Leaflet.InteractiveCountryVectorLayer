## Generating Vector-Tiles

## Setting up the Environment
To setup a ready-to-run Environment, call

    ./setup-env.sh

This will
 - Download the 50m and the 10m admin_0_countries-Shapefiles from http://www.naturalearthdata.com/. They contain the 247 countries in the world (Greenland as separate from Denmark) in a reasonable resolution and with a large Set of metadata.
 - Install the following Packages: `python2.7-dev libgeos-dev libgdal-dev protobuf-compiler`. These Packages are available on Ubuntu 14.10 and Debian 7.
 - Setup a Python2-virtualenv
 - Install the following pips: `PyProj Shapely Fiona protobuf`

## Running the Tile-Generator-Script
To run `tilegen.py` execute the following Commandline:

    ./env/bin/python tilegen.py

This will extract Tiles for the Zoom-Levels 2-8 from the downloaded Shapefiles. Tiles for the Zoom-Levels 2-5 are extracted from the 50m Shapefiles, while Zoom 6-8 are extracted from the higher resolution 10m-Files. If you want to extract from other Files or experiment with other Zoomlevels, just edit the `main()`-Function at the end of the script.

The Input Shapefile is splitted at Tile-Boundaries conforming to the [Slippy map Tilenames](http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) known from Google Maps or OpenStreetMap. For each Tile three Files are written:
 - a `.bbox`-File containing nothing but the [WKT-Description](http://en.wikipedia.org/wiki/Well-known_text) of the Tile. This is mainly for debugging puroposes and not really required.
 - a `.pbf`-File containing a binary representation of a [ProtoBuf](https://developers.google.com/protocol-buffers/) Object which stores Attributes and a [generalized represenation](http://en.wikipedia.org/wiki/Cartographic_generalization) of all Geometries intersecting this Area in a structure optimized for size.
 - a `.pbf.base64`-File which is a base64-encoded representation of the above `.pbf`-File. This file is what is actually transferred using AJAX, because most Browsers do not handle loading binary Data via Ajax very well. Modern Browsers allow transferring those Files gzip-compressed, which compensates for the extra Size increased by the base64-encoding.

Even on fast CPUs the Script can run multiple Hours. If all you want are the standard Tiles as described above, usually downloading the [Pre-Generated Tiles as a Zip](http://osm.personalwerk.de/example-vectiles/example-vectiles.zip) is faster.

## Customize Protocol-Buffer
Without changing the [`vectiles.proto`](proto/vectiles.proto)-File you can add as many Tags as you want by modifying `tilegen.py` only. If String Key/Value tags are not enough, you can at any time use a custom `vectiles.proto` and add custom Fields to the `Polygon`-message. All client Code is transparent, as long as the existing Keys stay intact.
