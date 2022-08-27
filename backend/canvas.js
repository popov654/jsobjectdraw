function jsCanvas(id, wnd)
{
	this.setColor = new Function('arg', 'this.ctx.strokeStyle = arg.toLowerCase(); this.ctx.fillStyle = arg.toLowerCase();');
   this.setFontSize = new Function('arg', 'this.fontSize = parseInt(arg) + \'px\'; this.setFont()');
   this.setFont = new Function('arg', 'this.fontFamily = arg; this.updateFont()');
   
   this.canvas = document.createElement('canvas')
   this.ctx = this.canvas.getContext('2d')
   document.getElementById(id).appendChild(this.canvas)
   
   var dpi = 2
   
   var st = document.getElementById(id).currentStyle || getComputedStyle(document.getElementById(id), '')
   if (st.position == '' || st.position == 'static') document.getElementById(id).style.position = 'relative'
   this.canvas.style.position = 'absolute'
   this.canvas.style.left = '0'
   this.canvas.style.top = '0'
   this.canvas.style.width = '100%'
   this.canvas.style.height = '100%'
   this.canvas.style.margin = '0'
   this.canvas.width = this.canvas.clientWidth * dpi
   this.canvas.height = this.canvas.clientHeight * dpi
   
   var div = document.createElement('div')
   div.style.width = '100%'
   div.style.height = '100%'
   div.style.position = 'absolute'
   div.style.left = '0'
   div.style.top = '0'
   div.id = 'textObjects'
   this.canvas.parentNode.appendChild(div)

   this.setStroke = function(x)
   {
      this.ctx.lineWidth = x;
   };


   this.updateFont = function(fam, sz, sty)
   {
      this.ctx.font = this.fontSize + ' ' + this.fontFamily;
   };


   this.drawLine = function(x, y, x2, y2)
   {
      this.ctx.moveTo(x * dpi, y * dpi);
      this.ctx.lineTo(x2 * dpi, y2 * dpi);
      this.ctx.stroke();
   };


   this.drawPolyline = this.drawPolyLine = function(x, y, s)
   {
      this.ctx.moveTo(x[0] * dpi, y[0] * dpi)
      for (var i=1 ; i<x.length ; i++ )
         this.ctx.lineTo(x[i] * dpi, y[i] * dpi);
   };


   this.drawRect = function(x, y, w, h)
   {
      this.ctx.strokeRect(x * dpi, y * dpi, w * dpi, h * dpi);
   };


   this.fillRect = function(x, y, w, h)
   {
      this.ctx.fillRect(x * dpi, y * dpi, w * dpi, h * dpi);
   };


   this.drawEllipse = this.drawOval = function(x, y, w, h, rotation = 0)
   {
      this.ctx.beginPath();
      this.ctx.ellipse(x * dpi, y * dpi, w/2 * dpi, h/2 * dpi, rotation, 0, 2 * Math.PI);
      this.ctx.stroke();
   };


   this.fillEllipse = this.fillOval = function(left, top, w, h, rotation = 0, borderColor = 'transparent', borderWidth = 0)
   {
      this.ctx.beginPath();
      this.ctx.ellipse((left + w/2)  * dpi, (top + h/2) * dpi, w/2 * dpi, h/2 * dpi, rotation, 0, 2 * Math.PI);
      this.ctx.fill();
   };
   
   
   this.drawPolygon = function(x, y)
   {
      this.ctx.beginPath();
      this.ctx.moveTo(x[0] * dpi, y[0] * dpi)
      for (var i=1 ; i<x.length ; i++ )
         this.ctx.lineTo(x[i] * dpi, y[i] * dpi);
      this.ctx.closePath();
      this.ctx.stroke();
   };


   this.fillPolygon = function(x, y)
   {
      this.ctx.beginPath();
      this.ctx.moveTo(x[0] * dpi, y[0] * dpi)
      for (var i=1 ; i<x.length ; i++ )
         this.ctx.lineTo(x[i] * dpi, y[i] * dpi);
      this.ctx.closePath();
      this.ctx.fill();
	};


	this.drawString = function(text, x, y)
	{
		context.fillText(text, x, y);
	};
   
   this.paint = function() {}


/* drawStringRect() added by Rick Blommers.
Allows to specify the size of the text rectangle and to align the
text both horizontally (e.g. right) and vertically within that rectangle */
   this.drawStringRect = function(txt, x, y, width, height, halign, padding, fontWeight, fontStyle, textDecoration, angle)
   {
      var html = '<div class="textRect" style="position:absolute;overflow:hidden;word-wrap: break-word;'+
         'left:' + x + 'px;'+
         'top:' + y + 'px;'+
         'width:' + width + 'px;'+
         'height:' + height + 'px;'+
         'padding-top:'+ (padding > 0 ? (parseInt(padding) - 1) : 0) +'px;'+
         'padding-right:'+ (padding > 0 ? (parseInt(padding) + 2) : 0) +'px;'+
         'text-align:' + halign + ';'+
         'font-family:' +  this.fontFamily + ';'+
         'font-size:' + this.fontSize + ';'+
         'font-weight:' + fontWeight + ';'+
         'font-style:' + fontStyle + ';'+
         'text-decoration:' + textDecoration + ';';
      if (angle) {
         html += 'transform:rotate(-' + angle + 'deg);'+
                     '-ms-transform:rotate(-' + angle + 'deg);'+
                     '-moz-transform:rotate(-' + angle + 'deg);'+
                     '-o-transform:rotate(-' + angle + 'deg);'+
                     '-webkit-transform:rotate(-' + angle + 'deg);';
      }
      html +=
         'color:' + this.ctx.strokeStyle + ';">'+
         txt +
         '<\/div>';
      var el = document.createElement('div')
      document.getElementById('textObjects').appendChild(el)
      el.innerHTML = html
   };


   this.drawImage = function(imgSrc, x, y, w, h)
   {
      var img = new Image();
      img.onload = (function(ctx, x, y, w, h) {
         return function() {
            ctx.drawImage(this, x, y, w, h);
         }
      })(this.ctx, x, y, w, h);
      img.src = imgSrc;
   };


   this.clear = function()
   {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      document.getElementById('textObjects').innerHTML = '';
   };


   this.setStroke(1);
   this.setFont('verdana,geneva,helvetica,sans-serif', String.fromCharCode(0x31, 0x32, 0x70, 0x78), Font.PLAIN);
   this.setColor('#000000');

}