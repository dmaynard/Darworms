import { Point } from "./Point.js";
import { darworms } from "./loader.js";
/**


/*    drawdna  */
  //  although we reserve 4 bits for each direction we actually only use 3 bits
  const spokeMask = [0xFFFFFFF0,
    0xFFFFFF0F,
    0xFFFFF0FF,
    0xFFFF0FFF,
    0xFFF0FFFF,
    0xFF0FFFFF,
    0xF0FFFFFF,
    0x0FFFFFFF
  ];

  const xPts = [0.8, 0.4, -0.4, -0.8, -0.4, 0.4];
  const yPts = [0.0, .67, .67, 0.0, -.67, -.67];

  const sinkMask = 0x08000000;
  let pGraphics = null;

  export function drawdna ( canvas, darworm, cellstate)  {
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    pGraphics = canvas.getContext("2d");
    // I have NO IDEA why this scale factor is needed
    // but experiment proves it IS needed to make circles round
    // and to fill the canvasIsDirty// this may be a JQuery mobile bug?
    pGraphics.setTransform( 1.5*width/2.0, 0, 0, .75*height/2, 1.5*width/2.0, .75*height/2);
    /* pGraphics.strokeStyle = '#00FF00';
    circle( width/2, height/2, width/2);
    pGraphics.beginPath();
    pGraphics.rect(10, 10, 100, 100);
    pGraphics.closePath();
    pGraphics.fill();
      pGraphics.strokeStyle = '#00FF00';
      pGraphics.rect(100, 100, 100, 100);
      pGraphics.stroke();

    // pGraphics.setTransform( width/2.0, 0, 0, height/2.0, width/2.0, height/2.0);
    // pGraphics.scale(100,100);
    pGraphics.strokeStyle = 0; // black
    pGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
    pGraphics.lineWidth = 0.05;

    circle (100, 100, 20, '#FF0000');
    circle (100, 100, 30, '#FFFF00');

    circle (100, 100, 40, '#FF00FF');


    pGraphics.rect(-1.0, -1.0, 2.0, 2.0);

    pGraphics.fill();
    */
    pGraphics.fillStyle = darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme];
    pGraphics.strokeStyle = 'black'; // black
    pGraphics.lineWidth = 0.02;
    pGraphics.rect(-1,-1,2,2);
    pGraphics.fill();
    pGraphics.beginPath();
    pGraphics.moveTo(xPts[0], yPts[0]);
    for (var j = 1; j < 6; j = j + 1) {
      pGraphics.lineTo(xPts[j], yPts[j]);
    }
    pGraphics.lineTo(xPts[0], yPts[0]);
    // pGraphics.closePath();
    pGraphics.stroke();

    for (var j = 0, mask = 0x1; j < 6; j++, mask <<= 1) {
      pGraphics.setLineDash (((cellstate & mask) == 0) ? [.02, .02] : []);
      pGraphics.lineWidth = ((cellstate & mask) == 0) ? 0.01 :  0.04 ;
      pGraphics.beginPath();
      pGraphics.moveTo(0,0);
      pGraphics.lineTo(xPts[j], yPts[j]);
      pGraphics.stroke();
    }
    pGraphics.setLineDash([]);

    console.log(" drawdna");
  }
  function circle (x, y, radius, color) {
    pGraphics.fillStyle = color;
    pGraphics.beginPath();
    pGraphics.arc(x, y,  radius, 0, Math.PI * 2, true);
    pGraphics.closePath();
    pGraphics.stroke();

  }
