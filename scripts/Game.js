/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:15 AM
 * To change this template use File | Settings | File Templates.
 */
/*    gameModule
   Anonymous function that returns Game Object
   to be used as
   var gameObject - new darworms.gameModule.Game()
 *     */
darworms.gameModule = (function() {

    var gameStates = {"over": 0, "running" : 1, "waiting": 2, "paused": 3};
    var gameCanvas;
    var wGraphics;
    var nextToMove;
    var focusPoint;
    var focusWorm;
    var focusValue;
    var scorectx;
    var cellsInZoomPane = new Point(7,7);


    function Game(gridWidth, gridHeight) {


        darworms.main.wCanvas.width = darworms.wCanvasPixelDim.x;
        darworms.main.wCanvas.height = darworms.main.wCanvas.width;


        this.gameState = darworms.gameStates.over;
        this.margin = 10;
        this.grid = new darworms.gridModule.Grid(gridWidth, gridHeight);
        this.canvas = gameCanvas;

        this.frameTimes = [];
        this.startFrameTimes = [];
        this.dirtyCells = [];
        this.numTurns = 0;
        this.numMoves = 0;
        cellsInZoomPane = new Point(9,9);


        this.zoomPane = new WPane(this.grid, cellsInZoomPane , new Point( gridWidth >> 1, gridHeight >>1) , document.getElementById("wcanvas"))
        this.scale = new Point((gameCanvas.width - (2*this.margin))/gridWidth, (gameCanvas.height- (2*this.margin))/gridHeight);
        this.origin = new Point( gridWidth >> 1, gridHeight >>1);
        focusPoint = this.origin;
        console.log( "newGame  scalex "  + (gameCanvas.width - (2*this.margin))/gridWidth);
        // context.scale(this.scale.x, this.scale.y);
        this.worms = [];
        this.needsRedraw = true;
        this.avePos = new Point(0,0);
        // worm index of zero means unclaimed.

        this.xPts = [ 1.0, 0.5, -0.5, -1.0, -0.5, 0.5];
        this.yPts = [ 0.0,  1.0,  1.0,  0.0,  -1.0, -1.0];

        Game.prototype.log = function() {
        };
        console.log( " Game grid size  " + new Point(this.grid.width,this.grid.height).format());
        console.log( " Game Canvas size  " + new Point(gameCanvas.width,gameCanvas.height).format());
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
       // if (point.isEqualTo(new Point (this.grid.width-1, this.grid.height/2))) {
       //     console.log(this.grid.formatStateAt(point));
       // }
        wGraphics.save();
        this.gsetTranslate(point);
        wGraphics.fillStyle =  darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
        wGraphics.fillRect(-0.5, -0.5, 1.0, 1.0);
        var owner = this.grid.spokeAt( point, 7);
        if (owner > 0 ) {
            wGraphics.strokeStyle = darworms.dwsettings.colorTable[owner & 0xF];
            wGraphics.lineWidth = 1.0/this.scale.x;
            wGraphics.beginPath();
            wGraphics.arc(0, 0, 0.25, 0, Math.PI*2, true);
            wGraphics.closePath();
            wGraphics.stroke();
        } else {
            // wGraphics.fillStyle =  darworms.dwsettings.colorTable[this.grid.spokeAt(point,6) & 0xF];
            wGraphics.fillStyle =  darworms.dwsettings.cellBackground[1-darworms.dwsettings.backGroundTheme];
            wGraphics.lineWidth = 1.0;
            wGraphics.beginPath();
            wGraphics.arc(0, 0, 0.1, 0, Math.PI*2, true);
            wGraphics.closePath();
            wGraphics.fill();

        }
        var outvec = this.grid.outVectorsAt(point);
        var invec = this.grid.inVectorsAt(point);
        // console.log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

        for (var i = 0; i < 6 ; i = i + 1) {
            if ((outvec & darworms.outMask[i]) !== 0) {
                var outSpokeColor = darworms.dwsettings.colorTable[this.grid.spokeAt(point, i)];
                // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
                wGraphics.strokeStyle  = outSpokeColor;
                wGraphics.lineWidth =   3.0/this.scale.x ;
                wGraphics.lineCap = 'round';
                wGraphics.beginPath();
                wGraphics.moveTo(0,0);
                wGraphics.lineTo(this.xPts[i], this.yPts[i]);
                wGraphics.stroke();
                wGraphics.closePath();
            }
            if ((invec & darworms.outMask[i]) !== 0) {
                wGraphics.strokeStyle  = darworms.dwsettings.colorTable[this.grid.spokeAt(point, i)];
                wGraphics.lineWidth = 3.0/this.scale.x;
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
    Game.prototype.drawSelectCell = function() {
        //  Draw the large direction selectors screen
        //  A rectangle 2.0 x 2.0
        darworms.theGame.drawZoom();
        wGraphics.save();
    //    console.log( "drawSelectCell  canvas "  + gameCanvas.width + " height "  + gameCanvas.height);
    //    console.log( "drawSelectCell  grid "  + this.grid.width + " height "  + this.grid.height);

        var hoffset = - this.zoomPane.scale.x/4;

        if((focusPoint.y & 1) === 1  && (cellsInZoomPane.x > 1))  {
            hoffset =   this.zoomPane.scale.x/4;
            // console.log( "drawSelectCell  hoffset "  + hoffset);
        }
        //  sconsole.log( "drawSelectCell  hoffset "  + hoffset + " scale.x = " + this.zoomPane.scale.x);
        // wGraphics.scale(this.grid.width/2, this.grid.height/2);
        // wGraphics.translate(1.0, 1.0);
        wGraphics.setTransform((gameCanvas.width-(2.0*this.margin))/2, 0,0, (gameCanvas.height-(2.0*this.margin))/2,
            (gameCanvas.width/2) + hoffset , (gameCanvas.height)/2 );
        // console.log( "drawSelectCell  scalex "  + this.grid.width/2 );
        /* wGraphics.fillStyle =  "rgba(622,222,222,0.8)";
         wGraphics.beginPath();
         wGraphics.rect(-1.0, -1.0, 2.0, 2.0);
         wGraphics.closePath();
         wGraphics.fill();
         */

        var owner = this.grid.spokeAt( focusPoint, 7);
        wGraphics.fillStyle = "rgba(0,0,0,0.8)";
        wGraphics.beginPath();
        wGraphics.arc(0, 0, 0.3 / darworms.theGame.zoomPane.cWidth, 0, Math.PI*2, true);
        wGraphics.closePath();
        wGraphics.fill();

        var outvec = this.grid.stateAt(focusPoint);
        for (var i = 0; i < 6 ; i = i + 1) {
            if ((outvec & darworms.outMask[i]) !== 0) {
                var outSpokeColor = darworms.dwsettings.alphaColorTable[this.grid.spokeAt(focusPoint, i)];
                // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + focusPoint.format());
                // wGraphics.strokeStyle  = "rgba(0,0,0,0.2)";
                wGraphics.strokeStyle  = outSpokeColor;
                wGraphics.lineWidth = 8/gameCanvas.width;
                wGraphics.lineCap = 'round';
                wGraphics.beginPath();
                wGraphics.moveTo(0,0);
                wGraphics.lineTo(this.xPts[i]/cellsInZoomPane.x * 2.0 , this.yPts[i]/cellsInZoomPane.y * 2.0);
                wGraphics.stroke();
                wGraphics.closePath();
            } else {

                wGraphics.strokeStyle  = darworms.dwsettings.alphaColorTable[focusWorm.colorIndex];
                wGraphics.lineWidth = 8/gameCanvas.width;
                // wGraphics.moveTo(this.targetPts[i].x, this.targetPts[i].y);
                wGraphics.beginPath();
                wGraphics.arc(this.xPts[i] * .75, this.yPts[i]* .75,  (0.250 / 64) * (darworms.graphics.animFrame & 0x3F), 0, Math.PI*2, false);
                wGraphics.closePath();
                wGraphics.stroke();
                wGraphics.moveTo(0,0);
                wGraphics.lineTo((this.xPts[i] * .75  ) /  64.0  * (darworms.graphics.animFrame & 0x3F),
                    (this.yPts[i] * .75)  / 64.0 * (darworms.graphics.animFrame & 0x3F));
                wGraphics.stroke();
                wGraphics.closePath();
            }
        }
        wGraphics.restore();
        this.needsReDraw = true;

    };

    Game.prototype.drawCells = function () {
        for (var col = 0; col < this.grid.width ; col = col + 1) {
            for (var row = 0; row < this.grid.height ; row = row + 1) {
                this.drawCell(new Point(col,row));
            }
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
        wGraphics.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        wGraphics.fillStyle =  darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
        wGraphics.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Restore the transform
        wGraphics.restore();
    //    wGraphics.clearRect(0,0,canvas.width,canvas.height);
    };
    Game.prototype.clear = function() {
        this.clearCanvas();
        this.grid.clear();
        this.elapsedTime = - new Date().getTime();
        this.frameTimes.length = 0;
        this.startFrameTimes.length = 0;
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
    Game.prototype.drawZoom = function() {
    //   console.log (" drawZoom   "  + " at "  + aPos.format());
        this.zoomPane.setCenter(focusPoint, cellsInZoomPane);
        this.zoomPane.drawCells();
    }
    Game.prototype.makeMove = function( ) {
        var nAlive = 0;
        if (this.gameState === darworms.gameStates.waiting) {
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
                if (direction === darworms.dwsettings.codons.unSet) {
                    this.gameState = darworms.gameStates.waiting;
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
                if (next.isEqualTo(darworms.dwsettings.noWhere)) { // fell of edge of world
                    active.state = wormStates.dead;
                } else {
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
        document.getElementById('wormframetargettime').innerHTML = 1000/$("#fps").val();

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

    //  Called from Timer Loop

    var clearScore = function(segmentIndex, totalSegments)  {
        var segWidth = darworms.dwsettings.scoreCanvas.width / totalSegments;
        scorectx.fillStyle =  "rgba(222,222,222, 1.0)";
        scorectx.shadowOffsetX = 0;
        scorectx.shadowOffsetY = 0;

        scorectx.fillRect(segWidth * segmentIndex,  0, segWidth, darworms.dwsettings.scoreCanvas.height);
    }
    var scoreStartx = function( segmentIndex, totalSegments, text) {
        var segWidth = darworms.dwsettings.scoreCanvas.width / totalSegments;
        var twidth = scorectx.measureText(text).width;
        return  ((segWidth * segmentIndex) + (segWidth/2) - (twidth/2));

    }
    var updateScores = function () {
        var i;
        for (i = 0; i < 4; i++ ) {
            if (darworms.theGame.worms[i] !== undefined  &&  darworms.theGame.worms[i].shouldDrawScore()) {
                clearScore(i,4);
                scorectx.fillStyle = darworms.dwsettings.colorTable[i+1];
                scorectx.shadowOffsetX = 3;
                scorectx.shadowOffsetY = 3;
                scorectx.fillText(darworms.theGame.worms[i].score, scoreStartx(i,4,darworms.theGame.worms[i].score.toString()), 15);
            }
        }
    };
    var makeMoves = function () {
        // console.log(" makeMoves theGameOver " + theGameOver +  "  gameState " + gameStateNames[theGame.gameState] );
        var startTime = new Date().getTime();
        darworms.theGame.startFrameTimes.push(startTime);
        if (darworms.theGame.needsRedraw) {
            darworms.theGame.drawCells();
            darworms.theGame.needsRedraw = false;
            // wGraphics.drawImage(localImage, 10, 10);

        }
        if (darworms.theGame.gameState != darworms.gameStates.over ) {
            if (darworms.theGame.makeMove() === false) {
                darworms.theGame.elapsedTime = darworms.theGame.elapsedTime  + new Date().getTime();
                console.log(" Game Over");
                clearInterval(darworms.graphics.timer);
                // document.getElementById("startpause").innerHTML = "Start Game";
                $("#startpause .ui-btn-text").text("Start Game");
                darworms.theGame.showTimes();
                darworms.theGame.gameState = darworms.gameStates.over;
                // theGame.clearCanvas();
                // alert("Game Over ");
                // wGraphics.restore();
            }
        }
        darworms.theGame.drawDirtyCells();
        darworms.theGame.getAvePos();
        updateScores();
        var elapsed = new Date().getTime() - startTime;
        darworms.theGame.frameTimes.push(elapsed);
    };
    // Called from user actions
    var selectDirection = function (point ) {
        // console.log( "selectDirection: " + point.format());
        var outvec = darworms.theGame.grid.stateAt(focusPoint);
        var minDist = 100000;
        var dist;
        var select = -1;
        for (var i = 0; i < 6 ; i = i + 1) {
            if ((outvec & darworms.outMask[i]) === 0) {
                dist = point.dist(new Point(darworms.theGame.xPts[i], darworms.theGame.yPts[i]));
                if (dist < minDist) {
                    minDist = dist;
                    select = i;
                }
                // console.log( "selectDirection i: " + i + "  dist: " + dist + " Min Dist:" + minDist);
            }
        }
        if ((minDist < 0.5)  && (select >= 0)) {
            focusWorm.dna[focusValue & 0x3F] = select;
            darworms.theGame.gameState = darworms.gameStates.running;
            darworms.theGame.clearCanvas();
            darworms.theGame.drawCells();
        }
    };
    var doZoomOut = function ( tapPoint ) {
        if (tapPoint.dist(new Point(0, 1.0)) < 0.2 ) {
            if (cellsInZoomPane.x >= 5) {
                cellsInZoomPane.x = cellsInZoomPane.x  - 2;
                cellsInZoomPane.y = cellsInZoomPane.y - 2;
            }
            console.log( "doZoomIN: returning true  wPane size ="  +  cellsInZoomPane.x );
            darworms.theGame.zoomPane.canvasIsDirty = true;
            darworms.theGame.zoomPane.setSize(new Point(cellsInZoomPane.x,cellsInZoomPane.y))
            return true;
        }
        if (tapPoint.dist(new Point(0, -1.0)) < 0.2 ) {
            if (cellsInZoomPane.x < darworms.theGame.grid.width - 2) {
                cellsInZoomPane.x = cellsInZoomPane.x + 2;
                cellsInZoomPane.y = cellsInZoomPane.y + 2;
                console.log( "doZoomOut: returning true  wPane size ="  +  cellsInZoomPane.x );
                darworms.theGame.zoomPane.canvasIsDirty = true;
                darworms.theGame.zoomPane.setSize(new Point(cellsInZoomPane.x,cellsInZoomPane.y))
                // theGame.drawZoom(theGame.zoomPane.focus, theGame.cellsInZoomPane);

                return true;
            }
        }
        return false;

    }

    function init () {

        gameCanvas = darworms.main.wCanvas;
        wGraphics = darworms.main.wGraphics;
        nextToMove = 0;
        scoreCanvas = document.getElementById("scorecanvas");
        scorectx =  darworms.dwsettings.scoreCanvas.getContext("2d");
        scorectx.font = "bold 18px sans-serif";
        scorectx.shadowColor = "rgb(190, 190, 190)";
        scorectx.shadowOffsetX = 3;
        scorectx.shadowOffsetY = 3;



    }
    return {
        Game : Game,
        init: init,
        makeMoves: makeMoves,
        selectDirection: selectDirection,
        doZoomOut: doZoomOut
    };

})();/* end of Game */

