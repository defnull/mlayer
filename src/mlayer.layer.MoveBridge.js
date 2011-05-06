/* This layer does not draw anything, but relays movements to a different map.
   It is used to synchronize two or more maps.
*/

MLayer.layer.MoveBridge = MLayer.extend(MLayer.layer.BaseLayer, {
    init: function(config) {
        this.target = config.target
        this.scaleX = typeof config.scaleX == 'number' ? config.scaleX : 1;
        this.scaleY = typeof config.scaleY == 'number' ? config.scaleY : 1;
        this.offsetX = config.offsetX || 0;
        this.offsetY = config.offsetY || 0;
    },
    onMove: function(vp) {
        this.target.moveTo(this.offsetX + this.scaleX * vp.left,
                           this.offsetY + this.scaleY * vp.top)
    },
    onZoom: function(vp) {
        this.target.zoom(vp.zoom)
    }
})
