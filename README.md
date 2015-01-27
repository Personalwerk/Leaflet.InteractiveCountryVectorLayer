# Leaflet.InteractiveCountryVectorLayer
An Interactive Browser-Rendered Vector-Map based on Leaflet, that can display World-Wide Country data at 10m Resolution while still being fully interactive.

This [http://leafletjs.com/](Leaflet)-Plugin allows rendering Vector-Maps in any [http://caniuse.com/canvas](Canvas-Capable Browser). It provides a couple of useful features:
 - Realtime Hit-Detection
 - Support for High-Resolution Vectordata (10m/px)
 - Dynamicly changing Paint-Style on Hover
 - Metadata on Hover/Leave-Events (like the Country-Name, Country-Code)

## Live-Example
tbd.

## Generating Vector-Tiles
To generate your own Vector-Tiles the [tilegen/tilegen.py](tilegen.py) Tool can be used. Take a look at [tilegen/](its README) to get further instructions on how to use it. It employes [https://pypi.python.org/pypi/Fiona](Fiona) to read Vectordata-Sources. Fiona is based on [http://www.gdal.org/](GDAL/OGR) and can thus read any Datasource that OGR can, including [http://en.wikipedia.org/wiki/Shapefile](Shapefiles), [http://en.wikipedia.org/wiki/SpatiaLite](SpatiaLite) Databases and probably more.

## Obtaining Pre-Generated Vector-Tiles
Generating the Tiles is a CPU-Intense activity. The tilegen-Script can run multiple Hours even on fast Computers. For this reason Personalwerk offers pre-generated Tiles at http://osm.personalwerk.de/example-vectiles/. The Files directly accessable in this Folder are *for Texting and Experimenting only*. If you want to use these Tiles in Production, download [http://osm.personalwerk.de/example-vectiles/example-vectiles.zip](all Tiles in a Zip) or generate them yourself. The Zip will expand to around 3 GB of Data.

These Tiles contain Areas for the 247 countries in the world (Greenland as separate from Denmark) in 10m/50m resolution (as provided by [http://www.naturalearthdata.com/](naturalearthdata.com). The following Tags are attached to each Area and can be used in Events or Paint-Function:

key       | value
----------|---------------------------------------------
admin     | Human-Readable (english) name of the Country
iso_a2    | ISO-3166-1 ALPHA-2 (2-Character) Code
iso_a3    | ISO-3166-1 ALPHA-3 (3-Character) Code
subregion | Human-Readable (english) name of the Region this Country is in
subunit   | identical (?) to admin

## Using the Leaflet-Plugin
The tiles obtained in the previous section are consumed by the Leafelet-Plugin located at [layer/](layer). Take a look at [tilegen/](its README) to get API-Documentation and further explanations of its inner workings.

## More Examples
A usage-Example is provided in [examples/](examples).
