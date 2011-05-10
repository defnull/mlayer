// REQUIRE mlayer.base.js

mlayer.layer.Tiles = mlayer.extend(mlayer.layer.BaseLayer, {
    init: function(config) {
        // Position and number of currently displayed tiles
        this.covered = {top:0, left:0, bottom:0, right:0}
        this.tilesize = config.tilesize || 256;
        this.offset = config.offset || {top:0, left:0}
        this.size = config.size || {width:0, height:0}
        
        // Number of tiles to draw in advance
        this.buffer = config.buffer || 0;
        if(typeof config.url == 'string') {
            var url = config.url
            config.url = function(x, y, z, ts) {
                return url.replace(/\{x\*size\}/g, x*ts)
                          .replace(/\{y\*size\}/g, y*ts)
                          .replace(/\{x\}/g, x)
                          .replace(/\{y\}/g, y)
                          .replace(/\{z\}/g, z)
                          .replace(/\{size\}/g, ts);
            }
        }
        if(typeof config.url == 'function')
            this.url = config.url;
    },
    getExtent: function(zoom) {
        var scale = Math.pow(2, zoom/10)
        return {
            top: this.offset.top * scale,
            left: this.offset.left * scale,
            bottom: (this.offset.top + this.size.height) * scale,
            right: (this.offset.left + this.size.width) * scale,
        }
    },
    onDraw: function(view) {
        if(!this.url) return;

        var cov = this.covered;
        var ts = this.tilesize;
        var ext = this.getExtent(view.zoom);
        var off = this.offset;

        // Calculate visible tiles (including border)
        var vtop    = Math.floor(view.top    / ts) - this.buffer;
        var vleft   = Math.floor(view.left   / ts) - this.buffer;
        var vbottom = Math.ceil( view.bottom / ts) + this.buffer;
        var vright  = Math.ceil( view.right  / ts) + this.buffer;

        // Clip visible tiles on extent
        vtop    = Math.max(vtop,    Math.floor(ext.top    / ts));
        vleft   = Math.max(vleft,   Math.floor(ext.left   / ts));
        vbottom = Math.min(vbottom, Math.ceil(ext.bottom / ts));
        vright  = Math.min(vright,  Math.ceil(ext.right  / ts));
        
        if(vtop == vbottom || vleft == vright) return;
        if(cov.top != vtop || cov.left != vleft || cov.bottom != vbottom || cov.right != vright) {
            var html = '';
            var z = view.zoom;
            for(var x=vleft; x<vright; x++) {
                for(var y=vtop; y<vbottom; y++) {
                    html += '<span style="position: absolute;'+
                            ' width:'+ts+'px; height:'+ts+'px;'+
                            ' top:'+(y*ts)+'px; left:'+(x*ts)+'px;'+
                            ' background: transparent url(\''+this.url(x,y,z,ts)+'\')" no-repeat top left" />';
                }
            }
            this.dom.html(html);
            cov.top = vtop;
            cov.left = vleft;
            cov.right = vright;
            cov.bottom = vbottom;
        }
    },
    onLayout: function() {
        this.covered = {top:0, left:0, bottom:0, right:0}
    }
})
