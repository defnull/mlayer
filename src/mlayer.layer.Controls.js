// REQUIRE mlayer.base.js

MLayer.layer.Controls = MLayer.extend(MLayer.layer.BaseLayer, {
    is_hud: true,
    init: function(config) {
        // Position and number of currently displayed tiles
        this.status = jQuery('<span />').css({
            position: 'absolute', width: '1px'
        }).appendTo(this.dom)
    },
    onLayout: function(zindex) {
        var map = this.map;
        this.control = new Lucullus.maps.MapMouseControl()
        this.control.init(map.dom[0], null, {})
        this.control.onMovement = function(dx, dy) {
            map.moveBy(-dx, -dy);
        }
        this.joystick = jQuery('<div />').css({
            'background-image': 'url(/img/joystick.png)',
            'background-position': 'center center',
            position: 'absolute',
            top: '10px',
            left: '10px',
            width:'40px',
            height:'40px'});//.appendTo(this.dom)
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
