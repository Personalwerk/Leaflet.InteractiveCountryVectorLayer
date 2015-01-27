# Using the Leaflet-Plugin

The Plugin contains a Layer named `L.TileLayer.Canvas.InteractiveCountryVectorLayer` which extends `L.TileLayer.Canvas` and implements a browser-drawn tile-layer. It also exposes a factory-function `L.tileLayer.canvas.interactiveCountryVectorLayer`.

## Requirements
 - jQuery 1.11.x - used for Ajax-Calls
 - Leaflet 0.7.x - 0.8-dev is not supported (and not stable yet)
 - dcodeIO-ByteBuffer.js
 - dcodeIO-ProtoBuf.js

## Usage example

````javascript
var vectileLayer = new L.TileLayer.Canvas.InteractiveCountryVectorLayer({
	minZoom: 2,
	maxZoom: 9,
	aggregateProperty: 'admin'
});

// initialize the map on the "map" div with a given center and zoom
var map = L.map('map', {
	center: [0, 0],
	zoom: 2,
	layers: [vectileLayer]
});
````

## Creation
Factory                                                    | Description
-----------------------------------------------------------|------------------------------------------------------------------------------
L.tileLayer.canvas.interactiveCountryVectorLayer(options?) | Instantiates a Canvas tile layer object given an options object (optionally).

## Options
Option            | Type     | Default                                                            | Description
------------------|----------|--------------------------------------------------------------------|-----------------------------------------
protoUrl          | String   | http://osm.personalwerk.de/example-vectiles/proto/vectiles.proto   | URL to the `.proto`-File describing the Tile-Files specified with url. Although this file should be identical in almost all usecases, you should probably host it on your own domain.
url               | String   | http://osm.personalwerk.de/example-vectiles/{z}/{x}/{y}.pbf.base64 | URL to the `.pbf.base64`-Files describing the actual tile content. Read the Section about *Obtaining or Generating Vector-Tiles* in the main [../README.md](README-File). You should probably host them on your own domain, too.
aggregateProperty | String   | null                                                               | Name of one of the Tags present in the `.pbf.base64`-Files. The Value of this Property is used to connect multiple Polygons in the Input across multiple Tiles to a useful Area (like a Country). When one part of that Area is hovered, all others are highlighted as well. Without this property the `featureClick`-Event won't be fired and the `hover*`-Options as well as the `paint`-Callback are not used.
fillStyle         | String   | orange                                                             | Default Fill-Style accoring to the [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.fillStyle](Canvas-Specification)
strokeStyle       | String   | black                                                              | Default Stroke-Style accoring to the [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.strokeStyle](Canvas-Specification)
activeFillStyle   | String   | red                                                                | Fill-Style applied on a Area when the Mouse-Cursor is over it
activeStrokeStyle | String   | black                                                              | Stroke-Style applied on a Area when the Mouse-Cursor is over it
paint             | Function | null                                                               | Custom Paint-Function. See below for Usage-Instructions. Disables the Fill-/StrokeStyle properties


## Events


## Custom Paint-Function
In the `paint`-Property a custom Paint-Function can be supplied. It will be called whenever a Part of an Area needs to be Painted. It should be used to any custom behavior that exceeds the four Style-Properties mentioned above. The behaviour of the default paint-Function can be simulated  with a paint-Function like this:

````
var vectileLayer = new L.TileLayer.Canvas.InteractiveCountryVectorLayer({
	minZoom: 2,
	maxZoom: 9,
	aggregateProperty: 'admin',

	paint: function(ctx, active, poly, layer) {
		ctx.fillStyle = active ? layer.options.hoverFillStyle : layer.options.fillStyle;
		ctx.strokeStyle = active ? layer.options.hoverStrokeStyle : layer.options.strokeStyle;

		ctx.fill();
		ctx.stroke();
	}
});
````

The arguments it gets when called are set as follows:
Argument          | Type                                                                                   | Description
------------------|----------------------------------------------------------------------------------------|-----------------------------------------
ctx               | [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D](Context2D) | The Rendering-Context provided by `L.TileLayer.Canvas`. It will be exactly 256x256px in Size and represent one Tile. The Context has the Path to be displayed already pre-configured using `beginPath`/`moveTo`/`lineTo`/`closePath` and is ready to be filled, stroked, used as a clipping-path or do whatever you want to do.
active            | Boolean                                                                                | A Boolean indicating if the Mouse-Cursor is currently over the Area.
poly              | [../tilegen/proto/vectiles.proto](Polygon)-Object                                      | Polygon-Object directly taken from the Protocol-Buffer-Message. Currently the only useful sub-key is `poly.tags` which is an Object containing the Key/Value-Pairs written into the `.pbf.base64`-Tiles, but as you are free to generate Tile-Files with other Properties in the Polygon-Object you are passed it complete here.
layer             | InteractiveCountryVectorLayer-Object                                                   | A reference to the InteractiveCountryVectorLayer-Object. You can for example access `layer.options` to access the configured options.

## Internal Workings
tbd.
