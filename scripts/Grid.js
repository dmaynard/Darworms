/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/21/13
 * Time: 11:57 PM
 * To change this template use File | Settings | File Templates.
 */
/*    Grid   */
darworms.gridModule = (function() {
    var evenRowVec = [ new Point( 1, 0), new Point(  0,  1), new Point(-1,  1),
        new Point(-1, 0), new Point( -1, -1),  new Point(0,-1) ];


var oddRowVec = [ new Point( 1, 0), new Point( 1,  1), new Point( 0,  1),
    new Point( -1,0), new Point( 0, -1), new Point( 1, -1) ];


function Grid(width, height) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);


    //  Cell Format   8 bits each:  in-spoke eaten, out-spoke eaten, spoke eaten
    this.cells = new Array(width * height);

    //  7 * 4 bits of color index info for color of each spoke and center
    this.colors = new Array(width * height);
    this.animFraction = new Array(width * height);
    for (var i = 0; i < width * height; i = i + 1) {
        /* 6 bits of each of in, out, and taken hi-to-low */
        this.cells[i] = 0;
        this.colors[i] = 0;
        this.animFraction = 0;
    }
}
Grid.prototype.clear = function() {
    for (var i = 0; i < this.width * this.height; i = i + 1) {
        this.cells[i] = 0;
        this.colors[i] = 0;
    }
};
Grid.prototype.valueAt = function(point) {
    return this.cells[point.y * this.width + point.x];
};
Grid.prototype.hexValueAt = function(point) {
    return (" 0x" + ( this.valueAt(point)).toString(16));
};
Grid.prototype.stateAt = function(point) {
    return this.valueAt(point) & 0x3F;
};
Grid.prototype.outVectorsAt = function(point) {
    return (this.valueAt(point) >> 8) & 0x3F;
};
Grid.prototype.inVectorsAt = function(point) {
    return (this.valueAt(point) >> 16) & 0x3F;
};
Grid.prototype.spokeAt = function(point, dir) {
    return (this.colors[point.y * this.width + point.x] >> (dir*4)) & 0x0F;
};
Grid.prototype.setSpokeAt = function(point, dir, colorIndex) {
    this.colors[point.y * this.width + point.x] =  this.colors[point.y * this.width + point.x] | (colorIndex << (dir*4)) ;
};
Grid.prototype.setValueAt = function(point, value) {
    this.cells[point.y * this.width + point.x] = value;
};
Grid.prototype.isInside = function(point) {
    return point.x >= 0 && point.y >= 0 &&
        point.x < this.width && point.y < this.height;
};
Grid.prototype.move = function(from, to, dir, colorIndex) {
    if ( (this.valueAt(to)  & darworms.inMask[dir])  !== 0) {
        alert(" Attempted to eat eaten spoke at " + to.format());
        console.log ("  (" + to.x  + "," + to.y + ") dir: " + dir + " value: " );
        console.log( "Attempted to eat eaten spoke at " + to.format() + " dir " + dir  +" value: 0x" + value.toString(16));
    }
    this.setValueAt(to, this.valueAt(to) | darworms.inMask[dir] | (darworms.inMask[dir] << 16));
    this.setValueAt(from, this.valueAt(from) | darworms.outMask[dir] | (darworms.outMask[dir] << 8));
    this.setSpokeAt(from, dir, colorIndex);
    this.setSpokeAt(from, 6, colorIndex);
    this.setSpokeAt(to, darworms.inDir[dir], colorIndex);
    this.setSpokeAt(to, 6, colorIndex);
    var captures = 0;
    if (this.stateAt(to) === 0x3f) {
        this.setSpokeAt(to, 7, colorIndex);
        captures = captures + 1;
    }
    if (this.stateAt(from) === 0x3f) {
        this.setSpokeAt(from, 7, colorIndex);
        captures = captures + 1;
    }
    return captures;
};
// Returns next x,y position
Grid.prototype.next = function(point, dir) {
    var nP = new Point( point.x, point.y);
    // console.log ("  (" + point.x  + "," + point.y + ") dir: " + dir);
    if ((point.y & 1) === 0) {
        nP = nP.add(evenRowVec[dir]);
    } else {
        nP = nP.add(oddRowVec[dir]);
    }
    if (nP.x < 0)  {
        nP.x = this.width - 1;
    }
    if (nP.x > this.width-1) {
        nP.x = 0;
    }
    if (nP.y < 0)  {
        nP.y = this.height -1;
        // nP.x = (this.width-1 ) - nP.x;
    }
    if (nP.y > this.height-1)  {
        nP.y = 0;
        // nP.x = (this.width-1 ) - nP.x;
    }
    // console.log ("    next from: (" + point.format()  + " dir " + dir + " next:  " + nP.format());
    return nP;
};
Grid.prototype.each = function(action) {
    for (var y=0; y < this.height; y++ ) {
        for ( var x=0; x < this.width; x++) {
            var point = new Point(x,y);
            action(point, this.valueAt(point));
        }
    }
};
Grid.prototype.logValueAt = function(point) {
    console.log("[ " + point.x + "," + point.y + "] val = 0x"+ this.valueAt(point).toString(16) + " outVectors = 0x",
        this.outVectorsAt(point).toString(16) + " inVectors = 0x" +  this.inVectorsAt(point).toString(16));
};
Grid.prototype.formatStateAt = function(point) {
    return " x " + point.x + " y " + point.y + " state 0x"+ this.stateAt(point).toString(16);
};
    return {
        Grid : Grid
    };

})();
/* end Grid */