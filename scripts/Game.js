/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:15 AM
 * To change this template use File | Settings | File Templates.
 */
/*    Game   */
var gameStates = {"over": 0, "running" : 1, "waiting": 2, "paused": 3};
var gameStateNames = ["over", "running", "waiting", "paused"];
function Game(gridWidth, gridHeight, canvas, context) {
    console.log ( " new Game wGraphics " + wGraphics);
    this.gameState = gameStates.over;
    this.margin = 10;
    this.grid = new Grid(gridWidth, gridHeight);
    this.canvas = canvas;


    this.frameTimes = [];
    this.startFrameTimes = [];
    this.dirtyCells = [];
    this.numTurns = 0;
    this.numMoves = 0;
    this.cellsInZoomPane = new Point(5,5);

    this.zoomPane = new WPane(this.grid, this.cellsInZoomPane , new Point( gridWidth >> 1, gridHeight >>1) , document.getElementById("wcanvas"))
    this.scale = new Point((this.canvas.width - (2*this.margin))/gridWidth, (this.canvas.height- (2*this.margin))/gridHeight);
    this.origin = new Point( gridWidth >> 1, gridHeight >>1);
    console.log( "newGame  scalex "  + (this.canvas.width - (2*this.margin))/gridWidth);
    // context.scale(this.scale.x, this.scale.y);
    this.worms = [];
    this.needsRedraw = true;
    this.avePos = new Point(0,0);
    // worm index of zero means unclaimed.
    this.colorTable = ["000000", "881C0A", "#1C880A", "#1C0A88",
        "#AAAA00", "#448833", "#443388", "#338844",
        "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
        "#884433", "#448833", "#443388", "#338844"];
    this.alphaColorTable = ["rgba(  0,   0,   0, 0.2)",
        "rgba(  255,   0,   0, 0.8)", "rgba(    0, 255,   0, 0.8)", "rgba(    0,   0, 255, 0.8)", "rgba(  255, 200, 0, 0.8)",
        "#AAAA0080", "#44883380", "#44338880", "#33884480",
        "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
        "#88443380", "#44883380", "#44338880", "#33884480"];

    this.xPts = [ 1.0, 0.5, -0.5, -1.0, -0.5, 0.5];
    this.yPts = [ 0.0,  1.0,  1.0,  0.0,  -1.0, -1.0];

    Game.prototype.log = function() {
    };
    console.log( " Game grid size  " + new Point(this.grid.width,this.grid.height).format());
    console.log( " Game Canvas size  " + new Point(this.canvas.width,this.canvas.height).format());
    console.log( " Game scale " + this.scale.format());
    for (var i = 0; i < this.worms.length; i = i + 1) {
        console.log (" Game worm" + i + " :  " + this.worms[i].state + " at "  + this.worms[i].pos.format() + " value:" + this.grid.hexValueAt( this.worms[i].pos));
        // this.worms[i].log();
        // console.log ( "   Grid value =  ");
        // this.grid.logValueAt(this.worms[i].pos);
    }
};
Game.prototype.printNonEmpty = function () {

    this.grid.each ( function (point, value) {
        if (value > 0) {
            console.log( "NonEmpty " + point.format() + " value: 0x" + value.toString(16));
        }
    });

};
Game.prototype.setTranslate = function (point) {
    if (( point.y & 1) === 0) {
        wGraphics.translate(point.x + 0.5 + (this.margin/this.scale.x) , point.y + 0.5  + (this.margin/this.scale.y));
        var scalex = point.x + 0.5 + (this.margin/this.scale.x);
        var scaley = point.y + 0.5 + (this.margin/this.scale.y);
        console.log(" setTranslate " + scalex  + " , " + scaley);
    } else {
        wGraphics.translate(point.x + 1.0 + (this.margin/this.scale.x) , point.y + 0.5 + (this.margin/this.scale.y));
    }
};
Game.prototype.gsetTranslate = function (point) {
    var xoff;
    var yoff;
    if (( point.y & 1) === 0) {
        xoff = (point.x + 0.5 + (this.margin/this.scale.x)) * this.scale.x;
    } else {
        xoff = (point.x + 1.0 + (this.margin/this.scale.x))  * this.scale.x;

    }
    yoff = (point.y + 0.5 + (this.margin/this.scale.y)) * this.scale.y;
    wGraphics.setTransform(this.scale.x,0,0,this.scale.y,xoff,yoff);
};
/*  TODO  move all drawing from game to wPanes  */
Game.prototype.drawCell = function( point) {
    wGraphics.save();
    this.gsetTranslate(point);

    wGraphics.fillStyle =  "rgb(222,222,222)";
    wGraphics.beginPath();
    wGraphics.rect(-0.5, -0.5, 1.0, 1.0);
    wGraphics.closePath();
    wGraphics.fill();
    var owner = this.grid.spokeAt( point, 7);
    if (owner > 0 ) {
        wGraphics.strokeStyle = this.colorTable[owner & 0xF];
        wGraphics.lineWidth = 1.0/this.scale.x;
        wGraphics.beginPath();
        wGraphics.arc(0, 0, 0.25, 0, Math.PI*2, true);
        wGraphics.closePath();
        wGraphics.stroke();
    } else {
        wGraphics.fillStyle = this.colorTable[this.grid.spokeAt(point,6) & 0xF];
        wGraphics.beginPath();
        wGraphics.arc(0, 0, 0.1, 0, Math.PI*2, true);
        wGraphics.closePath();
        wGraphics.fill();

    }
    var outvec = this.grid.outVectorsAt(point);
    var invec = this.grid.inVectorsAt(point);
    // console.log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & outMask[i]) !== 0) {
            var outSpokeColor = this.colorTable[this.grid.spokeAt(point, i)];
            // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
            wGraphics.strokeStyle  = outSpokeColor;
            wGraphics.lineWidth =   1.0/this.scale.x ;
            wGraphics.lineCap = 'round';
            wGraphics.beginPath();
            wGraphics.moveTo(0,0);
            wGraphics.lineTo(this.xPts[i], this.yPts[i]);
            wGraphics.stroke();
            wGraphics.closePath();
        }
        if ((invec & outMask[i]) !== 0) {
            wGraphics.strokeStyle  = this.colorTable[this.grid.spokeAt(point, i)];
            wGraphics.lineWidth = 1.0/this.scale.x;
            wGraphics.lineCap = 'round';
            wGraphics.beginPath();
            wGraphics.moveTo(this.xPts[i], this.yPts[i]);
            wGraphics.lineTo(0,0);
            wGraphics.stroke();
            wGraphics.closePath();
        }
    }
    wGraphics.restore();

};
Game.prototype.drawSelectCell = function(point) {
    //  Draw the large direction selectors screen
    //  A rectangle 2.0 x 2.0
    theGame.drawZoom(point);
    wGraphics.save();
//    console.log( "drawSelectCell  canvas "  + this.canvas.width + " height "  + this.canvas.height);
//    console.log( "drawSelectCell  grid "  + this.grid.width + " height "  + this.grid.height);

    var hoffset = - this.zoomPane.scale.x/4;

    if((point.y & 1) === 1  && (this.cellsInZoomPane.x > 1))  {
        hoffset =   this.zoomPane.scale.x/4;
        // console.log( "drawSelectCell  hoffset "  + hoffset);
    }
    //  sconsole.log( "drawSelectCell  hoffset "  + hoffset + " scale.x = " + this.zoomPane.scale.x);
    // wGraphics.scale(this.grid.width/2, this.grid.height/2);
    // wGraphics.translate(1.0, 1.0);
    wGraphics.setTransform((this.canvas.width-(2.0*this.margin))/2, 0,0, (this.canvas.height-(2.0*this.margin))/2,
        (this.canvas.width/2) + hoffset , (this.canvas.height)/2 );
    // console.log( "drawSelectCell  scalex "  + this.grid.width/2 );
    /* wGraphics.fillStyle =  "rgba(622,222,222,0.8)";
     wGraphics.beginPath();
     wGraphics.rect(-1.0, -1.0, 2.0, 2.0);
     wGraphics.closePath();
     wGraphics.fill();
     */

    var owner = this.grid.spokeAt( point, 7);
    wGraphics.fillStyle = "rgba(0,0,0,0.8)";
    wGraphics.beginPath();
    wGraphics.arc(0, 0, 0.3 / theGame.zoomPane.cWidth, 0, Math.PI*2, true);
    wGraphics.closePath();
    wGraphics.fill();

    var outvec = this.grid.stateAt(point);
    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & outMask[i]) !== 0) {
            var outSpokeColor = this.alphaColorTable[this.grid.spokeAt(point, i)];
            // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
            // wGraphics.strokeStyle  = "rgba(0,0,0,0.2)";
            wGraphics.strokeStyle  = outSpokeColor;
            wGraphics.lineWidth = 8/this.canvas.width;
            wGraphics.lineCap = 'round';
            wGraphics.beginPath();
            wGraphics.moveTo(0,0);
            wGraphics.lineTo(this.xPts[i]/this.cellsInZoomPane.x * 2.0 , this.yPts[i]/this.cellsInZoomPane.y * 2.0);
            wGraphics.stroke();
            wGraphics.closePath();
        } else {

            wGraphics.strokeStyle  = this.alphaColorTable[focusWorm.colorIndex];
            wGraphics.lineWidth = 8/this.canvas.width;
            // wGraphics.moveTo(this.targetPts[i].x, this.targetPts[i].y);
            wGraphics.beginPath();
            wGraphics.arc(this.xPts[i] * .75, this.yPts[i]* .75,  (0.250 / 64) * (animFrame & 0x3F), 0, Math.PI*2, false);
            wGraphics.closePath();
            wGraphics.stroke();
            wGraphics.moveTo(0,0);
            wGraphics.lineTo((this.xPts[i] * .75  ) /  64.0  * (animFrame & 0x3F)  , (this.yPts[i] * .75)  / 64.0 * (animFrame & 0x3F));
            wGraphics.stroke();
            wGraphics.closePath();
        }
    }
    wGraphics.restore();
    this.needsReDraw = true;

};
Game.prototype.highlightCell = function(point, color) {
    /*
     wGraphics.save();
     this.setTranslate(point);
     //the rectangle is half transparent
     wGraphics.fillStyle =  "rgba(250,250,000,0.2)";
     wGraphics.beginPath();
     wGraphics.rect(-0.5, -0.5, 1.0, 1.0);
     wGraphics.closePath();
     wGraphics.fill();
     wGraphics.restore();
     */
    wGraphics.save();
    this.gsetTranslate(point);
    //the rectangle is half transparent
    wGraphics.fillStyle =  "rgba(250,250,000,0.2)";
    wGraphics.beginPath();
    wGraphics.rect(-0.5, -0.5, 1.0, 1.0);
    wGraphics.closePath();
    wGraphics.fill();
    wGraphics.restore();

};
Game.prototype.drawCells = function () {
    for (var col = 0; col < this.grid.width ; col = col + 1) {
        for (var row = 0; row < this.grid.height ; row = row + 1) {
            this.drawCell(new Point(col,row));
        }
    }
    for (var i = 0; i < this.worms.length; i = i + 1) {
        var active = this.worms[i];
        this.highlightCell(active.pos, this.colorTable[active.colorIndex]);
    }
};
Game.prototype.drawDirtyCells = function () {
    var pt;
    while ((pt = this.dirtyCells.pop()) !== undefined ) {
        this.drawCell(pt);
    }
};
Game.prototype.clearCanvas = function() {
    // Store the current transformation matrix
    wGraphics.save();

// Use the identity matrix while clearing the canvas
    wGraphics.setTransform(1, 0, 0, 1, 0, 0);
    wGraphics.clearRect(0, 0, this.canvas.width, this. canvas.height);

// Restore the transform
    wGraphics.restore();
//    wGraphics.clearRect(0,0,canvas.width,canvas.height);
};
Game.prototype.clear = function() {
    this.clearCanvas();
    this.grid.clear();
    this.elapsedTime = - new Date().getTime();
    // this.worms = [];
};
Game.prototype.addWorm = function(w) {
    w.pos = this.origin;
    w.nMoves = 0;
    w.score = 0;
    w.state = wormStates.paused;
    this.worms.push(w);
};
Game.prototype.getAvePos = function(w) {
    var nActiveAve = 0;
    this.avePos.x = 0;
    this.avePos.y = 0;

    for (var i = 0; i < this.worms.length; i = i + 1) {
        var active = this.worms[i];
        if (active.state === wormStates.moving) {
            this.avePos.x = this.avePos.x + active.pos.x;
            this.avePos.y = this.avePos.y + active.pos.y;
            nActiveAve = nActiveAve + 1;
        }
    }

    if (nActiveAve > 1 ) {
        this.avePos.x = Math.floor(this.avePos.x / nActiveAve);
        this.avePos.y = Math.floor(this.avePos.y / nActiveAve);
    }
    // console.log(this.avePos.format());
};
Game.prototype.drawZoom = function(aPos) {
//   console.log (" drawZoom   "  + " at "  + aPos.format());

    this.zoomPane.setCenter(aPos, this.cellsInZoomPane);
    // this.zoomPane.cWidth = this.cellsInZoomPane.x;
    // this.zoomPane.cHeight = this.cellsInZoomPane.y;
    // this.zoomPane.setScale();
    // this.zoomPane.setCenter(new Point(9,9));
    this.zoomPane.drawCells();

    // zctx.drawImage(canvas,(this.avePos.x * this.scale.x) - 25 ,(this.avePos.y * this.scale.y) - 25 ,100,100,0,0,100,100);
}
Game.prototype.makeMove = function( ) {
    var nAlive = 0;
    if (this.gameState === gameStates.waiting) {
        return;
    }
    // console.log ("Game  StartingTurn " + this.numTurns );
    for (var i = nextToMove; i < this.worms.length; i = i + 1) {
        var active = this.worms[i];
        // console.log (" GamemakeMove   for worm" + i + " :  " + wormStateNames[active.state] + " at "  + active.pos.format());
        if (active.state === wormStates.sleeping) {
            continue;
        }
        active.state = wormStates.moving;
        // console.log (" Game  Before Move for worm" + i + " :  " + active.state + " at "  + active.pos.format());
        // active.log();
        // console.log ( "   Grid value =  ");
        // this.grid.logValueAt(active.pos);
        var currentState = this.grid.stateAt(active.pos);
        // console.log (" Current State = " + currentState);
        if (currentState == 0x3F) {
            active.state = wormStates.dead;
            // console.log (" death of worm " + active.colorIndex + " Current State = " + currentState);
        } else {
            var direction = active.getMoveDir(currentState);
            if (direction === codons.unSet) {
                this.gameState = gameStates.waiting;
                // console.log(this.grid.formatStateAt(active.pos));
                // console.log ( " setting gamestate to gameStates.waiting " +  this.gameState);
                focusPoint = active.pos;
                focusWorm = active;
                focusValue = currentState;
                nextToMove = i;
                this.numMoves = this.numMoves + 1;
                active.nMoves = active.nMoves + 1;
                this.zoomPane.canvasIsDirty = true;
                return(true);
            }
            this.dirtyCells.push(active.pos);
            // console.log (" Move Direction = " + direction);
            var next = this.grid.next(active.pos,direction);


            active.score = active.score + this.grid.move(active.pos,next,direction,active.colorIndex);
            this.numMoves = this.numMoves + 1;
            active.nMoves = active.nMoves + 1;
            // console.log("    Worm " + active.colorIndex + "  just made move " + active.nMoves + " game turn " + this.numTurns + " From " + this.grid.formatStateAt(active.pos) + " direction  " + direction);
            active.pos = next;

            this.dirtyCells.push(next);

            // console.log(" active.score [" +  i + "] ="  + active.score);

            //console.log("     From Value is " +  this.grid.hexValueAt(active.pos)  );
            //console.log (" Next Point = " + next.format());
            //console.log(" Set To State to " +  this.grid.stateAt(active.pos)  );
            //console.log("     To Value is " +  this.grid.hexValueAt(active.pos)  );

        }
        if ( active.state !== wormStates.dead ) {
            nAlive = nAlive + 1;
        }
        //console.log (" Game  After Move for worm" + i + " :  " + active.state + " at "  + active.pos.format());
        // this.grid.logValueAt(active.pos);
    }
    nextToMove = 0;
    this.numTurns = this.numTurns + 1;
    return ( nAlive > 0 || (nextToMove !== 0));
};

Game.prototype.showTimes = function() {
    var min = 100000000;
    var max = 0;
    var ave = 0;
    var nFrames = 0;
    var sumTime = 0;
    var fps = 0;
    console.log( "this.frameTimes.length " + this.frameTimes.length );
    for (var i = 0; i < this.frameTimes.length; i = i + 1)  {
        nFrames = nFrames + 1;
        if (this.frameTimes[i] > max) {
            max = this.frameTimes[i];
        }
        if (this.frameTimes[i] < min) {
            min = this.frameTimes[i];
        }
        sumTime = sumTime + this.frameTimes[i];
    }
    if (nFrames > 0) {
        ave = Math.round(sumTime/nFrames*100)/100;
    }
    var totalElapsed = new Date().getTime() - this.startFrameTimes[0];
    var percentDrawing = Math.round((sumTime * 100 / totalElapsed*100))/100;
    // var percentDrawing = (sumTime * 100 / totalElapsed);

    if (this.elapsedTime > 0) {
        fps = Math.round(nFrames*1000/this.elapsedTime*100)/100;
    }
    document.getElementById('wormframes').innerHTML = nFrames;
    document.getElementById('wormmintime').innerHTML = min;
    document.getElementById('wormmaxtime').innerHTML = max;
    document.getElementById('wormavetime').innerHTML = ave;
    document.getElementById('wormfps').innerHTML = fps;
//  frame Intervals.  How often did out update get called
    min = 1000000;
    max = 0;
    nFrames = 0;
    sumTime = 0;
    ave = 0;
    var delta = 0;
    for (i = 1; i < this.startFrameTimes.length; i = i + 1)  {
        nFrames = nFrames + 1;
        delta = this.startFrameTimes[i] - this.startFrameTimes[i-1];
        if (delta > max) {
            max = delta;
        }
        if (delta < min) {
            min = delta;
        }
        sumTime = sumTime + delta;
    }
    if (nFrames > 0) {
        ave = Math.round(sumTime/nFrames*100)/100;
    }
    document.getElementById('wormframemintime').innerHTML = min;
    document.getElementById('wormframemaxtime').innerHTML = max;
    document.getElementById('wormframeavetime').innerHTML = ave;
    document.getElementById('wormframepercenttime').innerHTML = percentDrawing;


};

/* end of Game */

