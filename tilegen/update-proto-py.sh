#!/bin/sh
protoc -I=proto --python_out=proto/py proto/vectiles.proto
