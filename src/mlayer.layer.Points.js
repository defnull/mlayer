// REQUIRE mlayer.base.js
/* Draw labeled points and show the label if the mouse is near the point. */

mlayer.layer.Points = mlayer.extend(mlayer.layer.BaseLayer, {
    init: function(config) {
        // Position and number of currently displayed tiles
        this.points = [];
        if(config.points) {
            var self = this
            jQuery.each(config.points, function(index, p) {
                self.addPoint(p);
            });
        }
        this.needs_refresh = true;
        this.extent = {top:0, bottom:0, left:0, right:0}
    },
    addPoint: function(p) {
        this.extent.top = Math.min(this.extent.top, p.x);
        this.extent.bottom = Math.max(this.extent.bottom, p.x);
        this.extent.left = Math.min(this.extent.left, p.y);
        this.extent.right = Math.max(this.extent.right, p.y);
        this.points.push(p);
        this.needs_refresh = true;
    },
    getExtend: function(zoom) {
        var scale = Math.pow(2, zoom/10)
        return { top: this.extent.top * scale,
                 left: this.extent.left * scale,
                 bottom: this.extent.bottom * scale,
                 right: this.extent.right * scale}
    },
    onZoom: function() {
        this.needs_refresh = true;
    },
    onLayout: function(zindex) {
        this.label_zindex = zindex+1;
        return 1
    },
    onDraw: function(vp) {
        if(! this.points) return;
        if(! this.needs_refresh) return;
        var html = '';
        var lz = this.label_zindex;
        var scale = Math.pow(2, vp.zoom/10)
        jQuery.each(this.points, function(index, p) {
            var name = p.name.replace(/&/g, "&amp;")
                             .replace(/</g, "&lt;")
                             .replace(/>/g, "&gt;");
            var x = Math.round(p.x*scale) - 1
            var y = Math.round(p.y*scale) - 1
            html += '<span style="position: absolute; width:1px; height:1px;'+
                    ' top: '+y+'px; left: '+x+'px;'+
                    ' border: 1px solid '+p.color+';">'+
                        '<span style="z-index: '+lz+'; display:none;'+
                        ' position: relative; top:5px; left:5px; width: 200px">'+
                            name+
                        '</span>'+
                    '</span>'
        })
        this.dom.html(html);
        this.dom.find('span span').parent().hover(function(){
            jQuery(this).children().show()
        }, function(){
            jQuery(this).children().hide()
        })
        this.needs_refresh = false;
    }
})
