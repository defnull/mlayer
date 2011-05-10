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
        this.control = new mlayer.util.DragDrop({
            onMove: function(c) {
                var dx = c.posCurrent[0] - c.posLast[0];
                var dy = c.posCurrent[1] - c.posLast[1];
                map.moveBy(-dx, -dy);
            }
        })
        this.control.setDom(this.dom)
        this.joystick = jQuery('<div />').css({
            'background-image': 'url(/img/joystick.png)',
            'background-position': 'center center',
            position: 'absolute',
            top: '10px',
            left: '10px',
            width:'40px',
            height:'40px'}).appendTo(this.dom)
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

