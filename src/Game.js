import { Point } from "./Point.js";
import { darworms } from "./loader.js";
import { Grid } from "./Grid.js";
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
  var gameCanvas;
  var wGraphics;
  var nextToMove;
  var focusPoint;
  var focusWorm;
  var focusValue;
  var scorectx;



  function Game(gridWidth, gridHeight) {


    darworms.main.wCanvas.width = darworms.wCanvasPixelDim.x;
    darworms.main.wCanvas.height = darworms.wCanvasPixelDim.y;


    this.gameState = darworms.gameStates.over;
    this.grid = new Grid(gridWidth, gridHeight);
    this.canvas = gameCanvas;

    this.frameTimes = [];
    this.startFrameTimes = [];
    this.dirtyCells = [];
    this.numTurns = 0;
    this.numMoves = 0;
    this.timeInDraw = 0;
    this.activeIndex = 0;

    this.scale = new Point(((gameCanvas.width()) / (gridWidth + 1.5)), ((gameCanvas.height()) / (gridHeight + 1)));
    console.log(" new Game scale set to " + this.scale.format());
    this.origin = new Point(gridWidth >> 1, gridHeight >> 1);
    focusPoint = this.origin;
    this.worms = [];
    this.needsRedraw = true;
    this.avePos = new Point(0, 0);
    // worm index of zero means unclaimed.

    this.xPts = [1.0, 0.5, -0.5, -1.0, -0.5, 0.5];
    this.yPts = [0.0, 1.0, 1.0, 0.0, -1.0, -1.0];

    // variable for animating zoom in to selection UI
    // create back buffer image  for current grid image

    // this should depend on scale factor.  On small screens
    // we cshould set pickDirectionUI to true
    if ((this.scale.x) < 20 || (this.scale.y < 20)) {
      $('#pickDirectionUI').slider().val(1);
      $('#pickDirectionUI').slider("refresh");
      darworms.dwsettings.pickDirectionUI = "1";
    }
    console.log(" Scale: " + this.scale.format() + "darworms.dwsettings.pickDirectionUI" + 1);
    this.zoomFrame = 0;
    this.startx = 0;
    this.starty = 0;
    this.endx = 0;
    this.endy = 0;
    this.startscale = 1.0;
    this.endScale = 1.0;
    // three second zoom animation
    this.targetZoomFrames = 60;
    this.asterixSize = 0.2;
    this.bullseyeoffset = new Point(0, 0);
    this.focusWorm = null;

  }

  Game.prototype.updateScale = function(width, height) {
    this.scale = new Point(((width) / (this.grid.width + 1.5)), ((height) / (this.grid.height + 1)));
    this.gameCanvas = $('#wcanvas');

    console.log("updateScale " + this.scale.format());
  };

  Game.prototype.log = function() {

    console.log(" Game grid size  " + new Point(this.grid.width, this.grid.height).format());
    console.log(" Game Canvas size  " + new Point(gameCanvas.width(), gameCanvas.height()).format());
    console.log(" Game scale " + this.scale.format());
    for (var i = 0; i < this.worms.length; i = i + 1) {
      console.log(" Game worm " + i + " :  " + this.worms[i].state + " at " + this.worms[i].pos.format() + " value:" + this.grid.hexValueAt(this.worms[i].pos));
      // this.worms[i].log();
      // console.log ( "   Grid value =  ");
      // this.grid.logValueAt(this.worms[i].pos);
    }
  };
  Game.prototype.printNonEmpty = function() {

    this.grid.each(function(point, value) {
      if (value > 0) {
        console.log("NonEmpty " + point.format() + " value: 0x" + value.toString(16));
      }
    });

  };

  Game.prototype.getOffset = function(point) {
    var xoff;
    var yoff;
    if ((point.y & 1) === 0) {
      xoff = ((point.x + 0.5) * (this.scale.x)) + (this.scale.x / 2);
    } else {
      xoff = ((point.x + 1.0) * (this.scale.x)) + (this.scale.x / 2);
    }
    yoff = ((point.y + 0.5) * (this.scale.y)) + (this.scale.y / 2);
    return new Point(xoff, yoff);
  }

  Game.prototype.gsetTranslate = function(point) {
    var cellOffset = this.getOffset(point);
    wGraphics.setTransform(this.scale.x, 0, 0, this.scale.y, cellOffset.x, cellOffset.y);
    // console.log( "Drawing cell " +  point.format() + " x= " + cellOffset.x + "  y= " + cellOffset.y);
  };
  Game.prototype.highlightWorm = function(worm, index) {
    if (worm.state === darworms.gameStates.waiting) {
      this.gsetTranslate(worm.pos);

      wGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
      wGraphics.beginPath();
      wGraphics.arc(0, 0, 0.2, 0, Math.PI * 2, true);
      wGraphics.closePath();
      wGraphics.fill();

      wGraphics.fillStyle = darworms.dwsettings.alphaColorTable[worm.colorIndex];
      wGraphics.beginPath();
      wGraphics.arc(0, 0, 0.2 * ((darworms.graphics.animFrame & 0x1F) / 0x1F), 0, Math.PI * 2, true);
      wGraphics.closePath();
      wGraphics.fill();

    }
  }
  /*  TODO  move all drawing from game to wPanes
   *   except that the Selection wants the cell centered
   */
  Game.prototype.drawCell = function(point) {
    // if (point.isEqualTo(new Point (this.grid.width-1, this.grid.height/2))) {
    //     console.log(this.grid.formatStateAt(point));
    // }
    this.timeInDraw -= Date.now();
    // wGraphics.save();
    this.gsetTranslate(point);
    var owner = this.grid.spokeAt(point, 7);
    wGraphics.lineWidth = 2.0 / this.scale.x;
    //  first clear cell to prevent multiple cals to drawcell from
    // darkening the cell  (multiple calls to the same cell are made to
    // highlite worm positions and animate death.
    // perhaps we should add a parameter to the call indicating whether clear is needsReDraw

    wGraphics.strokeStyle = darworms.dwsettings.colorTable[owner & 0xF];
    wGraphics.fillStyle =
      darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];

    wGraphics.beginPath();
    wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
    for (var j = 1; j < 6; j = j + 1) {
      wGraphics.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
    }
    // wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
    wGraphics.stroke();

    wGraphics.closePath();
    wGraphics.fill();
    // wGraphics.stroke();

    if (owner) {
      wGraphics.strokeStyle = darworms.dwsettings.colorTable[owner & 0xF];
      wGraphics.fillStyle =
        darworms.dwsettings.alphaColorTable[owner & 0xF];
      wGraphics.beginPath();
      wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
      for (var j = 1; j < 6; j = j + 1) {
        wGraphics.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
      }
      // wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
      wGraphics.stroke();
      wGraphics.closePath();
      wGraphics.fill();
    }

    // wGraphics.stroke();



    wGraphics.fillStyle = darworms.dwsettings.alphaColorTable[this.grid.spokeAt(point, 6) & 0xF];


    // wGraphics.fillStyle =  darworms.dwsettings.cellBackground[1-darworms.dwsettings.backGroundTheme];
    wGraphics.lineWidth = 2.0 / this.scale.x;
    wGraphics.beginPath();
    wGraphics.arc(0, 0, 0.1, 0, Math.PI * 2, true);
    wGraphics.closePath();
    wGraphics.fill();
    //  draw hex outline
    wGraphics.strokeStyle = darworms.dwsettings.cellBackground[1 - darworms.dwsettings.backGroundTheme];
    wGraphics.lineWidth = 1.0 / this.scale.x;
    wGraphics.beginPath();
    wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
    for (var j = 1; j < 6; j = j + 1) {
      wGraphics.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
    }
    wGraphics.lineTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
    wGraphics.stroke();
    wGraphics.closePath();

    var outvec = this.grid.outVectorsAt(point);
    var invec = this.grid.inVectorsAt(point);
    // console.log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

    for (var i = 0; i < 6; i = i + 1) {
      if ((outvec & darworms.outMask[i]) !== 0) {
        var outSpokeColor = darworms.dwsettings.colorTable[this.grid.spokeAt(point, i)];
        // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
        wGraphics.strokeStyle = outSpokeColor;
        wGraphics.lineWidth = 2.0 / this.scale.x;
        wGraphics.lineCap = 'round';
        wGraphics.beginPath();
        wGraphics.moveTo(0, 0);
        wGraphics.lineTo(this.xPts[i], this.yPts[i]);
        wGraphics.stroke();
        wGraphics.closePath();
      }
      if ((invec & darworms.outMask[i]) !== 0) {
        wGraphics.strokeStyle = darworms.dwsettings.colorTable[this.grid.spokeAt(point, i)];
        wGraphics.lineWidth = 2.0 / this.scale.x;
        wGraphics.lineCap = 'round';
        wGraphics.beginPath();
        wGraphics.moveTo(this.xPts[i], this.yPts[i]);
        wGraphics.lineTo(0, 0);
        wGraphics.stroke();
        wGraphics.closePath();
      }
    }
    if (this.grid.isSink(point)) {
      wGraphics.strokeStyle = darworms.dwsettings.colorTable[0];
      for (var k = 0; k < 3; k = k + 1) {
        var m = ((k + 3) % 6);
        wGraphics.beginPath();
        wGraphics.moveTo(this.xPts[k] * this.asterixSize, this.yPts[k] * this.asterixSize);
        wGraphics.lineTo(this.xPts[m] * this.asterixSize, this.yPts[m] * this.asterixSize);
        wGraphics.stroke();
        wGraphics.closePath();
        wGraphics.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
      }
    }
    // wGraphics.restore();
    this.timeInDraw += Date.now();

  };

  Game.prototype.drawPickCell = function(point, activeColor) {
    // wGraphics.save();
    darworms.theGame.gsetTranslate(point);
    wGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
    // wGraphics.fillRect(-0.5, -0.5, 1.0, 1.0);
    var owner = this.grid.spokeAt(point, 7);
    if (owner !== 0) {
      console.log(" Why is an owned cell a target selection? " + point.format(point));
    }
    this.drawCell(point); // set up original background for this cell

    var animFraction = 1.0 * (darworms.graphics.animFrame & 0x3F) / 64;

    wGraphics.strokeStyle = activeColor;
    wGraphics.fillStyle = activeColor;
    wGraphics.beginPath();
    wGraphics.moveTo(darworms.graphics.vertex_x[0] * animFraction, darworms.graphics.vertex_y[0] * animFraction);
    for (var j = 1; j < 6; j = j + 1) {
      wGraphics.lineTo(darworms.graphics.vertex_x[j] * animFraction, darworms.graphics.vertex_y[j] * animFraction);
    }
    wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
    wGraphics.stroke();
    wGraphics.closePath();
    wGraphics.fill();
    // wGraphics.stroke();



    wGraphics.fillStyle = darworms.dwsettings.alphaColorTable[this.grid.spokeAt(point, 6) & 0xF];
  };
  Game.prototype.drawPickCellOrigin = function(point, activeColor) {
    // wGraphics.save();
    darworms.theGame.gsetTranslate(point);
    wGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
    // wGraphics.fillRect(-0.5, -0.5, 1.0, 1.0);
    var owner = this.grid.spokeAt(point, 7);
    if (owner !== 0) {
      console.log(" Why is an owned cell a target selection origin? " + point.format(point));
    }
    this.drawCell(point); // set up original backgrounf for this cell

    var animFraction = 1.0 * (darworms.graphics.animFrame & 0x3F) / 64;

    wGraphics.strokeStyle = activeColor;
    wGraphics.fillStyle = activeColor;
    var outvec = this.grid.outVectorsAt(point);
    var invec = this.grid.inVectorsAt(point);
    for (var dir = 0; dir < 6; dir = dir + 1) {
      if (((outvec & darworms.outMask[dir]) == 0) && ((invec & darworms.outMask[dir]) == 0)) {


        wGraphics.lineWidth = 3.0 / this.scale.x;
        wGraphics.lineCap = 'round';
        wGraphics.beginPath();
        wGraphics.moveTo(0, 0);
        wGraphics.lineTo(this.xPts[dir] * animFraction, this.yPts[dir] * animFraction);
        wGraphics.stroke();
        wGraphics.closePath();

      }

    }

  };
  var binToRGB = function(bin) {
    return {
      r: parseInt(((bin >> 16) & 0xFF)),
      g: parseInt(((bin >> 8) & 0xFF)),
      b: parseInt(((bin) & 0xFF))
    };
  }



  Game.prototype.drawExpandedTarget = function(pickTarget) {
    var screenCoordinates = this.getOffset(pickTarget.pos);

    wGraphics.save();


    const fillColorString = darworms.dwsettings.alphaColorTable[pickTarget.wormColorIndex];

    wGraphics.strokeStyle = fillColorString;

    wGraphics.lineWidth = 4;
    wGraphics.setTransform(1.0, 0, 0, 1.0, 0, 0);
    wGraphics.beginPath();
    var xloc = ((this.xPts[pickTarget.dir] * gameCanvas.width() * .75) / 2) + (gameCanvas.width() / 2);
    var yloc = ((this.yPts[pickTarget.dir] * gameCanvas.height() * .75) / 2) + (gameCanvas.height() / 2);

    wGraphics.arc(xloc, yloc, 20, 0, Math.PI * 2, false);
    wGraphics.closePath();
    wGraphics.stroke();

    wGraphics.strokeStyle = fillColorString;
    wGraphics.lineWidth = 2;
    wGraphics.moveTo(xloc, yloc);
    wGraphics.beginPath();
    wGraphics.moveTo(xloc, yloc);
    var animFraction = 1.0 * (darworms.graphics.animFrame & 0x7F) / 128;
    wGraphics.lineTo(
      (xloc + ((screenCoordinates.x - xloc) * animFraction)),
      (yloc + ((screenCoordinates.y - yloc) * animFraction)));

    wGraphics.closePath();
    wGraphics.stroke();
    wGraphics.restore();
  }
  Game.prototype.drawPickCells = function() {
    var animFraction = 1.0 * (darworms.graphics.animFrame & 0x7F) / 128;
    if ((darworms.dwsettings.pickDirectionUI == 1) && (animFraction < 0.1)) {
      darworms.theGame.clearCanvas();
      darworms.theGame.drawCells(); // shound use backbuffer instead of redrawing?
    };

    darworms.pickCells.forEach(function(pickTarget) {
      darworms.theGame.drawPickCell(pickTarget.pos, pickTarget.color);
    });
    darworms.theGame.drawPickCellOrigin(focusWorm.pos,
      darworms.dwsettings.alphaColorTable[focusWorm.colorIndex]);

    if (darworms.dwsettings.pickDirectionUI == 1) {
      darworms.pickCells.forEach(function(pickTarget) {
        darworms.theGame.drawExpandedTarget(pickTarget);
      });
    }

    this.worms.forEach(function(worm, index) {
      darworms.theGame.highlightWorm(worm, index);
    }, darworms.theGame);
  }

  Game.prototype.drawCells = function() {
    wGraphics.save();
    for (var col = 0; col < this.grid.width; col = col + 1) {
      for (var row = 0; row < this.grid.height; row = row + 1) {
        this.drawCell(new Point(col, row));
      }
    }
    wGraphics.restore();
  };
  Game.prototype.drawDirtyCells = function() {
    var pt;
    // wGraphics.save();
    // console.log(" Grawing dirty cells" + this.dirtyCells.length);
    while ((pt = this.dirtyCells.pop()) !== undefined) {
      this.drawCell(pt);
    }
    // wGraphics.restore();
  };

  Game.prototype.animateDyingWorms = function() {
    for (var i = 0; i < 4; i = i + 1) {
      // We don't want to do the animates in the same order ever frame because
      // when tow worms die together the second's animations would always overwite
      // the first's/

      var whichWorm = ((i + darworms.graphics.uiFrames) & 0x3);
      if (this.worms[whichWorm].state == darworms.wormStates.dying) {
        this.animateDyingCell(this.worms[whichWorm]);
      }
    }
  }


  Game.prototype.animateDyingCell = function(worm) {
    this.drawCell(worm.pos);
    this.drawShrikingOutline(worm);
  }
  Game.prototype.drawShrikingOutline = function(worm) {
    var animFraction = (darworms.graphics.dyningAnimationFrames - (darworms.graphics.uiFrames - worm.diedAtFrame)) /
      darworms.graphics.dyningAnimationFrames;
    darworms.theGame.gsetTranslate(worm.pos);

    wGraphics.strokeStyle = darworms.dwsettings.alphaColorTable[worm.colorIndex];
    wGraphics.lineWidth = .1;
    wGraphics.fillStyle = darworms.dwsettings.alphaColorTable[worm.colorIndex];
    wGraphics.beginPath();
    wGraphics.moveTo(darworms.graphics.vertex_x[0] * animFraction, darworms.graphics.vertex_y[0] * animFraction);
    for (var j = 1; j < 6; j = j + 1) {
      wGraphics.lineTo(darworms.graphics.vertex_x[j] * animFraction, darworms.graphics.vertex_y[j] * animFraction);
    }
    wGraphics.lineTo(darworms.graphics.vertex_x[0] * animFraction, darworms.graphics.vertex_y[0] * animFraction);
    //wGraphics.stroke();
    wGraphics.closePath();
    wGraphics.stroke();
    //wGraphics.fill();
    // wGraphics.stroke();
  }

  Game.prototype.clearCanvas = function() {
    // Store the current transformation matrix
    wGraphics.save();
    // Use the identity matrix while clearing the canvas
    wGraphics.setTransform(1, 0, 0, 1, 0, 0);
    wGraphics.clearRect(0, 0, gameCanvas.width(), gameCanvas.height());
    wGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
    wGraphics.fillRect(0, 0, gameCanvas.width(), gameCanvas.height());

    // Restore the transform
    wGraphics.restore();
    //    wGraphics.clearRect(0,0,canvas.width,canvas.height);
  };


  Game.prototype.initGame = function() {
    this.clearCanvas();
    this.grid.clear();
    this.drawCells();
    this.elapsedTime = -new Date().getTime();
    this.frameTimes.length = 0;
    this.startFrameTimes.length = 0;
    this.numMoves = 0;
    this.numTurns = 0;
    this.timeInDraw = 0;

  };
  Game.prototype.addWorm = function(w) {
    w.pos = this.origin;
    w.nMoves = 0;
    w.score = 0;
    w.state = darworms.wormStates.paused;
    this.worms.push(w);
  };
  Game.prototype.getAvePos = function(w) {
    var nActiveAve = 0;
    this.avePos.x = 0;
    this.avePos.y = 0;

    for (var i = 0; i < this.worms.length; i = i + 1) {
      var active = this.worms[i];
      if (active.state === darworms.wormStates.moving) {
        this.avePos.x = this.avePos.x + active.pos.x;
        this.avePos.y = this.avePos.y + active.pos.y;
        nActiveAve = nActiveAve + 1;
      }
    }

    if (nActiveAve > 1) {
      this.avePos.x = Math.floor(this.avePos.x / nActiveAve);
      this.avePos.y = Math.floor(this.avePos.y / nActiveAve);
    }
    // console.log(this.avePos.format());
  };

  Game.prototype.makeMove = function(graphicsOn) {
    var nAlive = 0;
    if (this.gameState === darworms.gameStates.waiting) {
      return;
    }
    // console.log ("Game  StartingTurn " + this.numTurns );
    for (var i = nextToMove; i < this.worms.length; i = i + 1) {
      var active = this.worms[i];
      darworms.theGame.activeIndex = i;
      // console.log (" GamemakeMove   for worm" + i + " :  " + darwormd.wormStateNames[active.state] + " at "  + active.pos.format());
      if (active.state === darworms.wormStates.sleeping) {
        continue;
      }
      // active.state = darworms.wormStates.moving;
      // console.log (" Game  Before Move for worm" + i + " :  " + active.state + " at "  + active.pos.format());
      // active.log();
      // console.log ( "   Grid value =  ");
      // this.grid.logValueAt(active.pos);
      var currentState = this.grid.stateAt(active.pos);
      // console.log (" Current State = " + currentState);
      if (currentState == 0x3F) {
        // last sample is death sound
        if ((active.state != (darworms.wormStates.dead) && (active.state != darworms.wormStates.dying))) {
          if (darworms.dwsettings.doAnimations) {
            if ((darworms.dwsettings.doAudio == 1) && darworms.audioSamples[darworms.audioSamples.length - 1]) {
              darworms.audioSamples[darworms.audioSamples.length - 1].playSample(1.0, 0.0);
            }
          }
          active.state = (darworms.dwsettings.doAnimations)? darworms.wormStates.dying : darworms.wormStates.dead;
          active.diedAtFrame = darworms.graphics.uiFrames;
          console.log(" darworm " + active.colorIndex + " dying at frame: " + darworms.graphics.animFrame);
        }

      if (active.state == darworms.wormStates.dying) {
        if ((darworms.graphics.uiFrames - active.diedAtFrame) > darworms.graphics.dyningAnimationFrames) {
          active.state = darworms.wormStates.dead;
          console.log(" darworm " + active.colorIndex + " dead at frame: " + darworms.graphics.animFrame);
        }
      }

    } else {
      var direction = active.getMoveDir(currentState);
      if (direction === darworms.dwsettings.codons.unSet) {
        this.gameState = darworms.gameStates.waiting;
        // console.log(" setting gamestate to  " + this.gameState);
        focusPoint = active.pos;
        focusWorm = active;
        darworms.theGame.focusWorm = active;
        focusValue = currentState;
        if (darworms.theGame.focusWorm.showTutorial) {
          $("input[type='checkbox']").attr("checked",false);
          var themes = ["c", "d", "e", "f"];
          var btns = [ '#p1button', '#p2button', '#p3buton', '#p4button'];
          // ToDo  set proper theme for popup   red green blue ye
          // Setter
          // $('#tutorialpopup' ).popup( "option", "overlayTheme", "d" );
          $('#tutorialpopup').popup( "option", "theme", themes[darworms.theGame.activeIndex] );
          // this makes the popup background transparent, but it looks reall bad
          // $('#tutorialpopup').popup( "option","theme", 'none' );
          $('#tutorialpopup').popup("open",  {positionTo: btns[darworms.theGame.activeIndex]});
        }
        nextToMove = i;
        this.numMoves = this.numMoves + 1;
        active.nMoves = active.nMoves + 1;
        this.drawDirtyCells();
        this.initPickUI(active);
        return (true);
      }
      if (true || graphicsOn) {
        this.dirtyCells.push(active.pos);

      }
      // console.log (" Move Direction = " + direction);
      var next = this.grid.next(active.pos, direction);
      if (next.isEqualTo(darworms.dwsettings.noWhere)) { // fell of edge of world
        active.state = darworms.wormStates.dead;
        active.died = true;
      } else {
        var didScore = this.grid.move(active.pos, next, direction, active.colorIndex);
        active.score = active.score + didScore;
        this.numMoves = this.numMoves + 1;
        active.nMoves = active.nMoves + 1;
        // console.log("    Worm " + active.colorIndex + "  just made move " + active.nMoves + " game turn " + this.numTurns + " From " + this.grid.formatStateAt(active.pos) + " direction  " + direction);
        active.pos = next;

        if (true || graphicsOn) {
          this.dirtyCells.push(next);
          if (darworms.dwsettings.doAudio == 1  && graphicsOn) {
            if ((active.audioSamplesPtrs[direction] !== undefined) && (active.audioSamplesPtrs[direction] >= 0)) {
              darworms.audioSamples[active.audioSamplesPtrs[direction]].
              playSample(
                darworms.audioPlaybackRates[active.MusicScale[(didScore == 1) ? 6 : direction]],
                (active.pos.x - (darworms.theGame.grid.width / 2)) / (darworms.theGame.grid.width / 2));
            }
          }

        }

        // console.log(" active.score [" +  i + "] ="  + active.score);

        //console.log("     From Value is " +  this.grid.hexValueAt(active.pos)  );
        //console.log (" Next Point = " + next.format());
        //console.log(" Set To State to " +  this.grid.stateAt(active.pos)  );
        //console.log("     To Value is " +  this.grid.hexValueAt(active.pos)  );
      }

    }
    if ((active.state !== darworms.wormStates.dead)) {
      nAlive = nAlive + 1;
    }
    //console.log (" Game  After Move for worm" + i + " :  " + active.state + " at "  + active.pos.format());
    // this.grid.logValueAt(active.pos);
  }
  nextToMove = 0;
  this.numTurns = this.numTurns + 1;
  return (nAlive > 0 || (nextToMove !== 0));
};

Game.prototype.initPickUI = function(worm) {

  console.log(" initPickUI")
  darworms.pickCells = new Array();
  var outvec = this.grid.outVectorsAt(worm.pos);
  var inVec = this.grid.inVectorsAt(worm.pos);
  // console.log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

  for (var dir = 0; dir < 6; dir = dir + 1) {
    if (((outvec & darworms.outMask[dir]) == 0) && ((inVec & darworms.outMask[dir]) == 0)) {
      var pickTarget = {};
      pickTarget.pos = this.grid.next(worm.pos, dir);
      pickTarget.dir = dir;
      pickTarget.color = darworms.dwsettings.alphaColorTable[focusWorm.colorIndex];
      pickTarget.wormColorIndex = focusWorm.colorIndex;
      darworms.pickCells.push(pickTarget);
    }
  }
}

Game.prototype.showTimes = function() {
  var min = 100000000;
  var max = 0;
  var ave = 0;
  var nFrames = 0;
  var sumTime = 0;
  var fps = 0;
  console.log("this.frameTimes.length " + this.frameTimes.length);
  for (var i = 0; i < this.frameTimes.length; i = i + 1) {
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
    ave = Math.round(sumTime / nFrames * 100) / 100;
  }
  var totalElapsed = new Date().getTime() - this.startFrameTimes[0];
  var percentDrawing = Math.round((sumTime * 100 / totalElapsed * 100)) / 100;
  // var percentDrawing = (sumTime * 100 / totalElapsed);

  if (this.elapsedTime > 0) {
    fps = Math.round(nFrames * 1000 / this.elapsedTime * 100) / 100;
  }
  document.getElementById('wormframes').innerHTML = nFrames;
  document.getElementById('wormmintime').innerHTML = min;
  document.getElementById('wormmaxtime').innerHTML = max;
  document.getElementById('wormavetime').innerHTML = ave;
  document.getElementById('wormframetargettime').innerHTML = 1000 / $("#fps").val();

  document.getElementById('wormfps').innerHTML = fps;
  //  frame Intervals.  How often did out update get called
  min = 1000000;
  max = 0;
  nFrames = 0;
  sumTime = 0;
  ave = 0;
  var delta = 0;
  for (i = 1; i < this.startFrameTimes.length; i = i + 1) {
    nFrames = nFrames + 1;
    delta = this.startFrameTimes[i] - this.startFrameTimes[i - 1];
    if (delta > max) {
      max = delta;
    }
    if (delta < min) {
      min = delta;
    }
    sumTime = sumTime + delta;
  }
  if (nFrames > 0) {
    ave = Math.round(sumTime / nFrames * 100) / 100;
  }
  document.getElementById('wormframemintime').innerHTML = min;
  document.getElementById('wormframemaxtime').innerHTML = max;
  document.getElementById('wormframeavetime').innerHTML = ave;
  document.getElementById('wormframepercenttime').innerHTML = percentDrawing;
  document.getElementById('wormframetotaltime').innerHTML = this.timeInDraw / 1000;


};

// Converts canvas to an image
Game.prototype.convertCanvasToImage = function(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}


var reScale = function(gridWidth, gridHeight) {
  this.scale = new Point(((gameCanvas.width()) / (gridWidth + 1.5)), ((gameCanvas.height()) / (gridHeight + 1)));
console.log(" reScaled to " + this.scale.format());
};

// end of Module prototypes

//  Called from Timer Loop

var clearScore = function(segmentIndex, totalSegments) {
  var segWidth = darworms.dwsettings.scoreCanvas.width / totalSegments;
  scorectx.fillStyle = "rgba(222,222,222, 1.0)";
  scorectx.shadowOffsetX = 0;
  scorectx.shadowOffsetY = 0;

  scorectx.fillRect(segWidth * segmentIndex, 0, segWidth, darworms.dwsettings.scoreCanvas.height);
}
var scoreStartx = function(segmentIndex, totalSegments, text) {
  var segWidth = darworms.dwsettings.scoreCanvas.width / totalSegments;
  var twidth = scorectx.measureText(text).width;
  return ((segWidth * segmentIndex) + (segWidth / 2) - (twidth / 2));

}
var updateScores = function() {
  var i;
  for (i = 0; i < 4; i++) {
    if (darworms.theGame.worms[i] !== undefined && darworms.theGame.worms[i].shouldDrawScore()) {
      clearScore(i, 4);
      scorectx.fillStyle = darworms.dwsettings.colorTable[i + 1];
      // scorectx.shadowOffsetX = 3;
      // scorectx.shadowOffsetY = 3;
      scorectx.fillText(darworms.theGame.worms[i].score, scoreStartx(i, 4, darworms.theGame.worms[i].score.toString()), 15);
    }
  }
};
var makeMoves = function() {
  // console.log(" makeMoves theGameOver " + theGameOver +  "  gameState " + gameStateNames[theGame.gameState] );
  var startTime = new Date().getTime();
  darworms.theGame.startFrameTimes.push(startTime);
  if (darworms.theGame.needsRedraw) {
    darworms.theGame.drawCells();
    darworms.theGame.needsRedraw = false;
    // wGraphics.drawImage(localImage, 10, 10);

  }
  if (darworms.theGame.gameState != darworms.gameStates.over) {
    if (darworms.theGame.makeMove(darworms.dwsettings.doAnimations) === false) {
      darworms.theGame.elapsedTime = darworms.theGame.elapsedTime + new Date().getTime();
      console.log(" Game Over");
      clearInterval(darworms.graphics.timer);
      // document.getElementById("startpause").innerHTML = "Start Game";
      $("#startpause").text("Start Game");
      darworms.theGame.showTimes();
      updateScores();
      darworms.theGame.gameState = darworms.gameStates.over;

    }
  }
  if (darworms.dwsettings.doAnimations) {
    darworms.theGame.drawDirtyCells();
    darworms.theGame.animateDyingWorms();
    darworms.theGame.getAvePos();
  }
  updateScores();
  var elapsed = new Date().getTime() - startTime;
  darworms.theGame.frameTimes.push(elapsed);
};
// Called from user actions
var selectDirection = function(point) {
  ((darworms.dwsettings.pickDirectionUI == 1)) ? selectLargeUIDirection(point):
    selectSmallUIDirection(point);
}

var selectSmallUIDirection = function(touchPoint) {
  // we should be able to bind the forEach to this instead using darworms.theGame
  darworms.pickCells.forEach(function(pickTarget) {
    var screenCoordinates = this.getOffset(pickTarget.pos);
    var absdiff = touchPoint.absDiff(screenCoordinates);
    var diff = new Point(touchPoint.x - screenCoordinates.x, touchPoint.y - screenCoordinates.y);
    if ((absdiff.x < (this.scale.x / 2)) && (absdiff.y < (this.scale.y / 2)) &&
      this.gameState === darworms.gameStates.waiting) {
      console.log(" target hit delta: " + diff.format());
      setDNAandResumeGame(pickTarget.dir);
    }
  }, darworms.theGame);

}

var selectLargeUIDirection = function(point) {
  // console.log( "selectDirection: " + point.format());
  var outvec = darworms.theGame.grid.stateAt(focusPoint);
  var minDist = 100000;
  var dist;
  var select = -1;
  for (var i = 0; i < 6; i = i + 1) {
    if ((outvec & darworms.outMask[i]) === 0) {
      const target = new Point(
        (((darworms.theGame.xPts[i] * gameCanvas.width() * .75) / 2) + (gameCanvas.width() / 2)),
        (((darworms.theGame.yPts[i] * gameCanvas.height() * .75) / 2) + (gameCanvas.height() / 2)));

      // console.log(" direction: " + i + " target point " + target.format());
      // console.log("Touch Point: " + point.format());
      dist = target.dist(point);
      //  Actual pixel coordinates
      if (dist < minDist) {
        minDist = dist;
        select = i;
      }
      // console.log("selectDirection i: " + i + "  dist: " + dist + " Min Dist:" + minDist);
    }
  }
  if ((minDist < gameCanvas.width() / 8) && (select >= 0)) {
    setDNAandResumeGame(select);
  }
};

var setDNAandResumeGame = function(direction) {
  focusWorm.dna[focusValue & 0x3F] = direction;
  focusWorm.numChoices += 1;
  darworms.theGame.gameState = darworms.gameStates.running;
  darworms.theGame.clearCanvas();
  darworms.theGame.drawCells();
}

function init() {
  // used to initialize variables in this module's closure
  console.log(" darworms.main.wCanvas,width: " + darworms.main.wCanvas.width);
  gameCanvas = $('#wcanvas');
  console.log(" gameCanvas.width() " + darworms.main.wCanvas.width);

  wGraphics = darworms.main.wGraphics;
  nextToMove = 0;
  window.scoreCanvas = document.getElementById("scorecanvas");
  scorectx = darworms.dwsettings.scoreCanvas.getContext("2d");
  scorectx.font = "bold 18px sans-serif";
  scorectx.shadowColor = "rgb(190, 190, 190)";
  scorectx.shadowOffsetX = 3;
  scorectx.shadowOffsetY = 3;



}
return {
  // these are the public methods for gameModule
  Game: Game,
  init: init,
  reScale: reScale,
  makeMoves: makeMoves,
  selectDirection: selectDirection,
  updateScores: updateScores
};

})(); /* end of Game */
