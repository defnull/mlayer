MLayer = {}
MLayer.layer = {}
MLayer.geometry = {}

MLayer.extend = function(baseclass, override) {
    /* Creates a new class with values from $override mixed into the prototype
       of $baseclass. */

    // Override the constructor, if requested.
    var constructor = baseclass
    if(override.constructor && override.constructor !== ({}).constructor)
        constructor = override.constructor

    // Create a new constructor function that calls the old one.
    var cls = function(){
        constructor.apply(this, arguments);
    };

    // Clone the baseclass prototype.
    var dummy = function(){}
    dummy.prototype = baseclass.prototype;
    cls.prototype = new dummy();

    // Copy (and overwrite) new prototype values.
    for (var name in override) {
        if(name === 'constructor') continue;
        cls.prototype[name] = override[name];
    }

    return cls;
}



MLayer.Map = function(node, config) {
    // The root DOM node for all map related nodes.
    this.dom = jQuery(node);
    this.dom.css({overflow:'hidden', position:'relative', top:'0px', left:'0px', padding:'0px'})
    this.dom.empty()

    // Container for map layers
    this.mapdiv = jQuery('<div />');
    this.mapdiv.css({position:'absolute', top:'0px', left:'0px', width:'1px', height:'1px'});
    this.dom.append(this.mapdiv);

    // Container for HUD layers (these don't move)
    this.huddiv = this.mapdiv.clone();
    this.dom.append(this.huddiv);

    // Lists of map and hud layer objects
    this.maps = [];
    this.huds = [];

    // Base map layer (used for clipping and other stuff)
    this.base = null;

    /** A viewport defines the area of the map the user is able to see.
        It is a plain object with the following attributes:

        top: The X value of the top-most pixel row.
        left: The Y value of the left-most pixel column.
        width: The number of pixels in Y direction.
        height: The number of pixels in X direction.
        bottom: top+height
        right: left+width
        zoom: The zoom factor as specified by the user.
    */

    this.viewport = {top:    0, left:   0,
                     width:  0, height: 0,
                     bottom: 0, right:  0,
                     zoom:   0}

    // handle for the draw interval
    this._draw_interval = null;

    /*
     * Configuration 
     */

    this.autoclip = config.autoclip || true;
    this.draw_interval = config.draw_interval || 200;
    this.zindex = config.zindex || 100;
}

MLayer.Map.prototype = {
    start: function() {
        // Layout all layers and start the draw interval.
        if(this._draw_interval !== null) return
        this.layout()
        var self = this;
        this._draw_interval = window.setInterval(function(){
            self.draw();
        }, this.draw_interval)
    },
    stop: function() {
        // Clear the draw interval.
        if(this._draw_interval === null) return
        window.clearInterval(this._draw_interval);
        this._draw_interval = null;
    },
    show: function() {
        // Show the primary dom node and start rendering.
        this.dom.show();
        this.start();
    },
    hide: function() {
        // Hide the primary dom node and stop rendering.
        this.dom.hide();
        this.stop();
    },

    draw: function() {
        /* Draw each layer and check for a resized viewport.
            This method is called every draw_interval milliseconds and on
            events that drastically change the viewport (e.g. zoom).
        */
        var vp = this.viewport, dom = this.dom;
        var w = vp.width, h = vp.height;
        if(w != dom.innerWidth() || h != dom.innerHeight()) {
            vp.width  = dom.innerWidth();
            vp.height = dom.innerHeight();
            vp.bottom = vp.top + vp.height;
            vp.right  = vp.left + vp.width;
            this.huddiv.width(vp.width).height(vp.height)
            jQuery.each(this.maps, function(){ this.onResize(vp) });
            jQuery.each(this.huds, function(){ this.onResize(vp) });
        }
        jQuery.each(this.maps, function(){ this.onDraw(vp) })
        jQuery.each(this.huds, function(){ this.onDraw(vp) })
    },
    layout: function() {
        /* Create HTML nodes for all layers. */

        var mapdiv = this.mapdiv,
            huddiv = this.huddiv,
            zindex = this.zindex;

        // Do not layout an inactive map.
        if(this._draw_interval !== null) return;

        mapdiv.empty();
        jQuery.each(this.maps, function() {
            this.dom.css('z-index', zindex).empty();
            zindex += 1 + (this.onLayout(zindex) || 0);
            mapdiv.append(this.dom)
        })

        huddiv.empty();
        jQuery.each(this.huds, function() {
            this.dom.css('z-index', zindex).empty();
            zindex += 1 + (this.onLayout(zindex) || 0);
            huddiv.append(this.dom)
        })
        this.max_zindex = zindex;
    },
    addLayer: function(layer, base) {
        // Add a new layer object. If the second parameter is true, the layer
        // is used as the new base layer.
        layer.map = this
        if(layer.is_hud) {
            this.huds.push(layer);
        } else if(base || layer.is_base || !this.base) {
            if(this.base) this.base.is_base = false;
            layer.is_base = true;
            this.base = layer;
            this.maps.unshift(layer);
        } else {
            this.maps.push(layer);
        }
        this.layout();
        return layer
    },


    moveTo: function(x, y) {
        /*  Move the top-left corner viewport to a specific position. If
            either x or y are null, they default to the current position.

            Map movements are measured in browser pixels. The Map object has
            no knowlege about the scale or ratio of the data. Example: If each
            pixel represents n data units, and you want to move x data units
            to the left, you actually need to move x*n pixels to the left.
        */
        if(!this.base) return;
        var view = this.viewport;

        // Default to current position
        if(typeof x != 'number') x = view.left;
        if(typeof y != 'number') y = view.top;

        // Clip movements based on the current base-layer extent
        if(this.autoclip) {
            var box = this.base.getExtent(view.zoom);
            x = Math.max(box.left, Math.min(box.right-view.width, x));
            y = Math.max(box.top, Math.min(box.bottom-view.height, y));
        }

        // Calculate movement vector
        x = Math.round(x);
        y = Math.round(y);
        var dx = x - view.left;
        var dy = y - view.top;

        // No movement -> nothing to di.
        if(!dx && !dy) return;

        // Update viewport
        view.left   += dx;
        view.right  += dx;
        view.top    += dy;
        view.bottom += dy;

        // Trigger onMove callbacks for all maps.
        jQuery.each(this.maps, function(){ this.onMove(view) });
        jQuery.each(this.huds, function(){ this.onMove(view) });

        // Actually move the primaty dom node.
        this.mapdiv.css({left: -x+'px', top: -y+'px'});
    },
    moveBy: function(dx, dy) {
        // Move the viewport by a specific (pixel) distance.
        this.moveTo(this.viewport.left + dx, this.viewport.top + dy);
    },
    zoom: function(level) {
        // Change the zoom level but keep the focus on the same spot.
        // e.g. If the extent of the base layer changes, the map is moved to
        // the new position. This usually triggers a redraw.

        var view = this.viewport
        var old = view.zoom
        view.zoom = level

        // Trigger onZoom callbacks for all maps.
        jQuery.each(this.maps, function(){ this.onZoom(view) });
        jQuery.each(this.huds, function(){ this.onZoom(view) });

        // Get old and new extend
        var obox = this.base.getExtent(old);
        var nbox = this.base.getExtent(level);

        // Calculate center of current viewport in old extend
        var cx = view.left + view.width  / 2;
        var cy = view.top  + view.height / 2;

        // Calculate relative position of center within old extend
        var ox = (cx - obox.left) / (obox.right  - obox.left);
        var oy = (cy - obox.top)  / (obox.bottom - obox.top);

        // Calculate position of center in new extend
        var nx = nbox.left + ox * (nbox.right  - nbox.left);
        var ny = nbox.top  + oy * (nbox.bottom - nbox.top);

        // Move to new center and redraw.
        this.moveTo(nx - view.width/2, ny - view.height/2);
        this.draw();

        return old;
    }
}

MLayer.layer.BaseLayer = function(config) {
    this.config = config || {}
    this.dom = jQuery('<div />')
    this.dom.css({ position: 'absolute', top: '0px', left: '0px',
                   width: '1px', height: '1px' })
    this.map = null;
    this.init(config||{})
}

MLayer.layer.BaseLayer.prototype = {
    is_base: false,
    init: function(config) {
        /* Called by the constructor. */
    },
    getExtent: function(zoom) {
        /* Called by the Map to get the extend of the base layer. The extent
           is an object with the following attributes:

           top: Minimum x value.
           left: Minimum y value.
           bottom: Maximum x value.
           right: Maximum y value.

           The extend should be calculated according to the specified zoom
           level. If a zoom level is not supported, return null. The returned
           object must not change at runtime.
        */
        return {top:0, left:0, right:0, bottom:0};
    },
    onLayout: function(zIndex) {
        // Called by the Map as soon as the layer is is added to the dom tree
        //  and on subsequent Map.layout() calls. This should create all
        //  dom nodes required to display the data and add them to this.dom.
        // @param zIndex CSS z-index of this.dom.
        // @return The number of additional z-indices used by this Layer.
        return 0
    },
    onDraw: function(viewport) {
        /* Called every Map.draw_interval milliseconds, even if the viewport
         * did not change. Should update visuals according to new viewport.
         */
    },
    onResize: function(viewport) {
        /* Called on viewport resize events, just before the draw() call.
         * @param viewport Current viewport.
        */
    },
    onZoom: function(viewport) {
        /* Called on zoom events.
         * @param viewport Current viewport.
        */
    },
    onMove: function(viewport) {
        /* Called on every single move event. Do only fast calculations here.
         */
    }
}
}

