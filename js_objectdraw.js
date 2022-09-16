/* This notice must be untouched at all times.

js_objectdraw.js    v. 1.0b
Based on wz_jsgraphics.js (JavaScript VectorDraw Library by Walter Zorn, Copyright (c) 2002-2004)

The latest version is available at
http://popov654.pp.ru/js/js_objectDraw.js

Copyright (c) 2012 Alexandr Popov. All rights reserved.
Created 07.12.2011 by Alexandr Popov (Web: http://popov654.pp.ru )
Last modified: 27.08.2022


High Performance JavaScript Modelling Library.
Provides methods
- to create, copy, resize and rotate rectangles, triangles, circles and other polygons*
	with the specified color and border;
- to create labels with the specified font, color and size;
- to connect objects with straight lines/broken lines.


NOTE: The library was constructed mainly for testing purposes. Nevertheless, you can use
it the way you like to build rich applications based on its methods.

LICENSE: LGPL

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License (LGPL) as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA,
or see http://www.gnu.org/copyleft/lesser.html
*/

    var backend = isCanvasSupported() ? 'canvas' : 'wz_jsgraphics'
    var object_always_on_top_while_dragging = false
    var jg = null
    
    function isCanvasSupported() {
       var elem = document.createElement('canvas');
       return !!(elem.getContext && elem.getContext('2d'));
    }

    function Initialize(id) {
        div_id = id
        switch (backend) {
           case 'wz_jsgraphics':
              jg = new jsGraphics(id);
              break;
           case 'canvas':
              jg = new jsCanvas(id);
              break;
           case 'svg':
              jg = new jsSVG(id);
              break;
        }
        protos = []
        working_area = []
        Circle.prototype = new Shape('circle')
        Triangle.prototype = new Shape('triangle')
        Rectangle.prototype = new Shape('rectangle')
        TextObject.prototype = new Shape('text')
    }

    function getContext() {
        return jg;
    }

    var jg;

    function Shape(type, color, x, y, width, height) {
        this.type = type

        this.color = color || '#DADADA'

        this.x = x || document.getElementById(div_id).style.width / 2
        this.y = y || document.getElementById(div_id).style.height / 2

        this.width = width || 22
        this.height = height || 22
        this.borderWidth = 0
        this.borderColor = '#000000'
        this.xPoints = []
        this.yPoints = []
        this.deltas = []
        this.rs = []
        this.offsetsX = []
        this.offsetsY = []
        this.docks = []
     }

     function Circle(color, x, y, width, height) {
         this.color = color
         this.x = x
         this.y = y
         this.width = width || 22
         this.height = height || 22
         this.draw = function() {
             jg.setColor(this.color)
             jg.fillEllipse(x, y, width, height);
             jg.paint()
         }
         this.draw()
         this.padding = 6
         this.crop = 0
     }


     function Triangle(color, x, y, width, height) {
         this.color = color
         this.x = x
         this.y = y
         this.width = width || 22
         this.height = height || 22
         this.xPoints = new Array(x, x + width / 2, x + width)
         this.yPoints = new Array(y + height, y, y + height)
         this.offsetsX = new Array(0, width / 2, width)
         this.offsetsY = new Array(height, 0, height)
         this.deltas = new Array(Math.PI / 2, Math.PI * 1.25, Math.PI * 1.75)
         this.rs = new Array(0.5, Math.SQRT1_2, Math.SQRT1_2)
         this.draw = function() {
             jg.setColor(this.color)
             jg.fillPolygon(this.xPoints, this.yPoints);
             jg.paint()
         }
         this.draw()
         this.angle = 0
         this.vNum = 3
         this.padding = 6
         this.crop = 0
     }


     function Rectangle(color, x, y, width, height) {
         this.color = color
         this.x = x
         this.y = y
         this.width = width || 22
         this.height = height || 22
         this.xPoints = new Array(x, x + width, x + width, x)
         this.yPoints = new Array(y, y, y + height, y + height)
         this.deltas = new Array(Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75)
         this.rs = new Array(Math.SQRT1_2, Math.SQRT1_2, Math.SQRT1_2, Math.SQRT1_2)
         this.offsetsX = new Array(0, width, width, 0)
         this.offsetsY = new Array(0, 0, height, height)
         this.draw = function() {
             jg.setColor(this.color)
             jg.fillPolygon(this.xPoints, this.yPoints);
             jg.paint()
         }
         this.draw()
         this.angle = 0
         this.vNum = 4
         this.padding = 6
         this.crop = 0
     }

     function Point(x, y, c) {
         this.type = "point"
         this.connection = c
         this.x = x
         this.y = y
         this.width = 8
         this.height = 8
         this.xPoints = [x]
         this.yPoints = [y]
         this.deltas = [0]
         this.rs = [0]
         this.offsetsX = new Array(0)
         this.offsetsY = new Array(0)
         this.draw = function() {}
         this.angle = 0
         this.vNum = 1
         this.padding = 6
         this.draw = function() {}
     }


     function TextObject(color, x, y, width, height) {
         this.color = color
         this.x = x
         this.y = y
         this.width = width || 22
         this.height = height || 22
         this.draw = function() {
             jg.setColor(this.color)
             jg.fillRect(x + width / 2 - 2, y, 4, height);
             jg.fillRect(x + 2, y, width - 5, 4);

             var xPoints = new Array(x + width / 2 - 2, x + width / 2 - 4, x + width / 2 + 3, x + width / 2 + 1);
             var yPoints = new Array(y + height - 2, y + height, y + height, y + height - 2);
             jg.fillPolygon(xPoints, yPoints);

             xPoints = new Array(x + 2, x + 2, x, x);
             yPoints = new Array(y + 3, y, y, y + 5);
             jg.fillPolygon(xPoints, yPoints);

             xPoints = new Array(x + width - 3, x + width - 3, x + width - 1, x + width - 1);
             yPoints = new Array(y + 3, y, y, y + 5);
             jg.fillPolygon(xPoints, yPoints);

             jg.paint()
         }
         this.draw()
         this.angle = 0
         this.vNum = 0
         this.text = ''
         this.fontSize = 15
         this.font = "Arial, Helvetica, sans-serif"
         this.fontWeight = "normal"
         this.fontStyle = "normal"
         this.align = "center"
         this.underline = false
         this.padding = 6
         this.crop = 0
     }

     function Connection(from, to, dockFrom, dockTo, points, width, color, arrType) {
         this.type = "connection"
         this.from = from
         this.to = to
         this.dockFrom = dockFrom || 1
         this.dockTo = dockTo || 1
         this.lineWidth = width || 3
         this.lineColor = color || "#828282"
         this.points = points || []
         this.arrType = arrType || 0
         this.draw = function() {
            jg.setColor(this.lineColor)
            jg.setStroke(this.lineWidth)

            var x = this.from.x + this.from.docks[this.dockFrom][0]
            var y = this.from.y + this.from.docks[this.dockFrom][1]
            var xTo = this.to.x + this.to.docks[this.dockTo][0]
            var yTo = this.to.y + this.to.docks[this.dockTo][1]

            for (var i = 0; i < this.points.length; i++) {
               if (i == 0 && this.arrType > 1) {
                  var c = correct(this.from.x + this.points[i].x, this.from.y + this.points[i].y, x, y, this.lineWidth, this.points.length)
                  x2 = c[0]; y2 = c[1]; xTo2 = c[2]; yTo2 = c[3]

                  jg.drawLine(x2, y2, xTo2, yTo2)
                  drawArrow(x, y, this.from.x + this.points[i].x, this.from.y + this.points[i].y, this.lineWidth)
               } else {
                  jg.drawLine(x, y, this.from.x + this.points[i].x, this.from.y + this.points[i].y)
               }

               x = this.from.x + this.points[i].x
               y = this.from.y + this.points[i].y
            }

            var xTo2 = xTo
            var yTo2 = yTo

            var x2 = x
            var y2 = y

            if (this.arrType > 0) {
               var c = correct(x, y, xTo, yTo, this.lineWidth, this.arrType, this.points.length)
               x2 = c[0]; y2 = c[1]; xTo2 = c[2]; yTo2 = c[3]
               jg.drawLine(x2, y2, xTo2, yTo2)
               if (this.arrType != 2) {
                  drawArrow(xTo, yTo, x, y, this.lineWidth)
               }
               if (this.points.length == 0 && this.arrType > 1) {
                  drawArrow(x, y, xTo, yTo, this.lineWidth)
               }
            } else {
               jg.drawLine(x, y, xTo, yTo)
            }
         }
         this.draw()
     }


     function displayOutline(obj) {
         if (obj.type == "point") {
            jg.setColor('#FFCC00');
            var x = obj.connection.from.x + obj.x
            var y = obj.connection.from.y + obj.y
            var i = 3 + Math.ceil(obj.connection.lineWidth / 2)
            var xPoints = new Array(x - i, x, x + i, x);
            var yPoints = new Array(y, y - i, y, y + i);
            jg.fillPolygon(xPoints, yPoints);
            jg.setStroke(1);
            jg.setColor('black');
            jg.drawPolygon(xPoints, yPoints);
            return;
         }
         if (obj.type == "connection") {
            for (var i = 0; i < obj.points.length; i++) {
               displayOutline(obj.points[i]);
            }
            var i = 3 + Math.ceil(obj.lineWidth / 2)
            drawPoint(obj.from.x + obj.from.docks[obj.dockFrom][0], obj.from.y + obj.from.docks[obj.dockFrom][1], i)
            drawPoint(obj.to.x + obj.to.docks[obj.dockTo][0], obj.to.y + obj.to.docks[obj.dockTo][1], i)
            jg.paint()
            return;
         }
         jg.setStroke(1);
         jg.setColor('black');
         if (obj == main_obj) jg.setColor('#00DD00');
         var pad = obj.padding
         var r = 6
         var d = backend != 'canvas' ? r/2-1 : r/2
         if (backend == 'canvas') jg.ctx.strokeStyle = '#303030'
         jg.drawRect(obj.x - pad, obj.y - pad, obj.width + pad * 2, obj.height + pad * 2)
         jg.setColor('#00DD00')
         jg.fillRect(obj.x - (pad + d), obj.y - (pad + d), r, r)
         jg.fillRect(obj.x + obj.width + (pad - d), obj.y - (pad + d), r, r)
         jg.fillRect(obj.x - (pad + d), obj.y + obj.height + (pad - d), r, r)
         jg.fillRect(obj.x + obj.width + (pad - d), obj.y + obj.height + (pad - d), 6, 6)
         if (transform) {
            for (var i = 0; i < obj.vNum; i++) {
               drawPoint(obj.xPoints[i], obj.yPoints[i], 4)
            }
         }
         jg.paint()
     }

     function drawPoint(x, y, i) {
        jg.setColor('#FFCC00');
        var xPoints = new Array(x - i, x, x + i, x);
        var yPoints = new Array(y, y - i, y, y + i);
        jg.fillPolygon(xPoints, yPoints);
        jg.setStroke(1);
        jg.setColor('black');
        jg.drawPolygon(xPoints, yPoints);
        return;
     }

     var pref_sizes = [[], [4, 12, 9], [4, 14, 10], [6, 15, 12], [8, 17, 12], [9, 18, 13], [10, 18, 13], [10, 18, 13], [10, 18, 13], [10, 18, 13]]

     function drawArrow(xTo, yTo, xFrom, yFrom, w) {
        var width = pref_sizes[w][0]
        var length = pref_sizes[w][1]
        var length2 = pref_sizes[w][2]
        //  a * (xTo - xFrom) + b * (yTo - yFrom) = 0
        var a, b;
        if (xTo - xFrom == 0) {
            b = 0;
            a = 3;
        } else if (yTo - yFrom == 0) {
            a = 0;
            b = 3;
        } else {
            b = 3;
            a = - (yTo - yFrom) / (xTo - xFrom) * b;
        }
        var r1 = Math.sqrt(a * a + b * b);
        a = a / r1 * length;
        b = b / r1 * length;
        if ((a * (yFrom - yTo) > 0) || (b * (xFrom - xTo) < 0)) {
            a = -a;
            b = -b;
        }
        var x = Math.round(xTo + b);
        var y = Math.round(yTo - a);


        var a1 = a / length * length2;
        var b1 = b / length * length2;

        var xCenter = Math.round(xTo + b1);
        var yCenter = Math.round(yTo - a1);


        a = -a / length * width;
        b = b / length * width;

        var xLeft = Math.round(x + a);
        var yLeft = Math.round(y - b);
        var xRight = Math.round(x - a);
        var yRight = Math.round(y + b);

        if (xLeft == xRight) {
           yLeft++
           yRight++
        }

        if (yLeft == yRight && w == 5) xLeft++


        var xPoints1 = [];
        var yPoints1 = [];

        var xPoints2 = [];
        var yPoints2 = [];

        xPoints1[0] = xTo;
        xPoints1[1] = xLeft;
        xPoints1[2] = xCenter;
        yPoints1[0] = yTo;
        yPoints1[1] = yLeft;
        yPoints1[2] = yCenter;

        xPoints2[0] = xTo;
        xPoints2[1] = xRight;
        xPoints2[2] = xCenter;
        yPoints2[0] = yTo;
        yPoints2[1] = yRight;
        yPoints2[2] = yCenter;
        if (w >= 5 && yLeft == yRight) {
           xPoints2[0]++
           xPoints2[2]++
        }
        jg.fillPolygon(xPoints1, yPoints1);
        jg.fillPolygon(xPoints2, yPoints2);

     }

     function correct(xFrom, yFrom, xTo, yTo, width, type, len) {
        if (xTo - xFrom == 0) {
           b = 0;
           a = 3;
        } else if (yTo - yFrom == 0) {
           a = 0;
           b = 3;
        } else {
           b = 3;
           a = - (yTo - yFrom) / (xTo - xFrom) * b;
        }
        var r1 = Math.sqrt(a * a + b * b);
        a = a / r1 * pref_sizes[width][1] / 2;
        b = b / r1 * pref_sizes[width][1] / 2;

        if ((a * (yFrom - yTo) > 0) || (b * (xFrom - xTo) < 0)) {
           a = -a;
           b = -b;
        }
        if (type == 1 || type == 3) {
           xTo = Math.round(xTo + b);
           yTo = Math.round(yTo - a);
        }
        if ((type == 2 || type == 3) && len == 0) {
           xFrom = Math.round(xFrom - b);
           yFrom = Math.round(yFrom + a);
        }
        if (xTo == xFrom) {
           if (width >= 6) {
              xFrom -= 3
              xTo -= 3
           } else if (width >= 3) {
              xFrom -= 1
              xTo -= 1
           }
        }
        if (a * b > 0) {
           if (width >= 5) {
              yTo = yTo - 3
           }
           if (width == 3 || width == 4) {
              yTo = yTo - 2
           }
           if (width == 2) {
              yTo = yTo - 1
           }
        }
        return [xFrom, yFrom, xTo, yTo]
     }

     function updateCursor(event) {
         if (selected_objects.length == 0 || dragging) return;

         for (var i = 0; i < selected_objects.length; i++) {
            if (!selected_objects[i]) continue;
            var obj = selected_objects[i]
            e = event || window.event
            coords = getCoords(e)
            var x = coords[0]
            var y = coords[1]
            var pad = obj.padding
            if (x >= obj.x - (pad + 4) && x <= obj.x - (pad - 2) && y >= obj.y - (pad + 4) && y <= obj.y - (pad - 2)) {
               document.getElementById(div_id).style.cursor = 'nw-resize'
               drag_offsetX = x - (obj.x - (pad + 1))
               drag_offsetY = y - (obj.y - (pad + 1))
               selected_obj = obj
               return;
            }
            if (x >= obj.x + obj.width + (pad - 2) && x <= obj.x + obj.width + (pad + 4) && y >= obj.y - (pad + 4) && y <= obj.y - (pad - 2)) {
               document.getElementById(div_id).style.cursor = 'ne-resize'
               drag_offsetX = x - (obj.x + obj.width + (pad + 1))
               drag_offsetY = y - (obj.y - (pad + 1))
               selected_obj = obj
               return;
            }
            if (x >= obj.x - (pad + 4) && x <= obj.x - (pad - 2) && y >= obj.y + obj.height + (pad - 2) && y <= obj.y + obj.height + (pad + 4)) {
               document.getElementById(div_id).style.cursor = 'sw-resize'
               drag_offsetX = x - (obj.x - (pad + 1))
               drag_offsetY = y - (obj.y + obj.height + (pad + 1))
               selected_obj = obj
               return;
            }
            if (x >= obj.x + obj.width + (pad - 2) && x <= obj.x + obj.width + (pad + 4) && y >= obj.y + obj.height + (pad - 2) && y <= obj.y + obj.height + (pad + 4)) {
               document.getElementById(div_id).style.cursor = 'se-resize'
               drag_offsetX = x - (obj.x + obj.width + (pad + 1))
               drag_offsetY = y - (obj.y + obj.height + (pad + 1))
               selected_obj = obj
               return;
            }
         }
         document.getElementById(div_id).style.cursor = 'default'
     }

     function resizeObject(event) {
         if (!selected_obj || !dragging) return;

         var obj = selected_obj
         e = event || window.event
         coords = getCoords(e)
         var x = coords[0]
         var y = coords[1]
         var pad = selected_obj.padding + 1
         var flag = false
         var cur = document.getElementById(div_id).style.cursor
         if (cur == 'nw-resize') {
            if (e.shiftKey) {
               var new_width = obj.x + obj.width - x - (pad - drag_offsetX)
               var new_height = obj.y + obj.height - y - (pad - drag_offsetY)
               if (obj.width >= min_size || x < obj.x - (pad - drag_offsetX)) {
                   if (new_width < new_height) {
                     obj.width = new_width
                     obj.x = x + pad - drag_offsetX

                     obj.y = obj.y + obj.height - obj.width
                     obj.height = obj.width
                  }
               }
               if (obj.height >= min_size || y < obj.y - (pad - drag_offsetY)) {
                  if (new_width > new_height) {
                     obj.height = new_height
                     obj.y = y + pad - drag_offsetY

                     obj.x = obj.x + obj.width - obj.height
                     obj.width = obj.height
                  }
               }
               flag = true
            } else {
               if (obj.width >= min_size || x < obj.x - (pad - drag_offsetX)) {
                  obj.width = obj.x + obj.width - x - (pad - drag_offsetX)
                  obj.x = x + pad - drag_offsetX
               }
               if (obj.height >= min_size || y < obj.y - (pad - drag_offsetY)) {
                  obj.height = obj.y + obj.height - y - (pad - drag_offsetY)
                  obj.y = y + pad - drag_offsetY
               }
               flag = true
            }
         }
         if (cur == 'sw-resize') {
            var new_width = obj.x + obj.width - x - (pad - drag_offsetX)
            var new_height = y - obj.y - (pad + drag_offsetY)
            if (e.shiftKey) {
               if (obj.width >= min_size || x < obj.x - (pad - drag_offsetX)) {
                   if (new_width < new_height) {
                     obj.width = new_width
                     obj.x = x + pad - drag_offsetX

                     obj.height = obj.width
                  }
               }
               if (obj.height >= min_size || y >= obj.y + obj.height + (pad + drag_offsetY)) {
                  if (new_width > new_height) {
                     obj.height = new_height

                     obj.x = obj.x + obj.width - obj.height
                     obj.width = obj.height
                  }
               }
               flag = true
            } else {
               if (obj.width >= min_size || x < obj.x - (pad - drag_offsetX)) {
                  obj.width = obj.x + obj.width - x - (pad - drag_offsetX)
                  obj.x = x + pad - drag_offsetX
               }
               if (obj.height >= min_size || y >= obj.y + obj.height + (pad + drag_offsetY)) {
                  obj.height = y - obj.y - (pad + drag_offsetY)
               }
               flag = true
            }
         }
         if (cur == 'ne-resize') {
            if (e.shiftKey) {
               var new_width = x - obj.x - (pad - drag_offsetX)
               var new_height = obj.y + obj.height - y - (pad - drag_offsetY)
               if (obj.width >= min_size || x >= obj.x + obj.width + (pad + drag_offsetX)) {
                   if (new_width < new_height) {
                     obj.width = new_width

                     obj.y = obj.y + obj.height - obj.width
                     obj.height = obj.width
                  }
               }
               if (obj.height >= min_size || y < obj.y - (pad - drag_offsetY)) {
                  if (new_width > new_height) {
                     obj.height = obj.y + obj.height - y - (pad - drag_offsetY)
                     obj.y = y + pad - drag_offsetY

                     obj.width = obj.height
                  }
               }
               flag = true
            } else {
               if (obj.width >= min_size || x >= obj.x + obj.width + (pad + drag_offsetX)) {
                  obj.width = x - obj.x - (pad - drag_offsetX)
               }
               if (obj.height >= min_size || y < obj.y - (pad - drag_offsetY)) {
                  obj.height = obj.y + obj.height - y - (pad - drag_offsetY)
                  obj.y = y + pad - drag_offsetY
               }
               flag = true
            }
         }
         if (cur == 'se-resize') {
            if (e.shiftKey) {
               var new_width = x - obj.x - pad + drag_offsetX
               var new_height = y - obj.y - (pad + drag_offsetY)
               if (obj.width >= min_size || x >= obj.x + obj.width + (pad + drag_offsetX)) {
                  if (new_width < new_height) {
                     obj.width = new_width
                     obj.height = obj.width
                  }
               }
               if (obj.height >= min_size || y >= obj.y + obj.height + (pad + drag_offsetY)) {
                  if (new_width > new_height) {
                     obj.height = new_height
                     obj.width = obj.height
                  }
               }
               flag = true
            } else {
               if (obj.width >= min_size || x >= obj.x + obj.width + (pad + drag_offsetX)) {
                  obj.width = x - obj.x - pad + drag_offsetX
               }
               if (obj.height >= min_size || y >= obj.y + obj.height + (pad + drag_offsetY)) {
                  obj.height = y - obj.y - (pad + drag_offsetY)
               }
               flag = true
            }
         }

         if (!flag) return;

         try {
            updatePalettes()
            debounce(updateHistory, 600)
         } catch(ex) {}
         calculatePoints(obj)
         if (backend == 'canvas' && object_always_on_top_while_dragging) {
            repaintSelectedObjects()
         } else {
            repaint()
         }
     }
     
     function debounce(f, timeout) {
        if (debounce_timer) {
           clearTimeout(debounce_timer)
           debounce_timer = null
        }
        debounce_timer = setTimeout(function() {
           f()
           debounce_timer = null
        }, timeout)
     }
     
     var debounce_timer = null
     
     var f = function() {
        if (debounce_timer) {
           clearTimeout(debounce_timer)
           debounce_timer = null
           updateHistory()
        }
     }
     
     if (document.addEventListener) {
        document.addEventListener('mouseup', f)
        document.addEventListener('keyup', f)
     } else {
        document.attachEvent('onmouseup', f)
        document.attachEvent('onkeyup', f)
     }

     function initResize() {
         var cur = document.getElementById(div_id).style.cursor
         if (selected_obj && cur != 'default' && cur != '') {
             dragging = true
         }
     }

     function changeX(value) {
         if (selected_objects.length > 0 && /[0-9]{1,3}/.test(value)) {
            for (var i = 0; i < selected_objects.length; i++) {
               if (!selected_objects[i]) continue;
               selected_objects[i].x = parseInt(value)
               calculatePoints(selected_objects[i])
            }
            repaint()
         }
     }

     function changeY(value) {
         if (selected_objects.length > 0 && /[0-9]{1,3}/.test(value)) {
            for (var i = 0; i < selected_objects.length; i++) {
               if (!selected_objects[i]) continue;
               selected_objects[i].y = parseInt(value)
               calculatePoints(selected_objects[i])
            }
            repaint()
         }
     }

     function changeWidth(value) {
         if (selected_objects.length > 0 && /[0-9]{1,3}/.test(value)) {
            for (var i = 0; i < selected_objects.length; i++) {
               if (!selected_objects[i]) continue;
               selected_objects[i].width = parseInt(value)
               calculatePoints(selected_objects[i])
            }
            repaint()
         }
     }

     function changeHeight(value) {
         if (selected_objects.length > 0 && /[0-9]{1,3}/.test(value)) {
            for (var i = 0; i < selected_objects.length; i++) {
               if (!selected_objects[i]) continue;
               selected_objects[i].height = parseInt(value)
               calculatePoints(selected_objects[i])
            }
            repaint()
         }
     }

     function rotate(angle, degrees) {
         if (selected_objects.length > 0 && /[0-9]+/.test(angle)) {
             for (var j = 0; j < selected_objects.length; j++) {
                if (!selected_objects[j]) continue;
                var obj = selected_objects[j]
                if (obj.type != 'circle' && obj.type != 'text') {
                   equalize(obj)
                }

                if (obj.type == 'text') {
                    if (selected_objects.length == 1) obj.angle = angle
                    else obj.angle += angle
                    var rad = (angle / 360) * 2 * Math.PI
                    /*
                    if (angle != 0) {
                        var t = Math.sin(rad) * Math.sin(rad) - Math.cos(rad) * Math.cos(rad)
                        var realWidth = (obj.height * Math.sin(rad) - obj.width * Math.cos(rad)) / t
                        var realHeight = (obj.height * Math.cos(rad) - obj.width * Math.sin(rad)) / -t
                        obj.width = realWidth
                        obj.height = realHeight
                    }
                    var height = Math.round(obj.height * Math.cos(rad) + obj.width * Math.sin(rad))
                    var width = Math.round(obj.width * Math.cos(rad) + obj.height * Math.sin(rad))
                    obj.height = height
                    obj.width = width
                    */

                    /*
                    var t = Math.sqrt(obj.width * obj.width + obj.height * obj.height) / 2
                    var a = Math.acos(obj.width * 0.5 / t) - rad
                    obj.width = t * Math.cos(a) * 2
                    a = Math.acos(obj.height * 0.5 / t) - rad
                    obj.height = t * Math.cos(a) * 2
                    */
                    obj.padding = 12 + (obj.width / 2 - 4) * Math.sin(rad)
                } else {
                    if (selected_objects.length == 1) obj.angle = degrees ? (angle / 360) * 2 * Math.PI : angle
                    else obj.angle += degrees ? (angle / 360) * 2 * Math.PI : angle
                    calculatePoints(obj)
                }

             }
             repaint()
         }
     }

     function alignObjects(method) {
         if (!main_obj) return;

         for (var i = 0; i < selected_objects.length; i++) {
            if (selected_objects[i] && selected_objects[i] != main_obj) {
               switch(method) {
                  case 'l':
                     selected_objects[i].x = main_obj.x;
                     break;
                  case 'c':
                     selected_objects[i].x = Math.round(main_obj.x + main_obj.width / 2 - selected_objects[i].width / 2);
                     break;
                  case 'r':
                     selected_objects[i].x = main_obj.x + main_obj.width - selected_objects[i].width;
                     break;
                  case 't':
                     selected_objects[i].y = main_obj.y;
                     break;
                  case 'm':
                     selected_objects[i].y = Math.round(main_obj.y + main_obj.height / 2 - selected_objects[i].height / 2);
                     break;
                  case 'b':
                     selected_objects[i].y = main_obj.y + main_obj.height - selected_objects[i].height;
                     break;
               }
            }
         }
         repaint();
     }

     function copyObjects(x, y) {
         xCopy = x
         yCopy = y
         for (var i = 0; i < selected_objects.length; i++) {
             if (selected_objects[i]) {
                 objectsToCopy.push(selected_objects[i])
                 objectsToCopy.sort(_sortFunc)
             }
         }
     }

     function pasteObjects(x, y) {

         selected_objects = []

         if (objectsToCopy.length == 0) return

         if (xCopy == null && yCopy == null || x == undefined || y == undefined) {
             var left = objectsToCopy[0].x
             var top = objectsToCopy[0].y
             var right = objectsToCopy[0].x + objectsToCopy[0].width
             var bottom = objectsToCopy[0].y + objectsToCopy[0].height
             for (var i = 0; i < objectsToCopy.length; i++) {
                if (objectsToCopy[i].x < left) {
                   left = objectsToCopy[i].x
                }
                if (objectsToCopy[i].y < top) {
                   top = objectsToCopy[i].y
                }
                if (objectsToCopy[i].x + objectsToCopy[i].width > right) {
                   right = objectsToCopy[i].x + objectsToCopy[i].width
                }
                if (objectsToCopy[i].y + objectsToCopy[i].height > bottom) {
                   bottom = objectsToCopy[i].y + objectsToCopy[i].height
                }
             }
             if (bottom - top > right - left) {
                var x2 = right + 30
                var y2 = top + 30
             } else {
                var x2 = left + 30
                var y2 = bottom + 30
             }
         }

         for (var i = 0; i < objectsToCopy.length; i++) {
             var el = objectsToCopy[i]
             if (xCopy && yCopy && x != undefined && y != undefined) {
                temp = new Shape(el.type, el.color, x - (xCopy - el.x), y - (yCopy - el.y), el.width, el.height)
             } else {
                temp = new Shape(el.type, el.color, x2 + el.x - left, y2 + el.y - top, el.width, el.height)
             }
             temp.id = getNewObjectId()
             copyProperties(el, temp)   //Copy properties
             working_area.push(temp)
             selected_objects.push(temp)
             calculatePoints(temp)
         }

         var length = connections.length
         for (var i = 0; i < length; i++) {
            var found1 = false, found2 = false
            var from, to
            if (connections[i] == null) continue;
            for (var j = 0; j < objectsToCopy.length; j++) {
               if (connections[i].from == objectsToCopy[j]) {
                  from = j
                  found1 = true;
               }
               if (connections[i].to == objectsToCopy[j]) {
                  to = j
                  found2 = true;
               }
               if (found1 && found2) break;
            }
            if (found1 && found2) {
               connections.push(new Connection(selected_objects[from], selected_objects[to], connections[i].dockFrom, connections[i].dockTo, clonePointsArray(connections[i].points), connections[i].lineWidth, connections[i].lineColor, connections[i].arrType))
               for (var j = 0; j < connections[connections.length-1].points.length; j++) {
                  connections[connections.length-1].points[j].connection = connections[connections.length-1]
               }
            }
         }

         if (selected_objects.length == 2) findConnection()

         selected_obj = temp
         temp = null

         if (xCopy == null && yCopy == null) {
            objectsToCopy = []
            for (var i = 0; i < selected_objects.length; i++) {
               objectsToCopy.push(selected_objects[i])
            }
         }

         repaint()
     }

     function equalize(obj) {
         var xC = obj.x + obj.width / 2
         var yC = obj.y + obj.height / 2

         obj.width = obj.height = (obj.width > obj.height) ? obj.width : obj.height

         for (var i = 0; i < obj.vNum; i++) {
            var r = Math.sqrt((obj.xPoints[i] - xC) * (obj.xPoints[i] - xC) +
                              (yC - obj.yPoints[i]) * (yC - obj.yPoints[i]))
            obj.rs[i] = r / obj.width
            obj.deltas[i] = Math.acos((obj.xPoints[i] - xC) / r)
            if (yC - obj.yPoints[i] < 0) {
               obj.deltas[i] *= -1
               obj.deltas[i] += 2 * Math.PI
            }
            obj.deltas[i] -= obj.angle
         }
     }

     function changeColor(color) {
         if (selected_objects.length > 0 && /#[0-9A-F]{6}/.test(color)) {
            for (var i = 0; i < selected_objects.length; i++) {
               if (selected_objects[i]) selected_objects[i].color = color
            }
            repaint()
         }
     }

     function repaint() {
         jg.clear()
         drawWorkingArea()
         drawProtos()
         for (var i = 0; i < selected_objects.length; i++) {
            if (selected_objects[i]) displayOutline(selected_objects[i])
         }
     }
     
     function repaintSelectedObjects() {
         jg.clearBottomLayer()
         drawProtos()
         var pad = 8
         for (var i = 0; i < selected_objects.length; i++) {
            if (selected_objects[i]) {
              var obj = selected_objects[i]
              obj.el.style.left = obj.x - pad + 'px'
              obj.el.style.top =  obj.y - pad + 'px'
              var old_width = parseInt(obj.el.style.width)
              var old_height = parseInt(obj.el.style.height)
              if (obj.width != old_width || obj.height != old_height) {
                 obj.el.style.width = selected_objects[i].width + pad * 2 + 'px'
                 obj.el.style.height = selected_objects[i].height + pad * 2 + 'px'
                 if (!obj.el) prepareCanvas(obj)
                 else {
                     var dpi = 2
                     obj.el.children[0].style.width = obj.width + 'px'
                     obj.el.children[0].style.height = obj.height + 'px'
                     obj.el.children[0].width = obj.width * dpi
                     obj.el.children[0].height = obj.height * dpi
                 }
                 obj.draw()
              }
              displayOutline(selected_objects[i])
            }
         }
     }

     function selectObject(event) {

         var cur = document.getElementById(div_id).style.cursor
         if (cur != 'default' && cur != '') {
             return;
         }


         e = event || window.event
         if (!e.which && e.button) {
            if (e.button & 1) e.which = 1
            else if (e.button & 4) e.which = 2
            else if (e.button & 2) e.which = 3
         }

         coords = getCoords(e)
         var x = coords[0]
         var y = coords[1]
         
         var obj = getProtoByCoords(e)
         existing = false
         if (obj == null) {       //If not a prototype
             obj = getObjectByCoords(e)
             existing = true
         }
         if (obj == null) {       //If not an object
             obj = getPoint(e)
             if (obj) {
                cur_point = obj
                if (e.ctrlKey) removePoint(obj)
                return
             }
         }

         if (e.which != 1) return;
         
         var ignore_group = false
         var group_toggle = -1
         
         // Check group
         if (!transform && groups.length && obj && obj instanceof Shape) {
            ignore_group = e.shiftKey && e.ctrlKey
            if (!ignore_group) {
               for (var i = 0; i < groups.length; i++) {
                  if (groups[i].indexOf(obj) != -1) {
                     var count = 0
                     for (var j = 0; j < groups[i].length; j++) {
                        if (selected_objects.indexOf(groups[i][j]) != -1) {
                           count++
                        }
                     }
                     if (count == groups[i].length && e.ctrlKey) group_toggle = 1
                     else if (count == 0) group_toggle = 0
                     
                     for (var j = 0; j < groups[i].length; j++) {
                        if (group_toggle == 0 && selected_objects.indexOf(groups[i][j]) == -1) {
                           selected_objects.push(groups[i][j])
                        } else if (group_toggle == 1) {
                           for (var k = 0; k < selected_objects.length; k++) {
                              if (selected_objects[k] == groups[i][j]) {
                                 selected_objects.splice(k, 1)
                                 break
                              }
                           }
                        }
                     }
                     if (!selected_objects.length && group_toggle == 1) obj = null
                  } else if (!e.ctrlKey) {
                     for (var j = 0; j < groups[i].length; j++) {
                        for (var k = 0; k < selected_objects.length; k++) {
                           if (selected_objects[k] == groups[i][j]) {
                              selected_objects.splice(k, 1)
                              break
                           }
                        }
                     }
                  }
               }
            } else {
               for (var i = 0; i < groups.length; i++) {
                  if (groups[i].indexOf(obj) != -1) {
                     var count = 0
                     for (var j = 0; j < groups[i].length; j++) {
                        if (selected_objects.indexOf(groups[i][j]) != -1) {
                           count++
                        }
                     }
                     
                     for (var j = 0; j < groups[i].length; j++) {
                        if (count < groups[i].length && selected_objects.indexOf(groups[i][j]) == -1) {
                           selected_objects.push(groups[i][j])
                        } else if (count == groups[i].length && groups[i][j] != obj) {
                           for (var k = 0; k < selected_objects.length; k++) {
                              if (selected_objects[k] == groups[i][j]) {
                                 selected_objects.splice(k, 1)
                                 break
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
         
         
         // Select underlying object
         if (!transform && e.shiftKey && e.ctrlKey && !ignore_group) {
            var obj2 = getObjectByCoords(e, true)
            if (obj2) {
               selected_objects.push(obj2)
               jg.clearBottomLayer()
               drawProtos()
               for (var i = 0; i < selected_objects.length; i++) {
                  displayOutline(selected_objects[i])
               }
               return
            }
         }
         
         if (!transform && selected_objects.length == 1 && !e.shiftKey && !e.ctrlKey && selected_obj && selected_obj.x <= x - 6 && x <= selected_obj.x + selected_obj.width + 7 &&
             selected_obj.y <= y - 6 && y <= selected_obj.y + selected_obj.height + 7) {
            dragging = true
            existing = true
            main_obj = null
            temp = selected_obj
            drag_offsetX = x - selected_obj.x
            drag_offsetY = y - selected_obj.y
            temp.x = obj.x
            temp.y = obj.y
            return;
         }

         objectsToCopy = []
         xCopy = null
         yCopy = null
         
         
         if (editText && obj != selected_obj) {
             selected_obj.text = document.getElementById('textBox').value
             editText = false
             repaint()
             document.getElementById('textBox').style.display = 'none'
             return;
         }
         
         setTimeout(clearSelection, 200)

         cur_dock_obj = getDockPointObj(x,y)
         var p = cur_dock_obj
         if (p) {
             if (p == current_connection.to) {
                p.docks[p.docks.length-1][0] = p.docks[current_connection.dockTo][0]
                p.docks[p.docks.length-1][1] = p.docks[current_connection.dockTo][1]
                current_connection.dockTo = p.docks.length - 1
             } else if (p == current_connection.from) {
                p.docks[p.docks.length-1][0] = p.docks[current_connection.dockFrom][0]
                p.docks[p.docks.length-1][1] = p.docks[current_connection.dockFrom][1]
                current_connection.dockFrom = p.docks.length - 1
             }
             return
         }
         if (obj != null && transform) {
            cur_vertex = getVertex(x,y)
            if (e.ctrlKey && cur_vertex == -1) createVertex(e)
            if (e.ctrlKey && cur_vertex != -1) removeVertex(cur_vertex)
            if (e.ctrlKey || cur_vertex != -1) return
         }

         if (obj != null) {
             dragging = true
             current_connection = null
             if (!existing) {
                 selected_obj = null
                 selected_objects = []
                 temp = new Shape(obj.type, obj.color, obj.x, obj.y, obj.width, obj.height)
             } else if (e.shiftKey && !e.ctrlKey) {    // Copy selected objects

                 if (selected_objects.length == 0 && obj != null && obj instanceof Shape) {
                    selected_objects.push(obj)
                 }

                 selected_objects.sort(_sortFunc)

                 var new_array = []
                 var count = 0
                 
                 var map = {}

                 for (var i = 0; i < selected_objects.length; i++) {
                    if (selected_objects[i]) {
                       count++
                       var el = selected_objects[i]
                       temp = new Shape(el.type, el.color, el.x, el.y, el.width, el.height)
                       temp.id = getNewObjectId()
                       copyProperties(el, temp)   //Copy properties
                       new_array.push(temp)
                       working_area.push(temp)
                       calculatePoints(temp)
                       map[el.id] = temp
                    }
                 }
                 
                 for (var i = 0; i < groups.length; i++) {
                    var c = 0
                    for (var j = 0; j < selected_objects.length; j++) {
                       if (groups[i].indexOf(selected_objects[j]) != -1) {
                          c++
                       }
                    }
                    if (c == groups[i].length) {
                       var group = []
                       for (var j = 0; j < groups[i].length; j++) {
                          group.push(map[groups[i][j].id])
                       }
                       groups.push(group)
                    }
                 }

                 var length = connections.length
                 for (var i = 0; i < length; i++) {
                    var found1 = false, found2 = false
                    var from, to
                    if (connections[i] == null) continue;
                    var n = -1
                    for (var j = 0; j < selected_objects.length; j++) {
                       if (selected_objects[j]) n++;
                       if (connections[i].from == selected_objects[j]) {
                          from = n
                          found1 = true;
                          break;
                       }
                    }
                    n = -1
                    for (var j = 0; j < selected_objects.length; j++) {
                       if (selected_objects[j]) n++;
                       if (connections[i].to == selected_objects[j]) {
                          to = n
                          found2 = true;
                          break;
                       }
                    }
                    if (connections[i] && found1 && found2) {
                       connections.push(new Connection(new_array[from], new_array[to], connections[i].dockFrom, connections[i].dockTo, clonePointsArray(connections[i].points), connections[i].lineWidth, connections[i].lineColor, connections[i].arrType))
                       for (var j = 0; j < connections[connections.length-1].points.length; j++) {
                          connections[connections.length-1].points[j].connection = connections[connections.length-1]
                       }
                    }
                 }

                 selected_obj = temp
                 selected_objects = new_array
                 if (selected_objects.length == 2) {
                     findConnection()
                 }
                 if (count > 1) {
                    lastX = x
                    lastY = y
                    temp = null
                    //return;
                 }

             } else if (e.ctrlKey && group_toggle == -1 && !ignore_group) {  //Select/unselect object   
                 //Select/unselect object
                 
                 transform = false
                 var deepest_obj = getDeepestSelectedObjectByCoords(e)
                 if (deepest_obj) {
                    for (var i = 0; i < groups.length; i++) {
                       if (groups[i].indexOf(deepest_obj) != -1) {
                          break
                       }
                    }
                    for (var i = 0; i < selected_objects.length; i++) {
                       if (selected_objects[i] == deepest_obj) {
                          selected_objects.splice(i, 1)
                          for (var j = i - 1; j >= 0; j--) {
                             if (selected_objects[j]) {
                                selected_obj = selected_objects[j]
                                break;
                             }
                          }
                          if (!selected_obj && selected_objects.length >= j) {
                             selected_obj = selected_objects[j]
                          }
                          break
                       }
                    }
                    jg.clearBottomLayer()
                    drawProtos()
                    for (var i = 0; i < selected_objects.length; i++) {
                       displayOutline(selected_objects[i])
                    }
                    return
                 }
                 for (var i = 0; i < selected_objects.length; i++) {
                    if (selected_objects[i] == obj) {
                       selected_objects[i] = null
                       selected_obj = null
                       for (var j = selected_objects.length - 1; j >= 0; j--) {
                          if (selected_objects[j]) {
                             selected_obj = selected_objects[j]
                             break;
                          }
                       }
                       //if (!selected_obj) main_obj = null
                       var count = 0

                       for (var i = 0; i < selected_objects.length; i++) {
                          if (selected_objects[i]) count++
                       }

                       repaint()
                       return;
                    }
                    if (selected_objects[i] == main_obj) main_obj = null
                 }
                 selected_objects.push(obj)
                 selected_obj = obj

                 if (selected_objects.length == 2) {
                     findConnection()
                 }

                 repaint()
                 try {
                    updatePalettes()
                 } catch (ex) {}
                 return;
             } else {

                 var contains = false

                 for (var i = 0; i < selected_objects.length; i++) {
                    if (selected_objects[i] == obj) contains = true
                 }

                 if (group_toggle < 1 && existing && !contains) {
                    selected_objects = []
                    selected_obj = obj
                    selected_objects.push(obj)
                 }

                 var count = 0

                 for (var i = 0; i < selected_objects.length; i++) {
                    if (selected_objects[i]) count++
                 }

                 if (count == 2) {
                     findConnection()
                 }

                 if (count > 1) {
                    lastX = x
                    lastY = y
                    selected_obj = obj
                    temp = null
                    repaint()
                    return;
                 }

                 main_obj = null

                 temp = obj
             }

             drag_offsetX = x - obj.x
             drag_offsetY = y - obj.y

             if (!existing) {            //Compute a light tint of current color
                 new_color = temp.color
                 temp.color = highlight(temp.color)
             }

             if (!existing) {          //Calculate coordinates of the new object
                 temp.x = x - drag_offsetX
                 temp.y = y - drag_offsetY
             } else if (temp) {
                 temp.x = obj.x
                 temp.y = obj.y
             }

             if (!existing) {     //Set properties and assign a drawing function
                 copyProperties(obj, temp)
                 if (obj.type == 'text') {
                    temp.width = 84
                    temp.height = 18
                 } else {
                    temp.width = 40
                    temp.height = 40
                 }
                 if (obj.type != 'circle') calculatePoints(temp)
                 temp.draw()
             }

             repaint()
         } else if ((cur == 'default' || cur == '') && !(current_connection && e.ctrlKey)) {   //Click on free space
             selected_obj = null
             selected_objects = []
             transform = false
             current_connection = null
             main_obj = null
             temp = null
             repaint()
         }
     }

     function moveObject(event) {
         var cur = document.getElementById(div_id).style.cursor
         if (cur != 'default' && cur != '' || editText || cur_dock_obj || cur_vertex > -1) {
             return;
         }

         e = event || window.event
         coords = getCoords(e)
         var x = coords[0]
         var y = coords[1]

         if (!dragging) return;


         var count = 0

         for (var i = 0; i < selected_objects.length; i++) {
            if (selected_objects[i]) count++
         }

         if (count > 1 && existing) {
            for (var i = 0; i < selected_objects.length; i++) {
               if (!selected_objects[i]) continue;
               selected_objects[i].x = selected_objects[i].x + x - lastX
               selected_objects[i].y = selected_objects[i].y + y - lastY
            }
            lastX = x
            lastY = y
         } else if (temp) {
            temp.x = x - drag_offsetX
            temp.y = y - drag_offsetY
         }


         if (backend == 'canvas' && object_always_on_top_while_dragging) {
            repaintSelectedObjects()
         } else {
            repaint()
         }
         debounce(updateHistory, 600)

         if (current_connection) displayOutline(current_connection)
         if (!existing) {
            temp.draw()
         } else {
            try {
                updatePalettes()
            } catch (ex) {}
         }

     }

     function dropTempObject(event) {

         if (temp == null) {
             dragging = false;
             drag_offsetX = drag_offsetY = 10;
             return;
         }


         e = event || window.event
         coords = getCoords(e)
         var x = coords[0]
         var y = coords[1]

         if (!dragging) return;
         if (!e.ctrlKey) {
            selected_objects = []
            selected_objects.push(temp)
         }


         temp.x = x - drag_offsetX
         temp.y = y - drag_offsetY


         if (!existing) {
             calculatePoints(temp)
             working_area.push(temp)
             temp.color = new_color
             temp.id = getNewObjectId()
         }
         existing = true

         repaint()
         updateHistory()

         temp = null
         dragging = false
         drag_offsetX = drag_offsetY = 10;
     }
     
     function getNewObjectId() {
        var id = 0
        for (var i = 0; i < working_area.length; i++) {
           if (working_area[i].id > id) id = working_area[i].id
        }
        return id + 1
     }

     function moveDock(event) {
         if (!cur_dock_obj) return;
         e = event || window.event
         coords = getCoords(e)
         var x = coords[0]
         var y = coords[1]
         for (var i = 0; i < cur_dock_obj.docks.length - 1; i++) {
             var d = cur_dock_obj.docks[i]
             if ((Math.abs(x - cur_dock_obj.x - d[0]) < 8) && (Math.abs(y - cur_dock_obj.y - d[1]) < 8)) {
                 cur_dock_obj.docks[cur_dock_obj.docks.length-1][0] = d[0]
                 cur_dock_obj.docks[cur_dock_obj.docks.length-1][1] = d[1]
                 if (cur_dock_obj == current_connection.to) {
                     current_connection.dockTo = i
                 } else if (cur_dock_obj == current_connection.from) {
                     current_connection.dockFrom = i
                 }
                 last_good = new Array(current_connection.dockFrom, current_connection.dockTo)
                 repaint()
                 displayOutline(current_connection)
                 return;
             }
         }
         if (cur_dock_obj == current_connection.to) {
             current_connection.dockTo = current_connection.to.docks.length - 1
         } else if (cur_dock_obj == current_connection.from) {
             current_connection.dockFrom = current_connection.from.docks.length - 1
         }
         cur_dock_obj.docks[cur_dock_obj.docks.length-1][0] = x - cur_dock_obj.x
         cur_dock_obj.docks[cur_dock_obj.docks.length-1][1] = y - cur_dock_obj.y
         repaint()
         displayOutline(current_connection)
     }

     function setDock() {
         if (!cur_dock_obj) return;
         cur_dock_obj.docks[cur_dock_obj.docks.length-1][0] = -1
         cur_dock_obj.docks[cur_dock_obj.docks.length-1][1] = -1
         current_connection.dockFrom = last_good[0]
         current_connection.dockTo = last_good[1]
         cur_dock_obj = null
         repaint()
         updateHistory()
     }

     function createDockPoint(event) {
         if (!current_connection) return;
         e = event || window.event
         if (!e.ctrlKey) return;
         var obj = getObjectByCoords(event)
         if (obj) return;
         var coords = getCoords(event)
         var p = new Point(coords[0] - current_connection.from.x, coords[1] - current_connection.from.y, current_connection)
         current_connection.points.push(p)
         var i = current_connection.points.length - 1
         var dp = p.x * p.x + p.y * p.y
         while (i > 0) {
            i--;
            var x = current_connection.points[i].x
            var y = current_connection.points[i].y
            var d = x * x + y * y
            if (d > dp) current_connection.points[i+1] = current_connection.points[i];
            else break;
         }
         current_connection.points[i] = p
         repaint()
         updateHistory()
     }

     function movePoint(event) {
         if (!cur_point || !current_connection) return;
         e = event || window.event
         coords = getCoords(e)
         var x = coords[0]
         var y = coords[1]
         cur_point.x = x - current_connection.from.x
         cur_point.y = y - current_connection.from.y
         repaint()
     }

     function dropPoint() {
         if (!cur_point || !current_connection) return;
         cur_point = null
         repaint()
         updateHistory()
     }

     function removePoint(point) {
         var temp = []
         for (var i = 0; i < current_connection.points.length; i++) {
            if (current_connection.points[i] != point) temp.push(current_connection.points[i])
         }
         current_connection.points = temp
         repaint()
         updateHistory()
     }

     function getPoint(event) {
         if (!current_connection) return null;
         e = event || window.event
         coords = getCoords(e)
         x = coords[0]
         y = coords[1]
         for (var i = 0; i < current_connection.points.length; i++) {
             if ((Math.abs(x - (current_connection.from.x + current_connection.points[i].x)) < 5) && (Math.abs(y - (current_connection.from.y + current_connection.points[i].y)) < 5)) {
                 return current_connection.points[i]
             }
         }
         return null;
     }

     function openTextBox() {
         var tb = document.getElementById('textBox')
         tb.style.display = 'block'
         tb.style.position = 'absolute'
         tb.style.top = (parseInt(document.getElementById(div_id).style.top) + selected_obj.y - 8) + 'px'
         tb.style.left = (parseInt(document.getElementById(div_id).style.left) + selected_obj.x - 8) + 'px'
         tb.style.zIndex = 4
         tb.style.width = (selected_obj.width + 20) + 'px'
         tb.style.height = (selected_obj.height + 20) + 'px'
         tb.value = selected_obj.text
         tb.style.fontFamily = selected_obj.font
         //tb.style.color = selected_obj.color
         tb.style.textAlign = 'center'
         tb.select()
         editText = true
     }

     function setTextAlign(value) {
        if (selected_obj == null || selected_obj.type != "text") return;
        selected_obj.align = value
        repaint()
        updateHistory()
     }

     function calculatePoints(obj) {
         if (obj.type == 'rectangle' || obj.type == 'triangle' || obj.type == 'polygon') {

             var xC = obj.x + obj.width / 2
             var yC = obj.y + obj.height / 2

             for (var i = 0; i < obj.vNum; i++) {
                 obj.xPoints[i] = Math.round(xC + Math.cos(obj.deltas[i] + obj.angle) * obj.rs[i] * obj.width)
                 obj.yPoints[i] = Math.round(yC - Math.sin(obj.deltas[i] + obj.angle) * obj.rs[i] * obj.height)
             }

             for (var i = 0; i < obj.vNum; i++) {
                 obj.offsetsX[i] = obj.xPoints[i] - obj.x
                 obj.offsetsY[i] = obj.yPoints[i] - obj.y
             }

             obj.docks = []
             for (var i = 0; i < obj.vNum; i++) {
                 if (i < obj.vNum - 1) {
                    var x = Math.round((obj.xPoints[i] + obj.xPoints[i+1]) / 2 - obj.x)
                    var y = Math.round((obj.yPoints[i] + obj.yPoints[i+1]) / 2 - obj.y)
                 } else {
                    var x = Math.round((obj.xPoints[i] + obj.xPoints[0]) / 2 - obj.x)
                    var y = Math.round((obj.yPoints[i] + obj.yPoints[0]) / 2 - obj.y)
                 }
                 obj.docks.push(new Array(obj.offsetsX[i], obj.offsetsY[i]))
                 obj.docks.push(new Array(x, y))
             }
         }
         if (obj.type == 'circle') {
             obj.docks = []
             obj.docks.push(new Array(obj.width / 2, obj.height / 2))
             var l = Math.PI * (obj.width + obj.height)
             var angle = 0
             var d = 2 * Math.PI / (l / 15)
             for (var i = 0; i < l / 15; i++) {
                 obj.docks.push(new Array(obj.width / 2 * (1 + Math.cos(angle)), obj.height / 2 * (1 - Math.sin(angle))))
                 angle += d
             }
         }
         if (obj.type == 'text') {
             obj.docks = []
             obj.docks.push(new Array(0, 0))
             obj.docks.push(new Array(obj.width / 2, -obj.padding))
             obj.docks.push(new Array(obj.width, -obj.paddin))
             obj.docks.push(new Array(obj.width + obj.padding, obj.height / 2))
             obj.docks.push(new Array(obj.width + obj.padding, obj.height + obj.padding))
             obj.docks.push(new Array(obj.width / 2, obj.height + obj.padding))
             obj.docks.push(new Array(-obj.padding, obj.height + obj.padding))
             obj.docks.push(new Array(-obj.padding, obj.height / 2))
         }
         obj.docks.push(new Array(-1, -1))
     }

     function calculatePoints2(obj) {
         if (obj.type == 'rectangle' || obj.type == 'triangle' || obj.type == 'polygon') {

             var xC = obj.x + obj.width / 2
             var yC = obj.y + obj.height / 2

             obj.angle = 0

             for (var i = 0; i < obj.vNum; i++) {
                 var size = (obj.width > obj.height) ? obj.width : obj.height
                 var t =  (yC - obj.yPoints[i]) / (obj.xPoints[i] - xC)
                 obj.deltas[i] = Math.atan(t)
                 if (obj.xPoints[i] < xC) obj.deltas[i] += Math.PI
                 if (obj.xPoints[i] > xC && obj.yPoints[i] > yC) obj.deltas[i] += 2 * Math.PI
                 obj.rs[i] = Math.sqrt((obj.xPoints[i] - xC) * (obj.xPoints[i] - xC) + (obj.yPoints[i] - yC) * (obj.yPoints[i] - yC)) / size
             }


             obj.docks = []
             for (var i = 0; i < obj.vNum; i++) {
                 if (i < obj.vNum - 1) {
                    var x = Math.round((obj.xPoints[i] + obj.xPoints[i+1]) / 2 - obj.x)
                    var y = Math.round((obj.yPoints[i] + obj.yPoints[i+1]) / 2 - obj.y)
                 } else {
                    var x = Math.round((obj.xPoints[i] + obj.xPoints[0]) / 2 - obj.x)
                    var y = Math.round((obj.yPoints[i] + obj.yPoints[0]) / 2 - obj.y)
                 }
                 obj.docks.push(new Array(obj.offsetsX[i], obj.offsetsY[i]))
                 obj.docks.push(new Array(x,y))
             }
             obj.docks.push(new Array(-1, -1))
         }
     }

     function removeObject(obj) {
         for (var i = 0; i < working_area.length; i++) {
            if (working_area[i] == obj) {
               working_area.splice(i, 1)
            }
         }
         for (var i = 0; i < selected_objects.length; i++) {
            if (selected_objects[i] == obj) {
               selected_objects.splice(i, 1)
            }
         }
         selected_obj = null
         for (var i = selected_objects.length - 1; i >= 0; i--) {
            if (selected_objects[i]) {
               selected_obj = selected_objects[i]
               break;
            }
         }
         for (var i = 0; i < connections.length; i++) {
            if (connections[i]) {
               if (connections[i].from == obj || connections[i].to == obj) {
                  if (connections[i] == current_connection) {
                     current_connection = null
                  }
                  connections.splice(i, 1)
               }
            }
         }
         transform = false
         repaint()
         updateHistory()
     }

     function bringToFront(obj) {
         var id = getObjectId(obj);
         working_area[working_area.length] = obj;
         working_area.splice(id, 1);
         repaint();
         updateHistory()
     }

     function sendToBack(obj) {
         var id = getObjectId(obj);
         for (var i = id; i > 0; i--) {
             working_area[i] = working_area[i-1];
         }
         working_area[0] = obj;
         repaint();
         updateHistory()
     }

     function getObjectId(obj) {
         for (var i = 0; i < working_area.length; i++) {
             if (!working_area[i]) continue;
             if (working_area[i] === obj) return i;
         }
         return -1;
     }

     function getObjectByCoords(event, skip_selected) {
         e = event || window.event
         coords = getCoords(e)
         x = coords[0]
         y = coords[1]
         for (var i = working_area.length - 1; i >= 0; i--) {
             if (!working_area[i]) continue;
             if (working_area[i].x - 6 <= x && x <= working_area[i].x + working_area[i].width + 7 &&
                 working_area[i].y - 6 <= y && y <= working_area[i].y + working_area[i].height + 7) {
                 if (skip_selected && selected_objects.indexOf(working_area[i]) != -1) continue
                 return working_area[i];
             }
         }
         return null;
     }
     
     function getDeepestSelectedObjectByCoords(event) {
         e = event || window.event
         coords = getCoords(e)
         x = coords[0]
         y = coords[1]
         for (var i = 0; i < working_area.length; i++) {
             if (!working_area[i]) continue;
             if (working_area[i].x - 6 <= x && x <= working_area[i].x + working_area[i].width + 7 &&
                 working_area[i].y - 6 <= y && y <= working_area[i].y + working_area[i].height + 7) {
                 if (selected_objects.indexOf(working_area[i]) == -1) continue
                 return working_area[i];
             }
         }
         return null;
     }

     function getProtoByCoords(event) {
         e = event || window.event
         coords = getCoords(e)
         x = coords[0]
         y = coords[1]
         for (var i = 0; i < protos.length; i++) {
             if (protos[i].x <= x && x <= protos[i].x + protos[i].width &&
                 protos[i].y <= y && y <= protos[i].y + protos[i].height) {
                 return protos[i];
             }
         }
         return null;
     }

     function getCoords(e){
        e = e || window.event

        var x = e.clientX - parseInt(document.getElementById(div_id).style.left)
        var y = e.clientY - parseInt(document.getElementById(div_id).style.top)

        return [x, y]
     }

     function getObjectByCoordsArray(coords) {
         x = coords[0]
         y = coords[1]
         for (var i = working_area.length - 1; i >= 0; i--) {
             if (!working_area[i]) continue;
             if (working_area[i].x <= x - 6 && x <= working_area[i].x + working_area[i].width + 7 &&
                 working_area[i].y <= y - 6 && y <= working_area[i].y + working_area[i].height + 7) {
                 return working_area[i];
             }
         }
         return null;
     }

     var div_id

     var textId = 0

     var protos = []

     var working_area = []

     var connections = []

     var temp

     var new_color

     var dragging = false

     var drag_offsetX = 10

     var drag_offsetY = 10

     var existing

     var copy

     var current_connection

     var cur_dock_obj

     var cur_point

     var last_good

     var selected_obj

     var selected_objects = []

     var objectsToCopy = []

     var main_obj

     var min_size = 12

     var lastX

     var lastY

     var xCopy

     var yCopy

     var editText = false

     var transform = false

     var cur_vertex = -1


     function addProto(type, color, x, y, width, height) {
         if (type.toLowerCase() == 'circle') {
            protos.push(new Circle(color, x, y, width, height));
         }
         if (type.toLowerCase() == 'triangle') {
            protos.push(new Triangle(color, x, y, width, height));
         }
         if (type.toLowerCase() == 'rectangle') {
            protos.push(new Rectangle(color, x, y, width, height));
         }
         if (type.toLowerCase() == 'text') {
            protos.push(new TextObject(color, x, y, width, height));
         }
     }

     function drawProtos() {
         for (var i = 0; i < protos.length; i++) {
             protos[i].draw()
         }
     }

     function drawWorkingArea() {

         for (var i = 0; i < connections.length; i++) {
             if (connections[i]) {
                connections[i].draw()
             }
         }

         for (var i = 0; i < working_area.length; i++) {
             if (working_area[i]) {
                working_area[i].draw()
             }
         }

         if (current_connection) displayOutline(current_connection)
     }

     function copyProperties(from, to) {

         to.width = from.width
         to.height = from.height
         to.angle = from.angle
         to.vNum = from.vNum
         to.padding = from.padding
         to.borderWidth = from.borderWidth
         to.borderColor = from.borderColor

         if (from.type == 'circle') {
             assignDrawingMethod(to)
         }
         if (from.type == 'triangle') {
             for (var i = 0; i < from.xPoints.length; i++) {
                 to.deltas[i] = from.deltas[i];
                 to.rs[i] = from.rs[i];
                 to.offsetsX[i] = from.offsetsX[i]
                 to.offsetsY[i] = from.offsetsY[i]
             }
             assignDrawingMethod(to)
         }
         if (from.type == 'rectangle') {
             for (var i = 0; i < from.xPoints.length; i++) {
                 to.deltas[i] = from.deltas[i];
                 to.rs[i] = from.rs[i];
                 to.offsetsX[i] = from.offsetsX[i]
                 to.offsetsY[i] = from.offsetsY[i]
             }
             assignDrawingMethod(to)
         }
         if (from.type == 'text') {
             to.font = from.font
             to.fontSize = from.fontSize
             to.fontWeight = from.fontWeight
             to.fontStyle = from.fontStyle
             to.underline = from.underline
             to.align = from.align
             to.angle = from.angle
             to.text = from.text
             if (!to.text) {
                 textId++
                 to.text = "TextObject" + textId
             }
             assignDrawingMethod(to)
         }
     }
     
     function prepareCanvas(obj) {
         var pad = 8
         if (backend == 'canvas' && (!obj.el || !obj.el.parentNode)) {
             obj.el = document.createElement('div')
            
             var width = obj.width + pad * 2
             var height = obj.height + pad * 2
            
             if (obj.type != 'connection') {
                 obj.el.style.width = width + 'px'
                 obj.el.style.height = height + 'px'
                 obj.el.style.position = 'absolute'
                 obj.el.style.left = obj.x - pad + 'px'
                 obj.el.style.top = obj.y - pad + 'px'
             } else {
                 var left = obj.from.x + obj.from.docks[obj.dockFrom][0] - pad
                 var top = obj.from.y + obj.from.docks[obj.dockFrom][1] - pad
                 obj.el.style.left = left + 'px'
                 obj.el.style.top = top + 'px'
                 obj.el.style.width = obj.to.x + obj.to.docks[obj.dockTo][0] + pad - left + 'px'
                 obj.el.style.height = obj.to.y + obj.to.docks[obj.dockTo][1] + pad - top + 'px'
             }
            
             var canvas = document.createElement('canvas')
             obj.el.appendChild(canvas)
             document.getElementById('objects').appendChild(obj.el)
            
             var dpi = 2
             
             canvas.style.width = width + 'px'
             canvas.style.height = height + 'px'
             canvas.width = Math.ceil(width * dpi)
             canvas.height = Math.ceil(height * dpi)
             
             return canvas
         }
     }

     function assignDrawingMethod(obj) {
         var pad = 8
         var canvas = null
         
         switch(obj.type) {
             case "circle":
                
                obj.draw = function() {
                   if (backend == 'canvas') canvas = prepareCanvas(obj)
                   jg.setColor(this.color, canvas)
                   var x = canvas ? pad : this.x
                   var y = canvas ? pad : this.y
                   jg.fillEllipse(x, y, this.width, this.height, canvas);
                   if (this.borderWidth > 0) {
                       jg.setColor(this.borderColor, canvas);
                       jg.setStroke(this.borderWidth, canvas);
                       jg.drawEllipse(x, y, this.width, this.height, canvas);
                   }
                   jg.paint()
                }
                break;
             case "rectangle":
             case "triangle":
             case "polygon":
                obj.draw = function() {
                   if (backend == 'canvas') canvas = prepareCanvas(obj)
                   for (var i = 0; i < this.vNum; i++) {
                       this.xPoints[i] = this.x + this.offsetsX[i]
                       this.yPoints[i] = this.y + this.offsetsY[i]
                   }
                   var points = [this.xPoints.slice(), this.yPoints.slice()]
                   if (backend == 'canvas') {
                      for (var i = 0; i < this.vNum; i++) {
                         points[0][i] = this.offsetsX[i] + pad
                         points[1][i] = this.offsetsY[i] + pad
                      }
                   }
                   jg.setColor(this.color, canvas)
                   jg.fillPolygon(points[0], points[1], canvas);
                   if (this.borderWidth > 0) {
                       jg.setColor(this.borderColor, canvas);
                       jg.setStroke(this.borderWidth, canvas);
                       jg.drawPolygon(points[0], points[1], canvas);
                   }
                   jg.paint()
                }
                break;
             case "text":
                obj.draw = function() {
                   if (backend == 'canvas') canvas = prepareCanvas(obj)
                   jg.setColor(this.color, canvas)
                   jg.setFont(this.font, this.fontSize, Font.PLAIN)
                   var textDecoration = this.underline ? 'underline' : 'none'
                   jg.drawStringRect(this.text, this.x, this.y, this.width, this.height, this.align, this.borderWidth, this.fontWeight, this.fontStyle, textDecoration, this.angle, this.color)
                   if (this.borderWidth > 0) {
                       jg.setColor(this.borderColor, canvas);
                       jg.setStroke(this.borderWidth, canvas);
                       var x = canvas ? 0 : this.x
                       var y = canvas ? 0 : this.y
                       this.xPoints = new Array(x - 2, x + this.width + 3 - this.borderWidth, x + this.width + 3 - this.borderWidth, x - 2);
                       this.yPoints = new Array(y - 2, y - 2, y + this.height + 3 - this.borderWidth, y + this.height + 3 - this.borderWidth);
                       jg.drawPolygon(this.xPoints, this.yPoints, canvas);
                   }
                   jg.paint()
                }
                break;
             case "connection":
                obj.draw = function() {
                   if (backend == 'canvas') canvas = prepareCanvas(obj)
                   jg.setColor(this.lineColor, canvas)
                   jg.setStroke(this.lineWidth, canvas)
                   
                   var x = this.from.x + this.from.docks[this.dockFrom][0]
                   var y = this.from.y + this.from.docks[this.dockFrom][1]
                   var xTo = this.to.x + this.to.docks[this.dockTo][0]
                   var yTo = this.to.y + this.to.docks[this.dockTo][1]
                   
                   var x0 = x
                   var y0 = y
                   
                   if (backend == 'canvas') {
                      xTo = xTo - x + pad
                      yTo = yTo - y + pad
                      x = pad
                      y = pad
                   }

                   for (var i = 0; i < this.points.length; i++) {
                      if (i == 0 && this.arrType > 1) {
                         var c = correct(this.from.x + this.points[i].x, this.from.y + this.points[i].y, x, y, this.lineWidth, this.points.length)
                         if (backend == 'canvas') {
                            for (var j = 0; j < c.length; j++) {
                               c[j] -= j % 2 == 0 ? x0 : y0
                            }
                         }
                         x2 = c[0]; y2 = c[1]; xTo2 = c[2]; yTo2 = c[3]

                         jg.drawLine(x2, y2, xTo2, yTo2, canvas)
                         var xa = this.from.x + this.points[i].x
                         var ya = this.from.y + this.points[i].y
                         if (backend == 'canvas') {
                            x3 = xa - x0 + pad
                            y3 = ya - y0 + pad
                         }
                         drawArrow(x, y, x3, y3, this.lineWidth, canvas)
                      } else {
                         jg.drawLine(x, y, x3, y3, canvas)
                      }

                      x = this.from.x + this.points[i].x
                      y = this.from.y + this.points[i].y
                      
                      if (backend == 'canvas') {
                         x = x - x0 + pad
                         y = y - y0 + pad
                      }
                   }

                   var xTo2 = xTo
                   var yTo2 = yTo

                   var x2 = x
                   var y2 = y

                   if (this.arrType > 0) {
                      var c = correct(x, y, xTo, yTo, this.lineWidth, this.arrType, this.points.length)
                      x2 = c[0]; y2 = c[1]; xTo2 = c[2]; yTo2 = c[3]
                      jg.drawLine(x2, y2, xTo2, yTo2, canvas)
                      if (this.arrType != 2) {
                         drawArrow(xTo, yTo, x, y, this.lineWidth, canvas)
                      }
                      if (this.points.length == 0 && this.arrType > 1) {
                         drawArrow(x, y, xTo, yTo, this.lineWidth, canvas)
                      }
                   } else {
                      jg.drawLine(x, y, xTo, yTo, canvas)
                   }
                   jg.paint()
                }
                break;
         }
     }

     function resetObject(obj, vNum) {
        obj.vNum = vNum

        obj.xPoints = []
        obj.yPoints = []
        obj.offsetsX = []
        obj.offsetsY = []
        obj.rs[i] = []
        obj.deltas[i] = []

        if (obj.width < obj.height) obj.height = obj.width; else obj.width = obj.height
        var r = 0.5
        obj.width = Math.round(obj.width * 1.2)
        obj.height = Math.round(obj.height * 1.2)
        var a = (vNum % 2 == 1) ? Math.PI / 2 : Math.PI / vNum
        for (var i = 0; i < vNum; i++) {
           obj.rs[i] = r
           obj.deltas[i] = a
           a += 2 * Math.PI / vNum
        }
        calculatePoints(obj)
        repaint()
        updateHistory()
     }

     function getVertex(x, y) {
        if (!transform) return null;

        for (var i = 0; i < selected_obj.vNum; i++) {
           if ((Math.abs(x - selected_obj.xPoints[i]) < 5) && (Math.abs(y - selected_obj.yPoints[i]) < 5)) {
              return i
           }
        }
        return -1;
     }

     function moveVertex(event) {
        if (cur_vertex == -1) return
        e = event || window.event
        coords = getCoords(e)
        x = coords[0]
        y = coords[1]

        selected_obj.offsetsX[cur_vertex] = x - selected_obj.x
        selected_obj.offsetsY[cur_vertex] = y - selected_obj.y

        if (selected_obj.offsetsX[cur_vertex] < 0) selected_obj.offsetsX[cur_vertex] = 0
        if (selected_obj.offsetsX[cur_vertex] > selected_obj.width) selected_obj.offsetsX[cur_vertex] = selected_obj.width
        if (selected_obj.offsetsY[cur_vertex] < 0) selected_obj.offsetsY[cur_vertex] = 0
        if (selected_obj.offsetsY[cur_vertex] > selected_obj.height) selected_obj.offsetsY[cur_vertex] = selected_obj.height

        repaint()
        debounce(updateHistory, 600)
     }

     function dropVertex() {
        if (cur_vertex == -1) return
        calculatePoints2(selected_obj)
        calculatePoints(selected_obj)
        cur_vertex = -1
        repaint()
     }

     function createVertex(event) {
        if (!transform) return
        e = event || window.event
        coords = getCoords(e)
        var x = coords[0]
        var y = coords[1]

        var obj = selected_obj

        obj.offsetsX.push(0)
        obj.offsetsY.push(0)
        obj.xPoints.push(0)
        obj.yPoints.push(0)
        obj.rs.push(0)
        obj.deltas.push(0)
        obj.vNum++

        cur_vertex = obj.offsetsX.length - 1


        obj.offsetsX[cur_vertex] = x - obj.x
        obj.offsetsY[cur_vertex] = y - obj.y

        obj.xPoints[cur_vertex] = x
        obj.yPoints[cur_vertex] = y

        if (obj.offsetsX[cur_vertex] < 0) obj.offsetsX[cur_vertex] = 0
        if (obj.offsetsX[cur_vertex] > obj.width) obj.offsetsX[cur_vertex] = obj.width
        if (obj.offsetsY[cur_vertex] < 0) obj.offsetsY[cur_vertex] = 0
        if (obj.offsetsY[cur_vertex] > obj.height) obj.offsetsY[cur_vertex] = obj.height

        var xC = obj.x + obj.width / 2
        var yC = obj.y + obj.height / 2

        var size = (obj.width > obj.height) ? obj.width : obj.height
        var t = (yC - obj.yPoints[cur_vertex]) / (obj.xPoints[cur_vertex] - xC)
        obj.deltas[cur_vertex] = Math.atan(t)
        if (obj.xPoints[cur_vertex] < xC) obj.deltas[cur_vertex] += Math.PI
        if (obj.xPoints[cur_vertex] > xC && obj.yPoints[cur_vertex] > yC) obj.deltas[cur_vertex] += 2 * Math.PI
        obj.rs[cur_vertex] = Math.sqrt((obj.xPoints[cur_vertex] - xC) * (obj.xPoints[cur_vertex] - xC) + (obj.yPoints[cur_vertex] - yC) * (obj.yPoints[cur_vertex] - yC)) / size
        var angle = obj.deltas[cur_vertex]
        var r = obj.rs[cur_vertex]
        for (var i = obj.deltas.length - 1; i >= 0; i--) {
           if (i > 0 && angle < obj.deltas[i-1]) {
              obj.deltas[i] = obj.deltas[i-1]
              obj.rs[i] = obj.rs[i-1]
           } else {
              obj.deltas[i] = angle
              obj.rs[i] = r
              break;
           }
        }
        calculatePoints(obj)
        cur_vertex = -1
        repaint()
        updateHistory()
     }

     function removeVertex(n) {
        if (!transform) return

        var obj = selected_obj

        var a1 = [], a2 = [], a3 = [], a4 = [], a5 = [], a6 = []

        for (i = 0; i < selected_obj.vNum; i++) {
           if (i != n) {
              a1.push(selected_obj.offsetsX[i])
              a2.push(selected_obj.offsetsY[i])
              a3.push(selected_obj.xPoints[i])
              a4.push(selected_obj.yPoints[i])
              a5.push(selected_obj.rs[i])
              a6.push(selected_obj.deltas[i])
           }
        }
        selected_obj.offsetsX = a1
        selected_obj.offsetsY = a2
        selected_obj.xPoints = a3
        selected_obj.yPoints = a4
        selected_obj.rs = a5
        selected_obj.deltas = a6
        obj.vNum--

        repaint()
        updateHistory()
     }

     function findConnection() {
        var obj1, obj2
        for (var i = 0; i < selected_objects.length; i++) {
           if (selected_objects[i]) {
              if (!obj1) obj1 = selected_objects[i];
              else if (!obj2) obj2 = selected_objects[i];
              else break;
           }
        }
        current_connection = null
        for (var i = 0; i < connections.length; i++) {
           if (connections[i]) {
              if (connections[i].from == obj1 && connections[i].to == obj2 ||
                  connections[i].to == obj1 && connections[i].from == obj2) {
                  current_connection = connections[i];
                  displayOutline(connections[i])
                  break;
              }
           }
        }
     }

     function getDockPointObj(x, y) {
         if (!current_connection) return false;
         for (var i = 0; i < current_connection.from.docks.length - 1; i++) {
             if ((Math.abs(x - (current_connection.from.x + current_connection.from.docks[i][0])) < 5) && (Math.abs(y - (current_connection.from.y + current_connection.from.docks[i][1])) < 5)) {
                 return current_connection.from
             }
         }
         for (var i = 0; i < current_connection.to.docks.length - 1; i++) {
             if ((Math.abs(x - (current_connection.to.x + current_connection.to.docks[i][0])) < 5) && (Math.abs(y - (current_connection.to.y + current_connection.to.docks[i][1])) < 5)) {
                 return current_connection.to
             }
         }
         return false
     }

     function clonePointsArray(array) {
         var new_array = []
         for (var i = 0; i < array.length; i++) {
            new_array.push(new Point(array[i].x, array[i].y, null))
         }
         return new_array
     }

     function addConnection() {
        var obj1, obj2
        for (var i = 0; i < selected_objects.length; i++) {
           if (selected_objects[i]) {
              if (!obj1) obj1 = selected_objects[i];
              else if (!obj2) obj2 = selected_objects[i];
              else break;
           }
        }
        current_connection = new Connection(obj1, obj2);
        connections.push(current_connection);
        repaint();
        displayOutline(current_connection)
     }

     function removeConnection() {
        for (var i = 0; i < connections.length; i++) {
           if (current_connection == connections[i]) {
              connections[i] = null;
              current_connection = null;
              repaint();
              return;
           }
        }
     }

     function getConnectionsSafeCopy() {
        var result = []
        for (var i = 0; i < connections.length; i++) {
           if (connections[i]) result.push(connections[i])
        }
        for (var i = 0; i < result.length; i++) {
           if (result[i].points.length > 0) {
              for (var j = 0; j < result[i].points.length; j++) {
                 result[i].points[j].connection = null
              }
           }
        }
        return result
     }

     function equals(obj1, obj2) {
        if (obj1.type != obj2.type || obj1.vNum != obj2.vNum) return false
        if (obj1.x != obj2.x || obj1.y != obj2.y) return false
        if (obj1.width != obj2.width || obj1.height != obj2.height) return false
        if (obj1.angle != obj2.angle || obj1.color != obj2.color) return false
        if (obj1.borderWidth != obj2.borderWidth || obj1.borderColor != obj2.borderColor) return false
        for (var i = 0; i < obj1.vNum; i++) {
           if (obj1.offsetsX[i] != obj2.offsetsX[i] || obj1.offsetsY[i] != obj2.offsetsY[i]) {
              return false
           }
        }
        return true
     }

     function _sortFunc(obj1, obj2) {
         var a = -1
         var b = -1
         for (var i = 0; i < working_area.length; i++) {
             if (working_area[i]) {
                if (working_area[i] == obj1) a = i
                if (working_area[i] == obj2) b = i
                if (a >= 0 && b >= 0) break
             }
         }
         return a-b
     }
     
     function updateHistory() {
        if (state_history.length && JSON.stringify(working_area) ==
            state_history[state_history.length-1].working_area) {
               return
        }
        var sel_object = -1
        var sel_objects = []
        for (var i = 0; i < working_area.length; i++) {
           if (selected_objects.indexOf(working_area[i]) != -1) {
              sel_objects.push(i)
           }
           if (selected_obj == working_area[i]) sel_object = i
        }
        state_history.splice(state_history.length - history_position, history_position)
        state_history.push({ working_area: JSON.stringify(working_area),
                             connections: JSON.stringify(connections),
                             selected_obj: sel_object,
                             selected_objects: sel_objects })
        history_position = 0
     }
     
     var history_position = 0
     
     function historyBackward() {
        history_position++
        if (history_position > state_history.length-1) {
           history_position = history.length-1
           return
        }
        setHistoryPoint()
     }
     
     function historyForward() {
        history_position--
        if (history_position < 0) {
           history_position = 0
           return
        }
        setHistoryPoint()
     }
     
     function setHistoryPoint() {
        working_area = JSON.parse(state_history[state_history.length - 1 - history_position].working_area)
        connections = JSON.parse(state_history[state_history.length - 1 - history_position].connections)
        selected_obj = working_area[state_history[state_history.length - 1 - history_position].selected_obj]
        selected_objects = []
        for (var i = 0; i < state_history[state_history.length - 1 - history_position].selected_objects.length; i++) {
           selected_objects.push(working_area[state_history[state_history.length - 1 - history_position].selected_objects[i]])
        }
        aux_import()
        repaint()
     }
     
     function aux_import() {
        for (var i = 0; i < working_area.length; i++) {
           assignDrawingMethod(working_area[i])
        }
        fixPositions()
        for (var i = 0; i < connections.length; i++) {
           assignDrawingMethod(connections[i])
           for (var j = 0; j < working_area.length; j++) {
              if (equals(connections[i].from, working_area[j])) {
                 connections[i].from = working_area[j]
                 continue
              }
              if (equals(connections[i].to, working_area[j])) {
                 connections[i].to = working_area[j]
                 continue
              }
           }
           for (var j = 0; j < connections[i].points.length; j++) {
               connections[i].points[j].connection = connections[i]
           }
        }
     }
     
     var state_history = []
     

     function hexToDec(n) {
         return Number(parseInt(n+'',16)).toString(10)
     }

     function decToHex(n) {
         return Number(parseInt(n+'',10)).toString(16)
     }

     function highlight(color) {
         var red = color.substring(1,3)
         var green = color.substring(3,5)
         var blue = color.substring(5,7)
         red = decToHex(255 - (255 - parseInt(hexToDec(red))) / 3)
         green = decToHex(255 - (255 - parseInt(hexToDec(green))) / 3)
         blue = decToHex(255 - (255 - parseInt(hexToDec(blue))) / 3)
         return '#' + red + green + blue
     }
     
     function clearSelection() {
        if(document.selection && document.selection.empty) {
           document.selection.empty();
        } else if(window.getSelection) {
           var sel = window.getSelection();
           sel.removeAllRanges();
        }
     }