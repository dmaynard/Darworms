import {
  Point
} from "./Point.js";
import {
  darworms
} from "./loader.js";
import {
  log,
  logging
} from "./utils.js"

export var wGraphics;
export var wCanvas;
export var scale; // this really shouldm't be needed eleswhere
var gridSize = new Point(0, 0);
var grid; // module global passed in at init time

let xPts = [1.0, 0.5, -0.5, -1.0, -0.5, 0.5];
let yPts = [0.0, 1.0, 1.0, 0.0, -1.0, -1.0];
let asterixSize = 0.2;
let timeInDraw = 0;
let gameElapsedTime = 0;
export let frameTimes = [];
export let startFrameTimes = [];
let theGame = null;
export function graphicsInit(game) {
  wCanvas = document.getElementById("wcanvas");
  wGraphics = wCanvas.getContext("2d");
  resizeCanvas()

}
export function setGrid(currentGrid, game) {
  grid = currentGrid;
  timeInDraw = 0;
  frameTimes.length = 0;
  startFrameTimes.length = 0;
  theGame = game;

}

export function setScale(gridWidth, gridHeight) {
  scale = new Point((wCanvas.width / (gridWidth + 1.5)), (wCanvas.height / (gridHeight + 1)));
  gridSize = new Point(gridWidth, gridHeight);
}
export function reScale(gridWidth, gridHeight) {
  setScale(gridWidth, gridHeight);
  if (logging()) console.log(" reScaled to " + scale.format());
};

export function clearCanvas() {
  // Store the current transformation matrix
  wGraphics.save();
  // Use the identity matrix while clearing the canvas
  wGraphics.setTransform(1, 0, 0, 1, 0, 0);
  wGraphics.clearRect(0, 0, wCanvas.width, wCanvas.height);
  wGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
  wGraphics.fillStyle = "#F5F5F500";
  wGraphics.fillRect(0, 0, wCanvas.width, wCanvas.height);

  // Restore the transform
  wGraphics.restore();
  //    wGraphics.clearRect(0,0,canvas.width,canvas.height);
};

export function startGameTimer() {
  gameElapsedTime = -new Date().getTime();
}

export function stopGameTimer() {
  gameElapsedTime += new Date().getTime();
}
export function getOffset(point) {
  var xoff;
  var yoff;
  if ((point.y & 1) === 0) {
    xoff = ((point.x + 0.5) * (scale.x)) + (scale.x / 2);
  } else {
    xoff = ((point.x + 1.0) * (scale.x)) + (scale.x / 2);
  }
  yoff = ((point.y + 0.5) * (scale.y)) + (scale.y / 2);
  return new Point(xoff, yoff);
}

export function gsetTranslate(point) {
  var cellOffset = getOffset(point);
  wGraphics.setTransform(scale.x, 0, 0, scale.y, cellOffset.x, cellOffset.y);
  // if(logging()) console.log( "Drawing cell " +  point.format() + " x= " + cellOffset.x + "  y= " + cellOffset.y);
};


export function drawCells() {
  if (grid) {
    wGraphics.save();
    for (var col = 0; col < grid.width; col = col + 1) {
      for (var row = 0; row < grid.height; row = row + 1) {
        drawcell(new Point(col, row));
      }
    }
    wGraphics.restore();
  }
};
let sprites = [];
// sprite sedcription
// {ts: ,
// }
// [ {point}, [sprite descriptions]]
// anim phases
//   0 grow out from center to edge mid-point
//   1 shrink in from center to edge midpoint
//   2 grow out from edge midpoint to to dest center
//   3 shrink in from edge midpoint to dest centers
export function addSprite(point, dir, phase, colorIndex, ts, te) {
  const sprited = {
    dir: dir,
    phase: phase,
    colorIndex: colorIndex,
    ts: ts,
    te: te
  }
  var added = false;
  sprites.forEach(function(item, idx) {
    if (item.point.isEqualTo(point)) {
      item.spriteds.push(sprited);
      added = true;
    }
  });
  if (!added) {
    sprites.push({
      point: point,
      spriteds: [sprited]
    });
  }
}
let previousTime = 0;
export function animateSprites(now) {
  if (previousTime !== 0) {
    // console.log (now - previousTime , " ms frame");
  }
  previousTime = now;
  sprites.forEach((sprite) => {
    var cell = sprite.point;
    drawcell(sprite.point);
    sprite.spriteds.forEach((sprited) => {
      if (now > sprited.ts && now < sprited.te) {
        var progress = (now - sprited.ts) / (sprited.te - sprited.ts);
        drawSprite(cell, progress, sprited.dir, sprited.phase, sprited.colorIndex)
      }
    })
  })
}

function drawSprite(cell, progress, dir, phase, colorIndex) {
  // console.log ( cell.format() + " progress " + progress + " dir " + dir + " phase " + phase + " colorIndex:  " + colorIndex);
  var outSpokeColor = darworms.dwsettings.spriteColorTable[colorIndex];
  // log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
  wGraphics.strokeStyle = outSpokeColor;
  wGraphics.lineWidth = darworms.graphics.spriteWidth / scale.x;
  wGraphics.lineCap = 'butt';
  if (phase === 0) {
    wGraphics.beginPath();
    wGraphics.moveTo(0, 0);
    wGraphics.lineTo(xPts[dir] * progress / 2.0, yPts[dir] * progress / 2.0);
    wGraphics.stroke();
    wGraphics.closePath();
  }
  if (phase === 1) {
    wGraphics.beginPath();
    wGraphics.moveTo(xPts[dir] * (progress) / 2.0, yPts[dir] * (progress) / 2.0);
    wGraphics.lineTo(xPts[dir] / 2.0, yPts[dir] / 2.0);
    wGraphics.stroke();
    wGraphics.closePath();
  }
  if (phase === 2) {
    wGraphics.beginPath();
    wGraphics.moveTo(xPts[dir] / 2.0, yPts[dir] / 2.0);
    wGraphics.lineTo(xPts[dir] * (1.0 - progress) / 2.0, yPts[dir] * (1.0 - progress) / 2.0);
    wGraphics.stroke();
    wGraphics.closePath();
  }
  if (phase === 3) {
    wGraphics.beginPath();
    wGraphics.moveTo(xPts[dir] * (1.0 - progress) / 2.0, yPts[dir] * (1.0 - progress) / 2.0);
    wGraphics.lineTo(0, 0);
    wGraphics.stroke();
    wGraphics.closePath();
  }
}

export function clearSprites() {
  while ((sprite = sprites.pop()) !== undefined) {
    drawcell(sprite.point);
  }
}
export function drawcell(point) {
  // if (point.isEqualTo(new Point (this.grid.width-1, this.grid.height/2))) {
  //     if(logging()) console.log(this.grid.formatStateAt(point));
  // }
  timeInDraw -= Date.now();
  // wGraphics.save();
  gsetTranslate(point);
  var owner = grid.spokeAt(point, 7);
  wGraphics.lineWidth = 2.0 / scale.x;
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
  // If cell is captured fill the hex with capturing colors
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

  wGraphics.fillStyle = darworms.dwsettings.alphaColorTable[grid.spokeAt(point, 6) & 0xF];


  // wGraphics.fillStyle =  darworms.dwsettings.cellBackground[1-darworms.dwsettings.backGroundTheme];
  wGraphics.lineWidth = 2.0 / scale.x;
  wGraphics.beginPath();
  wGraphics.arc(0, 0, 0.1, 0, Math.PI * 2, true);
  wGraphics.closePath();
  wGraphics.fill();
  //  draw hex outline
  wGraphics.strokeStyle = darworms.dwsettings.cellBackground[1 - darworms.dwsettings.backGroundTheme];
  wGraphics.lineWidth = 2.0 / scale.x;
  wGraphics.beginPath();
  wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
  for (var j = 1; j < 6; j = j + 1) {
    wGraphics.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
  }
  wGraphics.lineTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
  wGraphics.stroke();
  wGraphics.closePath();

  var outvec = grid.outVectorsAt(point);
  var invec = grid.inVectorsAt(point);
  // log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

  for (var i = 0; i < 6; i = i + 1) {
    if ((outvec & darworms.outMask[i]) !== 0) {
      var outSpokeColor = darworms.dwsettings.colorTable[grid.spokeAt(point, i)];
      // log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
      wGraphics.strokeStyle = outSpokeColor;
      wGraphics.lineWidth = 4.0 / scale.x;
      wGraphics.lineCap = 'round';
      wGraphics.beginPath();
      wGraphics.moveTo(0, 0);
      wGraphics.lineTo(xPts[i], yPts[i]);
      wGraphics.stroke();
      wGraphics.closePath();
    }
    if ((invec & darworms.outMask[i]) !== 0) {
      wGraphics.strokeStyle = darworms.dwsettings.colorTable[grid.spokeAt(point, i)];
      wGraphics.lineWidth = 4.0 / scale.x;
      wGraphics.lineCap = 'round';
      wGraphics.beginPath();
      wGraphics.moveTo(xPts[i], yPts[i]);
      wGraphics.lineTo(0, 0);
      wGraphics.stroke();
      wGraphics.closePath();
    }
  }
  if (grid.isSink(point)) {
    wGraphics.strokeStyle = darworms.dwsettings.colorTable[0];
    for (var k = 0; k < 3; k = k + 1) {
      var m = ((k + 3) % 6);
      wGraphics.beginPath();
      wGraphics.moveTo(xPts[k] * asterixSize, yPts[k] * asterixSize);
      wGraphics.lineTo(xPts[m] * asterixSize, yPts[m] * asterixSize);
      wGraphics.stroke();
      wGraphics.closePath();
      wGraphics.lineTo(darworms.graphics.vertex_x[j], darworms.graphics.vertex_y[j]);
    }
  };
  timeInDraw += Date.now();
}

export function highlightWorm(worm, index) {
  if (worm.state === darworms.gameStates.waiting) {
    gsetTranslate(worm.pos);

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

export function initPickUI(worm) {
  darworms.pickCells = new Array();
  var outvec = this.grid.outVectorsAt(worm.pos);
  var inVec = this.grid.inVectorsAt(worm.pos);
  // log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

  for (var dir = 0; dir < 6; dir = dir + 1) {
    if (((outvec & darworms.outMask[dir]) == 0) && ((inVec & darworms.outMask[dir]) == 0)) {
      var pickTarget = {};
      pickTarget.pos = this.grid.next(worm.pos, dir);
      pickTarget.dir = dir;
      pickTarget.color = darworms.dwsettings.alphaColorTable[theGame.focusWorm.colorIndex];
      pickTarget.wormColorIndex = theGame.focusWorm.colorIndex;
      darworms.pickCells.push(pickTarget);
    }
  }
}


export function drawPickCells() {
  var animFraction = 1.0 * (darworms.graphics.animFrame & 0x7F) / 128;
  if ((darworms.dwsettings.pickDirectionUI == 1) && (animFraction < 0.1)) {
    clearCanvas();
    drawCells(); // shound use backbuffer instead of redrawing?
  };

  darworms.pickCells.forEach(function(pickTarget) {
    drawPickCell(pickTarget.pos, pickTarget.color);
  });
  drawPickCellOrigin(darworms.theGame.focusWorm.pos,
    darworms.dwsettings.alphaColorTable[darworms.theGame.focusWorm.colorIndex]);

  if (darworms.dwsettings.pickDirectionUI == 1) {
    darworms.pickCells.forEach(function(pickTarget) {
      drawExpandedTarget(pickTarget);
    });
  }

  darworms.theGame.worms.forEach(function(worm, index) {
    highlightWorm(worm, index);
  }, darworms.theGame);
}


export function drawPickCell(point, activeColor) {
  // wGraphics.save();
  gsetTranslate(point);
  wGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
  // wGraphics.fillRect(-0.5, -0.5, 1.0, 1.0);
  var owner = this.grid.spokeAt(point, 7);
  if (owner !== 0) {
    if (logging()) console.log(" Why is an owned cell a target selection? " + point.format(point));
  }
  drawcell(point); // set up original background for this cell

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
export function drawPickCellOrigin(point, activeColor) {
  // wGraphics.save();
  gsetTranslate(point);
  wGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
  // wGraphics.fillRect(-0.5, -0.5, 1.0, 1.0);
  var owner = this.grid.spokeAt(point, 7);
  if (owner !== 0) {
    if (logging()) console.log(" Why is an owned cell a target selection origin? " + point.format(point));
  }
  drawcell(point); // set up original backgrounf for this cell

  var animFraction = 1.0 * (darworms.graphics.animFrame & 0x3F) / 64;

  wGraphics.strokeStyle = activeColor;
  wGraphics.fillStyle = activeColor;
  var outvec = this.grid.outVectorsAt(point);
  var invec = this.grid.inVectorsAt(point);
  for (var dir = 0; dir < 6; dir = dir + 1) {
    if (((outvec & darworms.outMask[dir]) == 0) && ((invec & darworms.outMask[dir]) == 0)) {


      wGraphics.lineWidth = 3.0 / scale.x;
      wGraphics.lineCap = 'round';
      wGraphics.beginPath();
      wGraphics.moveTo(0, 0);
      wGraphics.lineTo(xPts[dir] * animFraction, yPts[dir] * animFraction);
      wGraphics.stroke();
      wGraphics.closePath();

    }

  }

};
export function drawExpandedTarget(pickTarget) {
  // Draw the up to six large pick targets on screen perimeter
  var screenCoordinates = getOffset(pickTarget.pos);

  wGraphics.save();


  const fillColorString = darworms.dwsettings.alphaColorTable[pickTarget.wormColorIndex];

  wGraphics.strokeStyle = fillColorString;

  wGraphics.lineWidth = 4;
  wGraphics.setTransform(1.0, 0, 0, 1.0, 0, 0);
  wGraphics.beginPath();
  var xloc = ((xPts[pickTarget.dir] * wCanvas.width * .75) / 2) + (wCanvas.width / 2);
  var yloc = ((yPts[pickTarget.dir] * wCanvas.height * .75) / 2) + (wCanvas.height / 2);

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

export function selectDirection(point) {
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
      // if (logging()) console.log(" target hit delta: " + diff.format());
      setDNAandResumeGame(pickTarget.dir);
    }
  }, darworms.theGame);

}

function setDNAandResumeGame(direction) {
  theGame.focusWorm.dna[theGame.focusValue & 0x3F] = direction;
  theGame.focusWorm.numChoices += 1;
  darworms.theGame.gameState = darworms.gameStates.running;
  clearCanvas();
  drawCells();
}

function selectLargeUIDirection(point) {
  // if(logging()) console.log( "selectDirection: " + point.format());
  var outvec = darworms.theGame.grid.stateAt(theGame.focusWorm.pos);
  var minDist = 100000;
  var dist;
  var select = -1;
  for (var i = 0; i < 6; i = i + 1) {
    if ((outvec & darworms.outMask[i]) === 0) {
      const target = new Point(
        (((darworms.theGame.xPts[i] * wCanvas.width * .75) / 2) + (wCanvas.width / 2)),
        (((darworms.theGame.yPts[i] * wCanvas.height * .75) / 2) + (wCanvas.height / 2)));

      // if(logging()) console.log(" direction: " + i + " target point " + target.format());
      // if(logging()) console.log("Touch Point: " + point.format());
      dist = target.dist(point);
      //  Actual pixel coordinates
      if (dist < minDist) {
        minDist = dist;
        select = i;
      }
      // if(logging()) console.log("selectDirection i: " + i + "  dist: " + dist + " Min Dist:" + minDist);
    }
  }
  if ((minDist < wCanvas.width / 8) && (select >= 0)) {
    setDNAandResumeGame(select);
  }
};

export function animateDyingWorms() {
  for (var i = 0; i < 4; i = i + 1) {
    // We don't want to do the animates in the same order ever frame because
    // when tow worms die together the second's animations would always overwite
    // the first's/

    var whichWorm = ((i + darworms.graphics.uiFrames) & 0x3);
    if (theGame.worms[whichWorm].state == darworms.wormStates.dying) {
      animateDyingCell(theGame.worms[whichWorm]);
    }
  }
}

function animateDyingCell(worm) {
  drawcell(worm.pos);
  drawShrikingOutline(worm);
}

function drawShrikingOutline(worm) {
  var animFraction = (darworms.graphics.dyningAnimationFrames - (darworms.graphics.uiFrames - worm.diedAtFrame)) /
    darworms.graphics.dyningAnimationFrames;
  gsetTranslate(worm.pos);

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

export function showTimes() {
  var min = 100000000;
  var max = 0;
  var ave = 0;
  var nFrames = 0;
  var sumTime = 0;
  var fps = 0;
  if (logging()) console.log("frameTimes.length " + frameTimes.length);
  for (var i = 0; i < frameTimes.length; i = i + 1) {
    nFrames = nFrames + 1;
    if (frameTimes[i] > max) {
      max = frameTimes[i];
    }
    if (frameTimes[i] < min) {
      min = frameTimes[i];
    }
    sumTime = sumTime + frameTimes[i];
  }
  if (nFrames > 0) {
    ave = Math.round(sumTime / nFrames * 100) / 100;
  }
  var totalElapsed = new Date().getTime() - startFrameTimes[0];
  var percentDrawing = Math.round((sumTime * 100 / totalElapsed * 100)) / 100;
  // var percentDrawing = (sumTime * 100 / totalElapsed);

  if (gameElapsedTime > 0) {
    fps = Math.round(nFrames * 1000 / gameElapsedTime * 100) / 100;
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
  for (i = 1; i < startFrameTimes.length; i = i + 1) {
    nFrames = nFrames + 1;
    delta = startFrameTimes[i] - startFrameTimes[i - 1];
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
  document.getElementById('wormframetotaltime').innerHTML = timeInDraw / 1000;


};

//  set the wcanvas dimensions based on the window dimentions
export function resizeCanvas() {
  var xc = $('#wcanvas');
  var canvasElement = document.getElementById('wcanvas');
  var sc = $('#scorecanvas');
  var nc = $('#navcontainer');
  var fb = $('#footerbar');
  var w = $(window).width();
  var h = $(window).height();
  var widescreen = w / (h - 140);
  if (widescreen > 2.0) {
    w = 2.0 * (h - 140);
  }

  if (h > 400) {
    xc.css({
      width: w - 20 + 'px',
      height: h - 135 + 'px'
    });
    sc.css({
      width: w - 20 + 'px',
      height: 30 + 'px'

    });
  } else {
    var nw = Math.floor(w * .70);
    xc.css({
      width: nw + 'px',
      height: h - 110 + 'px'
    });
    sc.css({
      width: nw + 'px'

    });

  }
  canvasElement.height = h - 140;
  canvasElement.width = w;
  if ($('#debug').slider().val() === "1") {
    alert(" Resize " + w + " x " + h + " debug " + $('#debug').slider().val());
  }

  if (darworms.theGame) {
    setScale(this.grid.width, this.grid.height);
    darworms.theGame.needsRedraw = true;
    clearCanvas();
    drawCells();
  }
}
