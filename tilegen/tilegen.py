#!./env/bin/python
# -*- coding: UTF-8 -*-

import os
import sys
import math
import errno
import fiona
import base64
import pyproj
import pprint
import fiona.crs as crs
import shapely.geometry as geometry
from proto.py.vectiles_pb2 import *

reload(sys)
sys.setdefaultencoding('utf-8')

pWGS84 = pyproj.Proj(init='epsg:4326')
pGOOGLE = pyproj.Proj(init='epsg:3857')

def tile2deg(xtile, ytile, zoom):
	n = 2.0 ** zoom
	lon_deg = xtile / n * 360.0 - 180.0
	lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
	lat_deg = math.degrees(lat_rad)
	return (lat_deg, lon_deg)

def tile2bbox(xtile, ytile, zoom):
	n = 2.0 ** zoom
	topleft = tile2deg(xtile, ytile, zoom)
	bottomright = tile2deg(xtile+1, ytile+1, zoom)
	return (topleft[1], bottomright[0], bottomright[1], topleft[0])

def writePbfPoly(vectile, polygon, tilebbox, displaysize, props):
	tilebbox = list(tilebbox)
	[tilebbox[0], tilebbox[1]] = pyproj.transform(pWGS84, pGOOGLE, tilebbox[0], tilebbox[1])
	[tilebbox[2], tilebbox[3]] = pyproj.transform(pWGS84, pGOOGLE, tilebbox[2], tilebbox[3])

	vecpoly = vectile.polys.add()

	deltax = deltay = 0;

	for k, v in props.items():
		vecpoly.tags.add(k = k, v = v)

	for coord in polygon.exterior.coords:
		coord = pyproj.transform(pWGS84, pGOOGLE, coord[0], coord[1])
		x = int(
			(coord[0] - tilebbox[0]) / (tilebbox[2] - tilebbox[0]) * displaysize
		)
		y = int(
			(coord[1] - tilebbox[1]) / (tilebbox[3] - tilebbox[1]) * displaysize
		)

		diffx = x - deltax
		diffy = y - deltay

		if diffx == 0 and diffy == 0:
			continue

		vecpoly.delta_x.append(x - deltax)
		vecpoly.delta_y.append(y - deltay)

		deltax = x
		deltay = y

def tilegen(file, zoom, displaysize=2048):
	ntiles = 2 ** zoom

	with fiona.open(file, 'r') as source:

		#print source.meta
		for xtile in range(0, ntiles):
			for ytile in range(0, ntiles):
				print("{z}/{x}/{y}".format(z=zoom, x=xtile, y=ytile))

				try:
					os.makedirs("out/{z}/{x}".format(z=zoom, x=xtile))
				except OSError as exception:
					if exception.errno != errno.EEXIST:
						raise

				tilebbox = tile2bbox(xtile, ytile, zoom)
				stretchedTilebbox = list(tilebbox)
				stretchedTilebbox[0] -= 1
				stretchedTilebbox[1] -= 1
				stretchedTilebbox[2] += 1
				stretchedTilebbox[3] += 1
				bboxpoly = geometry.geo.box(*stretchedTilebbox)
				vectile = Vectile()

				with open("out/{z}/{x}/{y}.bbox".format(z=zoom, x=xtile, y=ytile), 'w') as wkt:
					wkt.write(bboxpoly.wkt)

				with open(
					"out/{z}/{x}/{y}.pbf".format(z=zoom, x=xtile, y=ytile), 'wb'
				) as pbf, open(
					"out/{z}/{x}/{y}.pbf.base64".format(z=zoom, x=xtile, y=ytile), 'wb'
				) as pbf64:

					for feature in source.filter(bbox=tilebbox):

						poly = 	geometry.shape(feature['geometry'])
						clippedpoly = bboxpoly.intersection(poly)
						featureProperties = {k.lower():v for k,v in feature['properties'].items()}

						properties = {
							'admin': featureProperties['admin'],

							'iso_a2': featureProperties['iso_a2'],
							'iso_a3': featureProperties['iso_a3'],
							'subunit': featureProperties['subunit'],
							'subregion': featureProperties['subregion'],

							'bbox': ','.join(map(str, poly.bounds))
						}

						if isinstance(clippedpoly, geometry.MultiPolygon):
							for polygon in clippedpoly:
								writePbfPoly(vectile, polygon, tilebbox, displaysize, properties)
						elif isinstance(clippedpoly, geometry.Polygon):
							writePbfPoly(vectile, clippedpoly, tilebbox, displaysize, properties)

					buf = vectile.SerializeToString()
					pbf.write(buf)
					pbf64.write(base64.b64encode(buf))

def main():
	for z in range(2, 6):
		tilegen('env/ne_50m_admin_0_countries/ne_50m_admin_0_countries.shp', z, 256)

	for z in range(6, 9):
		tilegen('env/ne_10m_admin_0_countries/ne_10m_admin_0_countries.shp', z, 256)

if __name__ == "__main__":
	main()
