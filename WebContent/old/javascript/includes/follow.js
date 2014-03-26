// Simple follow the mouse script
var followdivName = 'mydiv'; // div that is to follow the mouse// (must be position:absolute)
var offX = 15;
var offY = 15;
function mouseX(evt) {if (!evt) evt = window.event; if (evt.pageX) return evt.pageX; else if (evt.clientX)return evt.clientX + (document.documentElement.scrollLeft ?  document.documentElement.scrollLeft : document.body.scrollLeft); else return 0;}
function mouseY(evt) {if (!evt) evt = window.event; if (evt.pageY) return evt.pageY; else if (evt.clientY)return evt.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop); else return 0;}
function follow(evt) {if (document.getElementById) {var obj = document.getElementById(followdivName).style; obj.visibility = 'visible';
obj.left = (parseInt(mouseX(evt))+offX) + 'px';
obj.top = (parseInt(mouseY(evt))+offY) + 'px';}}
document.onmousemove = follow;