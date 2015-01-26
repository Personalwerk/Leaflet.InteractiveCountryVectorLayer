# Interactive Vector-Map
An Interactive Browser-Rendered Vector-Map based on Leaflet.

This [http://leafletjs.com/](Leaflet)-Plugin allows rendering Vector-Maps in any [http://caniuse.com/canvas](Canvas-Capable Browser). It provides a couple of useful features:
 - Realtime Hit-Detection
 - Changing Paint-Style on Hover
 - Metadata on Hover/Leave-Events (like the Country-Name, Country-Code)

## Live-Example
tbd.

## Generating Vector-Tiles
To generate your own Vector-Tiles the [tilegen/](tilegen.py) Tool can be used. It uses [https://pypi.python.org/pypi/Fiona](Fiona) to read Vectordata-Sources. Fiona is based on [http://www.gdal.org/](GDAL/OGR) and can thus read any Datasource that OGR can, including [http://en.wikipedia.org/wiki/Shapefile](Shapefiles), [http://en.wikipedia.org/wiki/SpatiaLite](SpatiaLite) Databases and probably more.

The Input Shapefile is splitted at Tile-Boundaries conforming to the [http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames](Slippy map Tilenames) known from Google Maps or OpenStreetMap. For each Tile three Files are written:
 - a `.bbox`-File containing nothing but the [http://en.wikipedia.org/wiki/Well-known_text](WKT-Description) of the Tile. This is mainly for debugging puroposes and not really required.
 - a `.pbf`-File containing a binary representation of a [https://developers.google.com/protocol-buffers/](ProtoBuf) Object which stores Attributes and a [http://en.wikipedia.org/wiki/Cartographic_generalization](generalized represenation) of all Geometries intersecting this Area in a structure optimized for size.
 - a `.pbf.base64`-File which is a base64-encoded representation of the above `.pbf`-File. This file is what is actually transferred using AJAX, because most Browsers do not handle loading binary Data via Ajax very well. Modern Browsers allow transferring those Files gzip-compressed, which compensates for the extra Size increased by the base64-encoding.

## Obtaining Pre-Generated Vector-Tiles
Generating the Tiles is a CPU-Intense activity. The tilegen-Script can run multiple Hours even on fast Computers. For this reason Personalwerk offers pre-generated Tiles at http://osm.personalwerk.de/example-vectiles/. The Files directly accessable in this Folder are *for Texting and Experimenting only*. If you want to use these Tiles in Production, download [http://osm.personalwerk.de/example-vectiles/example-vectiles.zip](all Tiles in a Zip) or generate them yourself. The Zip will expand to around 3 GB of Data.

## Leafelet-Layer Plugin
The tiles obtained in the previous section are consumed by the Leafelet-Plugin located at [layer/](layer).

examples/
A usage-Example is provided in [examples/](examples).
