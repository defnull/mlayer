MLayer.layer.LucullusView = MLayer.extend(MLayer.layer.Tiles, {
    init: function(config) {
        var self = this;
        config.url = function(x, y, z, ts) {
            return self.view.image(self.channel, x*ts, y*ts, z, ts, ts, 'png')
        }
        MLayer.layer.Tiles.prototype.init.call(this, config);

        this.channel = config.channel || 'default'
        this.view = config.view;
        this.view.on('change', function(view) {
            this.covered = {top:0, left:0, bottom:0, right:0};
            if(this.map) this.map.moveBy(0,0);
        }, this)
    },
    getExtent: function(zoom) {
        var scale = Math.pow(2, zoom/10)
        return {
            top: this.view.state.offset[0] * scale,
            left: this.view.state.offset[1] * scale,
            bottom: this.view.state.size[0] * scale,
            right: this.view.state.size[1] * scale,
        }
    }
})
