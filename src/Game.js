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
  initPickUI,
  selectDirection
} from "./graphics.js";

import {
  scoreCanvasInit,
  clearScore,
  updateScores
} from "./scorecanvas.js";

import {
  encodeGame,
  decodeGame,
} from "./gameio.js"

import {
  log
} from "./utils.js"

/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:15 AM
 * To change this template use File | Settings | File Templates.
 */

// This module needs to separated into separate  UI(graphics) and game logic modules

var nextToMove;
var focusPoint;
var focusWorm

// the jump from full pan left (-1.0) to full pan right (+1.0)
// is too jaring. This limits pan to [-.8 , +.8]
// Could be a setting  (pan effect 0 - 1)
const maxpan = 0.8;

export class Game {
  constructor(gridWidth, gridHeight) {

    wCanvas.width = $('#wcanvas').width();
    wCanvas.height = $('#wcanvas').height()


    this.gameState = darworms.gameStates.over;
    this.grid = new Grid(gridWidth, gridHeight);
    setGrid(this.grid, this);

    this.numTurns = 0;
    this.numMoves = 0;
    this.activeIndex = 0;

    setScale(gridWidth, gridHeight);
    log(" new Game scale set to " + scale.format());
    this.origin = new Point(gridWidth >> 1, gridHeight >> 1);
    focusPoint = this.origin;
    this.worms = [];
    this.needsRedraw = true;
    this.avePos = new Point(0, 0);
    // worm index of zero means unclaimed.
    this.focusWorm = null;
    this.focusValure = null;

    this.xPts = [1.0, 0.5, -0.5, -1.0, -0.5, 0.5];
    this.yPts = [0.0, 1.0, 1.0, 0.0, -1.0, -1.0];

    // variable for animating zoom in to selection UI
    // create back buffer image  for current grid image

    // this should depend on scale factor.  On small screens
    // we cshould set pickDirectionUI to true
    if ((scale.x) < 20 || (scale.y < 20)) {
      $('#pickDirectionUI').slider().val(1);
      $('#pickDirectionUI').slider("refresh");
      darworms.dwsettings.pickDirectionUI = 1;
    }
    log(" Scale: " + scale.format() + "darworms.dwsettings.pickDirectionUI: " + darworms.dwsettings.pickDirectionUI);
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

    log("updateScale " + scale.format());
  };

  log() {

    log(" Game grid size  " + new Point(this.grid.width, this.grid.height).format());
    log(" Game Canvas size  " + new Point(wCanvas.width, wCanvas.height).format());
    log(" Game scale " + scale.format());
    for (var i = 0; i < this.worms.length; i = i + 1) {
      log(" Game worm " + i + " :  " + this.worms[i].state + " at " + this.worms[i].pos.format() + " value:" + this.grid.hexValueAt(this.worms[i].pos));
      // this.worms[i].log();
      // log ( "   Grid value =  ");
      // this.grid.logValueAt(this.worms[i].pos);
    }
  };
  printNonEmpty() {

    this.grid.each(function(point, value) {
      if (value > 0) {
        log("NonEmpty " + point.format() + " value: 0x" + value.toString(16));
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
    // log(this.avePos.format());
  };

  makeMove(graphicsOn) {
    var nAlive = 0;
    if (this.gameState === darworms.gameStates.waiting) {
      return;
    }
    // log ("Game  StartingTurn " + this.numTurns );
    for (var i = nextToMove; i < this.worms.length; i = i + 1) {
      var active = this.worms[i];
      darworms.theGame.activeIndex = i;
      // log (" GamemakeMove   for worm" + i + " :  " + darwormd.wormStateNames[active.state] + " at "  + active.pos.format());
      if (active.state === darworms.wormStates.sleeping) {
        continue;
      }
      // active.state = darworms.wormStates.moving;
      // log (" Game  Before Move for worm" + i + " :  " + active.state + " at "  + active.pos.format());
      // active.log();
      // log ( "   Grid value =  ");
      // this.grid.logValueAt(active.pos);
      var currentState = this.grid.stateAt(active.pos);
      // log (" Current State = " + currentState);
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
          log(" darworm " + active.colorIndex + " dying at frame: " + darworms.graphics.animFrame);
        }

        if (active.state == darworms.wormStates.dying) {
          if ((darworms.graphics.uiFrames - active.diedAtFrame) > darworms.graphics.dyningAnimationFrames) {
            active.state = darworms.wormStates.dead;
            log(" darworm " + active.colorIndex + " dead at frame: " + darworms.graphics.animFrame);
          }
        }

      } else {
        var direction = active.getMoveDir(currentState);
        if (direction === darworms.dwsettings.codons.unSet) {
          this.gameState = darworms.gameStates.waiting;
          // log(" setting gamestate to  " + this.gameState);
          focusPoint = active.pos;
          focusWorm = active;
          darworms.theGame.focusWorm = active;
          darworms.theGame.focusValue = currentState;
          if (darworms.theGame.focusWorm.showTutorial) {
            $("input[type='checkbox']").attr("checked", false);
            var btns = ['#p1button', '#p2button', '#p3buton', '#p4button'];
            // ToDo  set proper theme for popup   red green blue ye
            // Setter
            // $('#tutorialpopup' ).popup( "option", "overlayTheme", "d" );
            $('#tutorialpopup').popup("option", "theme", darworms.themes[darworms.theGame.activeIndex]);
            // this makes the popup background transparent, but it looks reall bad
            // $('#tutorialpopup').popup( "option","theme", 'none' );
            log(" init popup here");
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
        // log (" Move Direction = " + direction);
        var next = this.grid.next(active.pos, direction);
        if (next.isEqualTo(darworms.dwsettings.noWhere)) { // fell of edge of world
          active.state = darworms.wormStates.dead;
          active.died = true;
        } else {
          var didScore = this.grid.move(active.pos, next, direction, active.colorIndex);
          active.score = active.score + didScore;
          this.numMoves = this.numMoves + 1;
          active.nMoves = active.nMoves + 1;
          // log("    Worm " + active.colorIndex + "  just made move " + active.nMoves + " game turn " + this.numTurns + " From " + this.grid.formatStateAt(active.pos) + " direction  " + direction);
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

          // log(" active.score [" +  i + "] ="  + active.score);

          //log("     From Value is " +  this.grid.hexValueAt(active.pos)  );
          //log (" Next Point = " + next.format());
          //log(" Set To State to " +  this.grid.stateAt(active.pos)  );
          //log("     To Value is " +  this.grid.hexValueAt(active.pos)  );
        }

      }
      if ((active.state !== darworms.wormStates.dead)) {
        nAlive = nAlive + 1;
      }
      //log (" Game  After Move for worm" + i + " :  " + active.state + " at "  + active.pos.format());
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

// end of Module prototypes

//  Called from Timer Loop

function makeMoves() {
  // log(" makeMoves theGameOver " + theGameOver +  "  gameState " + gameStateNames[theGame.gameState] );
  var startTime = new Date().getTime();
  startFrameTimes.push(startTime);
  if (darworms.theGame.needsRedraw) {
    drawCells();
    darworms.theGame.needsRedraw = false;
  }
  if (darworms.theGame.gameState != darworms.gameStates.over) {
    if (darworms.theGame.makeMove(darworms.dwsettings.doAnimations) === false) {
      stopGameTimer();
      log(" Game Over");
      clearInterval(darworms.graphics.timer);
      // document.getElementById("startpause").innerHTML = "Start Game";
      $("#startpause").text("Start Game");
      showTimes();
      updateScores(darworms.theGame.worms);
      darworms.theGame.gameState = darworms.gameStates.over;
      darworms.gameTxt = encodeGame( darworms.theGame, darworms.dwsettings, darworms.graphics, darworms.version);
      // decodeGame(gameTxt);
      // darworms.main.injectSettings(gameTxt);
    }
  }
  if (darworms.dwsettings.doAnimations) {
    drawDirtyCells();
    animateDyingWorms();
    darworms.theGame.getAvePos();
  }
  updateScores(darworms.theGame.worms);
  var elapsed = new Date().getTime() - startTime;
  frameTimes.push(elapsed);
};
// Called from user actions


function gameInit() {
  // used to initialize variables in this module's closure
  log(" wCanvas,width: " + wCanvas.width);
  graphicsInit(this);
  scoreCanvasInit();
  nextToMove = 0;

}

export {
  gameInit,
  reScale,
  makeMoves,
  selectDirection,
  updateScores
}
/* end of Game */
