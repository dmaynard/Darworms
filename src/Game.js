//  Game.js
import {
  Point
} from "./Point.js";
import {
  darworms
} from "./loader.js";
import {
  Grid
} from "./Grid.js";
import {
  drawdna
} from "./drawdna.js";
import {
  getOffset,
  gsetTranslate,
  setGrid
} from "./graphics.js"
import {
  wGraphics,
  wCanvas,
  setScale,
  scale,
  drawcell,
  showTimes,
  frameTimes,
  startFrameTimes,
  startGameTimer,
  stopGameTimer,
  highlightWorm,
  drawPickCell,
  drawPickCellOrigin,
  drawExpandedTarget,
  drawPickCells,
  drawCells,
  graphicsInit,
  drawDirtyCells,
  pushDirtyCell,
  animateDyingWorms,
  clearCanvas,
  initPickUI
} from "./graphics.js";
/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:15 AM
 * To change this template use File | Settings | File Templates.
 */

// This module needs to separated into separate  UI(graphics) and game logic modules
var gameCanvas;

var nextToMove;
var focusPoint;
var focusWorm;
var focusValue;
var scorectx;
// the jump from full pan left (-1.0) to full pan right (+1.0)
// is too jaring. This limits pan to [-.8 , +.8]
// Could be a setting  (pan effect 0 - 1)
const maxpan = 0.8;

export class Game {
  constructor(gridWidth, gridHeight) {

    wCanvas.width = darworms.wCanvasPixelDim.x;
    wCanvas.height = darworms.wCanvasPixelDim.y;


    this.gameState = darworms.gameStates.over;
    this.grid = new Grid(gridWidth, gridHeight);
    setGrid(this.grid, this);

    this.numTurns = 0;
    this.numMoves = 0;
    this.activeIndex = 0;

    // this.scale = new Point(((gameCanvas.width()) / (gridWidth + 1.5)), ((gameCanvas.height()) / (gridHeight + 1)));
    setScale(gridWidth, gridHeight);
    console.log(" new Game scale set to " + scale.format());
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
    if ((scale.x) < 20 || (scale.y < 20)) {
      $('#pickDirectionUI').slider().val(1);
      $('#pickDirectionUI').slider("refresh");
      darworms.dwsettings.pickDirectionUI = "1";
    }
    console.log(" Scale: " + scale.format() + "darworms.dwsettings.pickDirectionUI" + 1);
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

  updateScale(width, height) {
    setScale(this.grid.width, this.grid.height);

    console.log("updateScale " + scale.format());
  };

  log() {

    console.log(" Game grid size  " + new Point(this.grid.width, this.grid.height).format());
    console.log(" Game Canvas size  " + new Point(gameCanvas.width(), gameCanvas.height()).format());
    console.log(" Game scale " + scale.format());
    for (var i = 0; i < this.worms.length; i = i + 1) {
      console.log(" Game worm " + i + " :  " + this.worms[i].state + " at " + this.worms[i].pos.format() + " value:" + this.grid.hexValueAt(this.worms[i].pos));
      // this.worms[i].log();
      // console.log ( "   Grid value =  ");
      // this.grid.logValueAt(this.worms[i].pos);
    }
  };
  printNonEmpty() {

    this.grid.each(function(point, value) {
      if (value > 0) {
        console.log("NonEmpty " + point.format() + " value: 0x" + value.toString(16));
      }
    });

  };

  /*  TODO  move all drawing from game to graphics.js

   */


  initGame() {
    clearCanvas();
    this.grid.clear();
    setGrid(this.grid, this)
    drawCells();
    startGameTimer();
    this.numMoves = 0;
    this.numTurns = 0;
    this.timeInDraw = 0;

  };
  addWorm(w) {
    w.pos = this.origin;
    w.nMoves = 0;
    w.score = 0;
    w.state = darworms.wormStates.paused;
    this.worms.push(w);
  };
  getAvePos(w) {
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

  makeMove(graphicsOn) {
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
          active.state = (darworms.dwsettings.doAnimations) ? darworms.wormStates.dying : darworms.wormStates.dead;
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
            $("input[type='checkbox']").attr("checked", false);
            var themes = ["c", "d", "e", "f"];
            var btns = ['#p1button', '#p2button', '#p3buton', '#p4button'];
            // ToDo  set proper theme for popup   red green blue ye
            // Setter
            // $('#tutorialpopup' ).popup( "option", "overlayTheme", "d" );
            $('#tutorialpopup').popup("option", "theme", themes[darworms.theGame.activeIndex]);
            // this makes the popup background transparent, but it looks reall bad
            // $('#tutorialpopup').popup( "option","theme", 'none' );
            console.log(" init popup here");
            drawdna(document.getElementById('popupcanvas'), active, currentState);
            $('#tutorialpopup').popup("open", {
              positionTo: btns[darworms.theGame.activeIndex]
            });
          }
          nextToMove = i;
          this.numMoves = this.numMoves + 1;
          active.nMoves = active.nMoves + 1;
          drawDirtyCells();
          initPickUI(active);
          return (true);
        }
        if (true || graphicsOn) {
          pushDirtyCell(active.pos);
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
            pushDirtyCell(next);
            if (darworms.dwsettings.doAudio == 1 && graphicsOn) {
              let panValue = maxpan * ((active.pos.x - (darworms.theGame.grid.width / 2)) / (darworms.theGame.grid.width / 2));
              if ((active.audioSamplesPtrs[direction] !== undefined) && (active.audioSamplesPtrs[direction] >= 0)) {
                darworms.audioSamples[active.audioSamplesPtrs[direction]].
                playSample(
                  darworms.audioPlaybackRates[active.MusicScale[(didScore == 1) ? 6 : direction]],
                  panValue);
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




  // Converts canvas to an image
  convertCanvasToImage(canvas) {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
  }
}

export function binToRGB(bin) {
  return {
    r: parseInt(((bin >> 16) & 0xFF)),
    g: parseInt(((bin >> 8) & 0xFF)),
    b: parseInt(((bin) & 0xFF))
  };
}

function reScale(gridWidth, gridHeight) {
  setScale(gridWidth, gridHeight);
  console.log(" reScaled to " + scale.format());
};

// end of Module prototypes

//  Called from Timer Loop

function clearScore(segmentIndex, totalSegments) {
  var segWidth = darworms.dwsettings.scoreCanvas.width / totalSegments;
  scorectx.fillStyle = "rgba(222,222,222, 1.0)";
  scorectx.shadowOffsetX = 0;
  scorectx.shadowOffsetY = 0;

  scorectx.fillRect(segWidth * segmentIndex, 0, segWidth, darworms.dwsettings.scoreCanvas.height);
}

function scoreStartx(segmentIndex, totalSegments, text) {
  var segWidth = darworms.dwsettings.scoreCanvas.width / totalSegments;
  var twidth = scorectx.measureText(text).width;
  return ((segWidth * segmentIndex) + (segWidth / 2) - (twidth / 2));

}

function updateScores() {
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

function makeMoves() {
  // console.log(" makeMoves theGameOver " + theGameOver +  "  gameState " + gameStateNames[theGame.gameState] );
  var startTime = new Date().getTime();
  startFrameTimes.push(startTime);
  if (darworms.theGame.needsRedraw) {
    drawCells();
    darworms.theGame.needsRedraw = false;
    // wGraphics.drawImage(localImage, 10, 10);

  }
  if (darworms.theGame.gameState != darworms.gameStates.over) {
    if (darworms.theGame.makeMove(darworms.dwsettings.doAnimations) === false) {
      stopGameTimer();
      console.log(" Game Over");
      clearInterval(darworms.graphics.timer);
      // document.getElementById("startpause").innerHTML = "Start Game";
      $("#startpause").text("Start Game");
      showTimes();
      updateScores();
      darworms.theGame.gameState = darworms.gameStates.over;

    }
  }
  if (darworms.dwsettings.doAnimations) {
    drawDirtyCells();
    animateDyingWorms();
    darworms.theGame.getAvePos();
  }
  updateScores();
  var elapsed = new Date().getTime() - startTime;
  frameTimes.push(elapsed);
};
// Called from user actions
function selectDirection(point) {
  ((darworms.dwsettings.pickDirectionUI == 1)) ? selectLargeUIDirection(point):
    selectSmallUIDirection(point);
}

function selectSmallUIDirection(touchPoint) {
  // we should be able to bind the forEach to this instead using darworms.theGame
  darworms.pickCells.forEach(function(pickTarget) {
    var screenCoordinates = getOffset(pickTarget.pos);
    var absdiff = touchPoint.absDiff(screenCoordinates);
    var diff = new Point(touchPoint.x - screenCoordinates.x, touchPoint.y - screenCoordinates.y);
    if ((absdiff.x < (scale.x / 2)) && (absdiff.y < (scale.y / 2)) &&
      this.gameState === darworms.gameStates.waiting) {
      console.log(" target hit delta: " + diff.format());
      setDNAandResumeGame(pickTarget.dir);
    }
  }, darworms.theGame);

}

function selectLargeUIDirection(point) {
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

function setDNAandResumeGame(direction) {
  focusWorm.dna[focusValue & 0x3F] = direction;
  focusWorm.numChoices += 1;
  darworms.theGame.gameState = darworms.gameStates.running;
  clearCanvas();
  drawCells();
}

function gameInit() {
  // used to initialize variables in this module's closure
  console.log(" wCanvas,width: " + wCanvas.width);
  gameCanvas = $('#wcanvas');
  console.log(" gameCanvas.width() " + wCanvas.width);
  graphicsInit(this);
  // wGraphics = darworms.main.wGraphics;
  nextToMove = 0;
  window.scoreCanvas = document.getElementById("scorecanvas");
  scorectx = darworms.dwsettings.scoreCanvas.getContext("2d");
  scorectx.font = "bold 18px sans-serif";
  scorectx.shadowColor = "rgb(190, 190, 190)";
  scorectx.shadowOffsetX = 3;
  scorectx.shadowOffsetY = 3;



}

export {
  gameInit,
  reScale,
  makeMoves,
  selectDirection,
  updateScores
}
/* end of Game */
