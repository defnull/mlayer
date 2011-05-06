// REQUIRE mlayer.base.js
// REQUIRE mlayer.layer.Tiles.js

mlayer.layer.LucullusView = mlayer.extend(mlayer.layer.Tiles, {
    init: function(config) {
        var self = this;
        config.url = function(x, y, z, ts) {
            return self.view.image(self.channel, x*ts, y*ts, z, ts, ts, 'png')
        }
        mlayer.layer.Tiles.prototype.init.call(this, config);

        this.channel = config.channel || 'default'
        this.view = config.view;
        this.view.on('change', function(view) {
            this.covered = {top:0, left:0, bottom:0, right:0};
            this.offset.top = this.view.state.offset[0]
            this.offset.left = this.view.state.offset[1]
            this.size.width = this.view.state.size[0]
            this.size.height = this.view.state.size[1]
            if(this.map) this.map.moveBy(0,0);
        }, this)
    }
})
