==========================
MLayer: OpenLayers light
==========================

MLayer is a tiny JavaScript library to display multi-layered dynamic maps in the
browser. It is heavily inspired by http://openlayers.org/ but aims to be
smaller, faster and less complicated.

Usage
======

::
	// <div id='map' style='width: 500px; height:400px;'/>

    var map = new MLayer.Map('#map', {});
    var layer = new MLayer.layer.Tiles({
        url: 'http://example.com/tiles/{size}/{x}-{y}-{z}.png'
    });
    map.addLayer(layer);
    map.show();
    