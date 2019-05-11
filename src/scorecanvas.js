// scorecanvas.js
import {
  Point
} from "./Point.js";
import {
  darworms
} from "./loader.js";

var scoreCanvas;
export var scorectx;

export function scoreCanvasInit(game) {
  scoreCanvas = document.getElementById("scorecanvas");
  scorectx = scoreCanvas.getContext("2d");
  scorectx.font = "bold 18px sans-serif";
  scorectx.shadowColor = "rgb(190, 190, 190)";
  scorectx.shadowOffsetX = 3;
  scorectx.shadowOffsetY = 3;
}

export function clearScore(segmentIndex, totalSegments) {
  var segWidth = scoreCanvas.width / totalSegments;
  scorectx.fillStyle = "rgba(222,222,222, 1.0)";
  scorectx.shadowOffsetX = 0;
  scorectx.shadowOffsetY = 0;

  scorectx.fillRect(segWidth * segmentIndex, 0, segWidth, scoreCanvas.height);
}



function scoreStartx(segmentIndex, totalSegments, text) {
  var segWidth = scoreCanvas.width / totalSegments;
  var twidth = scorectx.measureText(text).width;
  return ((segWidth * segmentIndex) + (segWidth / 2) - (twidth / 2));

}

export function updateScores() {
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
