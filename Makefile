build: mlayer.js

mlayer.js: src/mlayer.*.js README.rst build.py
	python build.py src/mlayer.*.js > mlayer.js
