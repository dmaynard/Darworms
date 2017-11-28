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
    this.savedCanvas = document.createElement('canvas');
    this.savedCtx = this.savedCanvas.getContext('2d');
    this.savedCanvas.width = this.canvas.width;
    this.savedCanvas.height = this.canvas.height;



}
WPane.prototype.clear = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    // background for user selct direction screen
    this.ctx.fillStyle =  darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];

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
    // console.log( "         WPane.prototype.setCenter  offset after wrap : "   + this.offset.format()  );

};
WPane.prototype.setSize = function ( size ) {
    // sets the scale, screen offset, and

    // console.log( " WPane.prototype.setCenter  center: "   + center.format() + " zoomSize: "  + size.format() );
    // If we are changing scale we have to invalidate the cached background image
    //if ( size.x != this.cWidth || size.y != this.cHeight) {
    //    this.savedCtx = null;
    //};
    console.log( "     WPane.prototype.setSize  size: "   + size.format()  );
    this.cWidth = size.x;
    this.cHeight = size.y;

    this.scale = new Point((this.pWidth - (2*this.pMargin))/(this.cWidth === 1 ? this.cWidth : this.cWidth+0.5),
        (this.pHeight- (2*this.pMargin))/(this.cHeight === 1 ? this.cHeight :this.cHeight+0.5));
    // console.log( "     WPane.prototype.setSize  scale.x: "   + this.scale.x  + " yscale " + this.scale.x);
    // console.log(this.scale.format() );
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
        // TODO  this should is a backbuffer and should only be created once
        // or created every time the canvas changes size
        // it should not be created on every refresh of the selection screen
        this.savedCtx.drawImage(this.canvas,0,0);
        this.canvasIsDirty = false;
        this.savedCtx.font = "bold 18px sans-serif";
        this.savedCtx.fillStyle = darworms.dwsettings.colorTable[0];
        this.savedCtx.shadowColor = "rgb(190, 190, 190)";
        this.savedCtx.shadowOffsetX = 3;
        this.savedCtx.shadowOffsetY = 3;
        this.savedCtx.fillText("-",this.savedCanvas.width/2, 10);
        this.savedCtx.fillText("+",this.savedCanvas.width/2, this.savedCanvas.height - 10);

    }  else { // use the saved canvas background for this size

        // offset is wrong
        // this overwrites the previous image instead of being transparent
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
    // because screen is N+.5 cells wide and only N cells high
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
        this.ctx.fillStyle = darworms.dwsettings.alphaColorTable[owner & 0xF];
        this.ctx.beginPath();
        this.ctx.moveTo(darworms.graphics.vertex_x[0],darworms.graphics.vertex_y[0]);
        for (var j = 1; j < 6 ; j = j + 1) {
            this.ctx.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
        }
        // this.ctx.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();    } else {
        this.ctx.fillStyle = darworms.dwsettings.cellBackground[1-darworms.dwsettings.backGroundTheme];
        this.ctx.lineWidth = 1.0/this.scale.x;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 0.1, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.fill();

    }

    //  draw hex outline
    this.ctx.strokeStyle = darworms.dwsettings.cellBackground[1-darworms.dwsettings.backGroundTheme];
    this.ctx.beginPath();
    this.ctx.moveTo(darworms.graphics.vertex_x[0],darworms.graphics.vertex_y[0]);
    for (var j = 1; j < 6 ; j = j + 1) {
        this.ctx.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
    }
    this.ctx.lineTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
    this.ctx.stroke();
    this.ctx.closePath();


    var outvec = this.grid.outVectorsAt(gPoint);
    var invec = this.grid.inVectorsAt(gPoint);
    // console.log (" drawCell at" +  gPoint.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & darworms.outMask[i]) !== 0) {
            var outSpokeColor = darworms.dwsettings.colorTable[this.grid.spokeAt(gPoint, i)];
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
            var inSpokeColor = darworms.dwsettings.colorTable[this.grid.spokeAt(gPoint, i)];
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
