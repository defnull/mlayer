// REQUIRE mlayer.base.js
// REQUIRE mlayer.util.DragDrop.js

mlayer.layer.Controls = mlayer.extend(mlayer.layer.BaseLayer, {
    is_hud: true,
    init: function(config) {
        // Position and number of currently displayed tiles
        this.status = jQuery('<span />').css({
            position: 'absolute', width: '1px'
        }).appendTo(this.dom)
        this.dom.css({width: '100%', height:'100%'});
    },
    onLayout: function(zindex) {
        var map = this.map;
        var self = this;
        this.drag_control = new mlayer.util.DragDrop({
            dom: this.dom,
            onMove: function(c) {
                var dx = c.posCurrent[0] - c.posLast[0];
                var dy = c.posCurrent[1] - c.posLast[1];
                map.moveBy(-dx, -dy);
            }
        })

        this.joystick = jQuery('<div />').css({
            'background-image': 'url(/img/joystick.png)',
            'background-position': 'center center',
            position: 'absolute',
            top: '10px',
            left: '10px',
            width:'40px',
            height:'40px'}).appendTo(this.dom)

        this.joystick_control = new mlayer.util.DragDrop({
            dom: this.joystick,
            onDrag: function(c) {
                self._joystick_interval = window.setInterval(function(){
                    var dx = Math.ceil((c.posCurrent[0] - c.posStart[0])/10);
                    var dy = Math.ceil((c.posCurrent[1] - c.posStart[1])/10);
                    map.moveBy(dx, dy);
                }, 50)
            },
            onDrop: function(c) {
                window.clearInterval(self._joystick_interval);
                self._joystick_interval = null;
            }
        })

        this.status.css({top: '5px', left: (map.viewport.width-50)+'px'})
        return 0;
    },
    onResize: function(vp) {
        this.status.css({top: '5px', left: (vp.width-50)+'px'})
    },
    onMove: function(vp) {
        this.status.html('x:'+vp.left+' y:'+vp.top)
    }
});

