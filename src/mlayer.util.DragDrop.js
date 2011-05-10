// REQUIRE mlayer.base.js

/* This object recognizes drag-move-drop gestures starting from a specific
   HTML node.
   
   Three callbacks are available: onDrag, onMove and onDrop. Each gets the
   DragDrop instance as its only argument.

*/

mlayer.util.DragDrop = function(config){
    config          = config || {}
    this.shield     = null;
    this.dragging   = false;
    this.posStart   = [0, 0];
    this.posCurrent = [0, 0];
    this.posLast    = [0, 0];
    this.onDrag     = config.onDrag || function(){}
    this.onMove     = config.onMove || function(){}
    this.onDrop     = config.onDrop || function(){}
    if(config.dom){
        this.setDom(config.dom)
    };
}

mlayer.util.DragDrop.prototype = {
    setDom: function(dom) {
        this.dom = jQuery(dom);
        var self = this;
        var mouseDown = function(e) {
            e.stopPropagation();
            e.preventDefault();
            // We missed a mouseUp event ??
            if(self.dragging) { mouseUp(e); }
            self.posStart   = [e.pageX, e.pageY];
            self.posLast    = [e.pageX, e.pageY];
            self.posCurrent = [e.pageX, e.pageY];
            self.dragging = true;
            if(!self.shield) {
                self.shield = jQuery('<div />').css({
                    position: 'absolute',
                    visibility: 'hidden',
                    width: '100%',
                    height: '100%',
                    zIndex: '99999'
                }).prependTo('body:first');
            }
            self.shield.css({cursor:'move', visibility: "visible"});
            jQuery(document).bind('mousemove', mouseMove);
            jQuery(document).bind('mouseup', mouseUp);
            self.onDrag(self);
        }
        var mouseMove = function(e) {
            if(!self.dragging) return;
            e.stopPropagation();
            e.preventDefault();
            self.posLast = self.posCurrent;
            self.posCurrent = [e.pageX, e.pageY];
            self.onMove(self);
        }
        var mouseUp = function(e) {
            jQuery(document).unbind('mousemove', mouseMove);
            jQuery(document).unbind('mouseup', mouseUp);
            if(!self.dragging) return;
            self.posLast = self.posCurrent;
            self.posCurrent = [e.pageX, e.pageY];
            self.dragging = false;
            self.shield.css({cursor:'', visibility: "hidden"});
            self.onDrop();
        }
        this.dom.bind('mousedown', mouseDown);
    },
    onDragStart: function() {},
    onDragMove: function() {},
    onDragStop: function() {}
}
