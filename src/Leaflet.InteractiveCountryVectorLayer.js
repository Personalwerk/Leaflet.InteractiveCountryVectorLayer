L.TileLayer.Canvas.InteractiveCountryVectorLayer = L.TileLayer.Canvas.extend({
	options: {
		aggregateProperty: null,

		protoUrl: 'http://osm.personalwerk.de/example-vectiles/proto/vectiles.proto',
		url: 'http://osm.personalwerk.de/example-vectiles/{z}/{x}/{y}.pbf.base64',

		fillStyle: 'orange',
		strokeStyle: 'black',

		hoverFillStyle: 'red',
		hoverStrokeStyle: 'black',

		paint: null,
	},

	initialize: function(options) {
		L.TileLayer.Canvas.prototype.initialize.call(this, L.extend(options, {
			async: true,
			noWrap: true
		}));

		this._vectileData = {};
		this._displayCanvas = {};
		this._hitmapImageData = {};

		this._currentHover =  null;
		this._map = null;

		this.Vectile = dcodeIO.ProtoBuf.loadProtoFile(this.options.protoUrl).build("de.pwrk.vectiles.Vectile");
	},

	_id: function(z, x, y) {
		if(typeof(y) != "undefined")
			return z+'/'+x+'/'+y;
		else
			return z+'/'+x.x+'/'+x.y;
	},

	onAdd: function(map) {
		L.TileLayer.Canvas.prototype.onAdd.call(this, map);

		var layer = this;
		layer._map = map;

		var isDragging = false;
		map.on('dragstart', function() {
			isDragging = true;
		}).on('dragend', function() {
			isDragging = false;
		})

		if(layer.options.aggregateProperty) map.on('mousemove', function(e) {
			if(isDragging) return;

			var zoom = layer._map.getZoom();

			if (zoom > layer.options.maxZoom ||
				zoom < layer.options.minZoom) { return; }

			// determine tile under mouse
			// check hitmap for poly unter curser
			// check if the hoverstate has changed
			// if yes
			//   find tiles in viewport
			//   iterate those tiles
			//     check if those tiles contain the old or the new hovered poly
			//     if yes
			//       redraw them

			// determine tile unter mouse && check hitmap for poly unter curser
			var
				hoverFeature = layer._findHoverFeature(e.layerPoint),
				oldHoverValue = layer._currentHover ? layer._currentHover.tags[layer.options.aggregateProperty] : null,
				newHoverValue = hoverFeature ? hoverFeature.tags[layer.options.aggregateProperty] : null;

			layer._currentHover = hoverFeature;

			// check if the hoverstate has changed
			if(newHoverValue != oldHoverValue)
			{
				layer.fire('activeChanged', {'new': newHoverValue, 'old': oldHoverValue});

				// iterate tiles
				var kArr, x, y, key;
				for (key in layer._tiles) {
					kArr = key.split(':');
					x = parseInt(kArr[0], 10);
					y = parseInt(kArr[1], 10);

					var id = layer._id(zoom, x, y),
						containedValues = layer._vectileData[id] ? layer._vectileData[id].containedAggerateValues : null;

					// check if those tiles contain the old or the new hovered poly
					if(
						containedValues &&
						(containedValues.indexOf(oldHoverValue) !== -1 || containedValues.indexOf(newHoverValue) !== -1)
					) {
						// if yes, redraw them
						layer._drawDispalyTile(L.point(x, y), zoom);
					}
				}

			}
		}).on('click', function(e) {
			layer.fire('featureClick', {
				'feature': layer._currentHover,
				'aggregateValue': layer._currentHover ? layer._currentHover.tags[layer.options.aggregateProperty] : null
			});
		});
	},

	_findHoverFeature: function(layerPoint) {
		var
			layer = this,
			tilePoint = layerPoint
				.add(layer._map.getPixelOrigin())
				.divideBy(layer._getTileSize())
				.floor(),
			tilePixel = layerPoint
				.add(layer._map.getPixelOrigin())
				.subtract(
					tilePoint.multiplyBy(layer._getTileSize())
				),
			id = layer._id(layer._map._zoom, tilePoint),
			hitmapImageData = layer._hitmapImageData[id];

		if(!hitmapImageData)
			return null;

		var
			pxIdx = tilePixel.x * 4 + tilePixel.y * hitmapImageData.width * 4,
			polyIdx = layer._rgbintsToInt(hitmapImageData.data[pxIdx+0], hitmapImageData.data[pxIdx+1], hitmapImageData.data[pxIdx+2]),
			polyPlausibility = hitmapImageData.data[pxIdx+3];


		if(255 != polyPlausibility)
			return null;

		if(0 == polyIdx)
			return null;

		return this._vectileData[id].polys[polyIdx-1];
	},

	drawTile: function(canvas, tilePoint, zoom) {
		var
			layer = this,
			id = layer._id(zoom, tilePoint),
			url = L.Util.template(layer.options.url, {z: zoom, x: tilePoint.x, y: tilePoint.y});

		$.get(url, function(buf) {
			var
				vectile = layer.Vectile.decode(buf),
				containedAggerates = {};

			$.each(vectile.polys, function(polyIdx, poly) {
				var tags = {};

				for (var i = 0; i < poly.tags.length; i++) {
					var
						k = poly.tags[i].k,
						v = poly.tags[i].v;

					tags[k] = v;

					if(layer.options.aggregateProperty == k)
						containedAggerates[v] = true;
				}
				poly.tags = tags;

			});
			vectile.containedAggerateValues = Object.keys(containedAggerates);

			layer._vectileData[id] = vectile;

			var hitmapCanvas = document.createElement('canvas');
			hitmapCanvas.width = canvas.width;
			hitmapCanvas.height = canvas.height;

			layer._drawHitmapTile(hitmapCanvas, tilePoint, zoom);
			layer._hitmapImageData[id] = hitmapCanvas.getContext('2d').getImageData(0, 0, hitmapCanvas.width, hitmapCanvas.height);

			layer._displayCanvas[id] = canvas;
			layer._drawDispalyTile(tilePoint, zoom);

			layer.tileDrawn(canvas);
		});
	},

	_drawHitmapTile: function(hitmapCanvas, tilePoint, zoom) {
		var
			layer = this,
			id = layer._id(zoom, tilePoint),
			vectile = layer._vectileData[id],
			ctx = hitmapCanvas.getContext('2d');

		$.each(vectile.polys, function(polyIdx, poly) {
			ctx.beginPath();

			layer._drawPoly(ctx, poly);

			ctx.closePath();
			ctx.fillStyle = layer._intToRgb(polyIdx+1);
			ctx.fill();
		});
	},

	_drawDispalyTile: function(tilePoint, zoom) {
		var
			layer = this,
			id = layer._id(zoom, tilePoint),
			vectile = layer._vectileData[id],
			ctx = layer._displayCanvas[id].getContext('2d');

		$.each(vectile.polys, function(polyIdx, poly) {
			var
				value = poly.tags[layer.options.aggregateProperty],
				active = (layer.options.aggregateProperty && layer._currentHover && layer._currentHover.tags[layer.options.aggregateProperty] == value);

			ctx.beginPath();

			layer._drawPoly(ctx, poly);

			ctx.closePath();
			layer._canvasPaintPath(ctx, active, poly);
		});
	},

	_canvasPaintPath: function(ctx, active, poly) {
		var layer = this;

		if(layer.options.paint)
		{
			layer.options.paint(ctx, active, poly, layer);
		}
		else
		{
			ctx.fillStyle = active ? layer.options.hoverFillStyle : layer.options.fillStyle;
			ctx.strokeStyle = active ? layer.options.hoverStrokeStyle : layer.options.strokeStyle;

			ctx.fill();
			ctx.stroke();
		}
	},

	_drawPoly: function(ctx, poly) {
		var deltax = null, deltay = null;
		$.each(poly.delta_x, function(coordIdx) {
			var
				dx = poly.delta_x[coordIdx],
				dy = poly.delta_y[coordIdx];

			if(deltax == null && deltay == null)
				ctx.moveTo(deltax = dx, 256 - (deltay = dy));
			else
				ctx.lineTo(deltax += dx, 256 - (deltay += dy));
		});
	},



	_lpad: function(str, length, padchar)
	{
		padchar = padchar || '0';

		while(str.length < length)
			str = padchar + str;

		return str;
	},

	_intToRgb: function(i)
	{
		return '#'+this._lpad((new Number(i)).toString(16), 6);
	},

	_rgbToInt: function(rgb)
	{
		return parseInt(rgb.slice(1), 16);
	},

	_rgbintsToInt: function(r, g, b)
	{
		return (r << 16) + (g << 8) + b;
	}
});

L.tileLayer.canvas.interactiveCountryVectorLayer = function(options) {
	return new L.TileLayer.Canvas.InteractiveCountryVectorLayer(options);
}
