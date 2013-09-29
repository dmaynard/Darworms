/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:05 AM
 * To change this template use File | Settings | File Templates.
 */
/* WPane

 an object containing grid a canvas a scale and an offset
 * can draw the grid points inside the canvas
 *
 *  grid is the game grid
 *  paneSize is the number of grid items to display w,h
 *  centerPoint  the x,y coordinates of the
 *  canvas
 *  scale ?
 *  margin ?
 *
 */
function WPane ( grid, size, center, canvas) {
    this.grid = grid;
    this.canvas = canvas;
    this.pWidth = canvas.width;
    this.pHeight = canvas.height;
    this.savedCanvas = null;
    this.canvasIsDirty = true;
    this.focus = center;
    this.ctx = canvas.getContext("2d");
    this.cWidth = size.x;
    this.cHeight =  size.y;
    this.pMargin  = 10;
    this.scale = new Point((this.pWidth - (2*this.pMargin))/(this.cWidth === 1 ? this.cWidth : this.cWidth+0.5),
        (this.pHeight- (2*this.pMargin))/(this.cHeight === 1 ? this.cHeight :this.cHeight+0.5));
    this.offset = new Point(center.x - (this.cWidth >> 1), center.y - (this.cHeight >>1));
    this.offset.wrap(this.grid.width, this.grid.height);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.scale.x, this.scale.y);
}
WPane.prototype.clear = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle =  "rgba(222,222,222, 1.0)";
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.pWidth, this.pHeight);
    this.ctx.closePath();
    this.ctx.fill();
}
WPane.prototype.setCenter = function ( center, size ) {
    // sets the scale, screen offset, and
    // centers the focused point on the canvas
    // should be called whenever the focus point changes
    // or the user zooms in or out.
    // console.log( " WPane.prototype.setCenter  center: "   + center.format() + " zoomSize: "  + size.format() );
    // If we are changing scale we have to invalidate the cached background image
    if ( size.x != this.cWidth || size.y != this.cHeight) {
        this.savedCtx = null;
    };
    // console.log( "     WPane.prototype.setCenter  offset: "   + this.offset.format()  );
    this.cWidth = size.x;
    this.cHeight = size.y;

    this.scale = new Point((this.pWidth - (2*this.pMargin))/(this.cWidth === 1 ? this.cWidth : this.cWidth+0.5),
        (this.pHeight- (2*this.pMargin))/(this.cHeight === 1 ? this.cHeight :this.cHeight+0.5));
    this.offset = new Point(center.x - Math.floor(this.cWidth /2), center.y - Math.floor(this.cHeight /2));
    this.offset.wrap(this.grid.width, this.grid.height);
    // console.log( "         WPane.prototype.setCenter  offset after wroa : "   + this.offset.format()  );

};
WPane.prototype.setSize = function ( size ) {
    // sets the scale, screen offset, and

    // console.log( " WPane.prototype.setCenter  center: "   + center.format() + " zoomSize: "  + size.format() );
    // If we are changing scale we have to invalidate the cached background image
    if ( size.x != this.cWidth || size.y != this.cHeight) {
        this.savedCtx = null;
    };
    console.log( "     WPane.prototype.setSize  size: "   + size.format()  );
    this.cWidth = size.x;
    this.cHeight = size.y;

    this.scale = new Point((this.pWidth - (2*this.pMargin))/(this.cWidth === 1 ? this.cWidth : this.cWidth+0.5),
        (this.pHeight- (2*this.pMargin))/(this.cHeight === 1 ? this.cHeight :this.cHeight+0.5));
    console.log( "     WPane.prototype.setSize  scale.x: "   + this.scale.x  );
};
WPane.prototype.drawCells = function () {
    this.clear();
    var gPos = new Point(this.offset.x,this.offset.y);
    if (this.canvasIsDirty) {
        for (var col = 0; col < this.cWidth ; col = col + 1) {
            for (var row = 0; row < this.cHeight ; row = row + 1) {
                /* at this pane coordinate draw that grid cell content  */
                this.drawCell(new Point(col,row), gPos);
                gPos.y = gPos.y + 1;
                if (gPos.y >= this.grid.height ) {gPos.y = 0;}
            }
            gPos.y = this.offset.y;
            gPos.x = gPos.x + 1;
            if (gPos.x >= this.grid.width ) {gPos.x = 0;}
        }
        this.savedCanvas = document.createElement('canvas');

        this.savedCanvas.width = canvas.width;
        this.savedCanvas.height = canvas.height;
        this.savedCtx = this.savedCanvas.getContext('2d');
        this.savedCtx.drawImage(this.canvas,0,0);
        this.canvasIsDirty = false;
        this.savedCtx.font = "bold 18px sans-serif";
        this.savedCtx.fillStyle = theGame.colorTable[0];
        this.savedCtx.shadowColor = "rgb(190, 190, 190)";
        this.savedCtx.shadowOffsetX = 3;
        this.savedCtx.shadowOffsetY = 3;
        this.savedCtx.fillText("-",this.savedCanvas.width/2, 10);
        this.savedCtx.fillText("+",this.savedCanvas.width/2, this.savedCanvas.height - 10);

    }  else { // use the saved canvas background for this size
        this.ctx.drawImage(this.savedCanvas,0,0);
    }
};
WPane.prototype.pSetTransform = function (point) {
    var xoff;
    var yoff;
    if (( (point.y+this.offset.y) & 1) === 0 || (this.cWidth == 1)) {
        xoff = (point.x + 0.5 ) * this.scale.x + this.pMargin;
    } else {
        xoff = (point.x + 1.0 )  * this.scale.x  + this.pMargin;

    }
    // because screnn is N+.5 cells wide and ony n cells hight
    // we need extra vertical margins
    yoff = (point.y + 0.5 ) * this.scale.y + this.pMargin + (this.scale.y/4.0);
    this.ctx.setTransform(this.scale.x,0,0,this.scale.y,xoff,yoff);
};
/* WPane.drawCell(wPoint, gPoint)
 *
 * in the pane at Position WPoint draw the cell for global grid pointer gPoint
 *
 */
WPane.prototype.drawCell = function( wPoint,  gPoint) {
    // console.log( " WPane.prototype.drawCell wPoint "   + wPoint.format() + "  gPoint "  + gPoint.format() );

    this.pSetTransform(wPoint);
    /*
     this.ctx.fillStyle =  "rgba(080,222,222,0.5)";

     this.ctx.beginPath();
     this.ctx.rect(-0.5, -0.5, 1.0, 1.0);
     this.ctx.closePath();
     this.ctx.fill();
     */
    var owner = this.grid.spokeAt( gPoint, 7);
    if (owner > 0 ) {
        this.ctx.strokeStyle = theGame.colorTable[owner & 0xF];
        this.ctx.lineWidth = 1.0/this.scale.x;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 0.2, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    } else {
        this.ctx.fillStyle = theGame.colorTable[this.grid.spokeAt(gPoint,6) & 0xF];
        this.ctx.lineWidth = 1.0/this.scale.x;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 0.1, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.fill();

    }
    var outvec = this.grid.outVectorsAt(gPoint);
    var invec = this.grid.inVectorsAt(gPoint);
    // console.log (" drawCell at" +  gPoint.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & darworms.outMask[i]) !== 0) {
            var outSpokeColor = theGame.colorTable[this.grid.spokeAt(gPoint, i)];
            // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + gPoint.format());
            this.ctx.strokeStyle  = outSpokeColor;
            this.ctx.lineWidth =   3.0/this.scale.x ;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(0,0);
            this.ctx.lineTo(darworms.graphics.xPts[i], darworms.graphics.yPts[i]);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        if ((invec & darworms.outMask[i]) !== 0) {
            var inSpokeColor = theGame.colorTable[this.grid.spokeAt(gPoint, i)];
            // console.log (" inSpokeColor " + i + " :  " + inSpokeColor + " at "  + gPoint.format());
            this.ctx.strokeStyle  = inSpokeColor;
            this.ctx.lineWidth = 3.0/this.scale.x;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(darworms.graphics.xPts[i], darworms.graphics.yPts[i]);
            this.ctx.lineTo(0,0);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }
};
/*  End of wPane */