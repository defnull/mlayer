build: mlayer.js

mlayer.js: src/mlayer.*.js
	python build.py src/mlayer.*.js > mlayer.js
