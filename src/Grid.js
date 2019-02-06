import { Point } from "./Point.js";

/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/21/13
 * Time: 11:57 PM
 * To change this template use File | Settings | File Templates.
 */
/*    Grid   */
darworms.gridModule = (function() {
  var evenRowVec = [new Point(1, 0), new Point(0, 1), new Point(-1, 1),
    new Point(-1, 0), new Point(-1, -1), new Point(0, -1)
  ];


  var oddRowVec = [new Point(1, 0), new Point(1, 1), new Point(0, 1),
    new Point(-1, 0), new Point(0, -1), new Point(1, -1)
  ];
  //  although we reserve 4 bits for each direction we actually only use 3 bits
  var spokeMask = [0xFFFFFFF0,
    0xFFFFFF0F,
    0xFFFFF0FF,
    0xFFFF0FFF,
    0xFFF0FFFF,
    0xFF0FFFFF,
    0xF0FFFFFF,
    0x0FFFFFFF
  ];
  // sink mask is high bit of spoke 6
  var sinkMask = 0x08000000;

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
    if (darworms.dwsettings.gridGeometry == 'reflect') {
      for (var i = 0; i < this.width; i = i + 1) {
        var topPoint = new Point(i, 0);
        var botPoint = new Point(i, this.height - 1);

        this.setValueAt(topPoint, this.valueAt(topPoint) | darworms.outMask[4] | darworms.outMask[5]); // block up
        this.setValueAt(topPoint, this.valueAt(topPoint) | ((this.valueAt(topPoint) & 0x3F) << 8)); // set outvec
        this.setSpokeAt(topPoint, 4, 0);
        this.setSpokeAt(topPoint, 5, 0);
        this.setSpokeAt(topPoint, 6, 0);
        this.setValueAt(botPoint, this.valueAt(botPoint) | darworms.outMask[1] | darworms.outMask[2]); // block down
        this.setValueAt(botPoint, this.valueAt(botPoint) | ((this.valueAt(botPoint) & 0x3F) << 8)); // set outvecs
        this.setSpokeAt(botPoint, 1, 0);
        this.setSpokeAt(botPoint, 2, 0);
        this.setSpokeAt(botPoint, 6, 0);

      }
      for (var j = 0; j < this.height; j = j + 1) {
        var leftPoint = new Point(0, j);
        var rightPoint = new Point(this.width - 1, j);

        if ((j & 1) == 0) { // even rows shifted left 1/2 cell
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | darworms.outMask[2] | darworms.outMask[3] | darworms.outMask[4]); // block left
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | ((this.valueAt(leftPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(leftPoint, 2, 0);
          this.setSpokeAt(leftPoint, 3, 0);
          this.setSpokeAt(leftPoint, 4, 0);
          this.setSpokeAt(leftPoint, 6, 0);
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | darworms.outMask[0]); //block right
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | ((this.valueAt(rightPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(rightPoint, 0, 0);
          this.setSpokeAt(rightPoint, 6, 0);
        } else { // odd rows shifted right on cell
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | darworms.outMask[3]); // block left
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | ((this.valueAt(leftPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(leftPoint, 3, 0);
          this.setSpokeAt(leftPoint, 6, 0);
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | darworms.outMask[5] | darworms.outMask[0] | darworms.outMask[1]); //block right
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | ((this.valueAt(rightPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(rightPoint, 5, 0);
          this.setSpokeAt(rightPoint, 0, 0);
          this.setSpokeAt(rightPoint, 1, 0);
          this.setSpokeAt(rightPoint, 6, 0);
        }
      }
    }
  };
  Grid.prototype.valueAt = function(point) {
    return this.cells[point.y * this.width + point.x];
  };
  Grid.prototype.hexValueAt = function(point) {
    return (" 0x" + (this.valueAt(point)).toString(16));
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
    return (this.colors[point.y * this.width + point.x] >>> (dir * 4)) & 0x07;
  };
  Grid.prototype.colorsAt = function(point) {
    return (this.colors[point.y * this.width + point.x]);
  }

  Grid.prototype.setSpokeAt = function(point, dir, colorIndex) {
    this.colors[point.y * this.width + point.x] =
      ((this.colors[point.y * this.width + point.x]) & spokeMask[dir]) |
      ((colorIndex & 0x0F) << (dir * 4));

  };
  Grid.prototype.setValueAt = function(point, value) {
    this.cells[point.y * this.width + point.x] = value;
  };

  Grid.prototype.setSinkAt = function(point) {
    this.cells[point.y * this.width + point.x] =
        (this.cells[point.y * this.width + point.x] ^ sinkMask);
  };

  Grid.prototype.isSink = function(point) {
    return ( (this.cells[point.y * this.width + point.x] & sinkMask) !== 0);
  };

  Grid.prototype.isInside = function(point) {
    return point.x >= 0 && point.y >= 0 &&
      point.x < this.width && point.y < this.height;
  };
  Grid.prototype.move = function(from, to, dir, colorIndex) {
    if ((this.inVectorsAt(to) & darworms.inMask[dir]) !== 0) {
      alert(" Attempted to eat eaten spoke at " + to.format());
      console.log("  (" + to.x + "," + to.y + ") dir: " + dir + " value: ");
      console.log("Attempted to eat eaten spoke at " + to.format() + " dir " + dir + " value: 0x" + this.valueAt(to).toString(16));
    }
    this.setValueAt(to, this.valueAt(to) | darworms.inMask[dir] | (darworms.inMask[dir] << 16));
    this.setValueAt(from, this.valueAt(from) | darworms.outMask[dir] | (darworms.outMask[dir] << 8));
    this.setSpokeAt(from, dir, colorIndex);
    this.setSpokeAt(from, 6, colorIndex);
    this.setSpokeAt(to, darworms.inDir[dir], colorIndex);
    this.setSpokeAt(to, 6, colorIndex);
    var captures = 0;
    if (this.stateAt(to) === 0x3f) {
      this.setSpokeAt(to, 6, colorIndex);
      this.setSpokeAt(to, 7, colorIndex);

      captures = captures + 1;
    }
    if (this.stateAt(from) === 0x3f) {
      this.setSpokeAt(from, 6, colorIndex);
      this.setSpokeAt(from, 7, colorIndex);

      captures = captures + 1;
    }
    return captures;
  };
  // Returns next x,y position
  Grid.prototype.next = function(point, dir) {
    var nP = new Point(point.x, point.y);
    // console.log ("  (" + point.x  + "," + point.y + ") dir: " + dir);
    if ((point.y & 1) === 0) {
      nP.add(evenRowVec[dir]);
    } else {
      nP.add(oddRowVec[dir]);
    }
    if ((darworms.dwsettings.gridGeometry == 'falloff' && ((nP.x < 0) || (nP.x > this.width - 1) || (nP.y < 0) || (nP.y > this.height - 1)))) {
      // console.log ("  (" + nP.x  + "," + nP.y + ") returning noWhere");
      return darworms.dwsettings.noWhere;
    }
    if (nP.x < 0) {
      nP.x = this.width - 1;
    }
    if (nP.x > this.width - 1) {
      nP.x = 0;
    }
    if (nP.y < 0) {
      nP.y = this.height - 1;
    }
    if (nP.y > this.height - 1) {
      nP.y = 0;
    }
    // console.log ("    next from: (" + point.format()  + " dir " + dir + " next:  " + nP.format());
    return nP;
  };
  Grid.prototype.each = function(action) {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var point = new Point(x, y);
        action(point, this.valueAt(point));
      }
    }
  };
  Grid.prototype.logSpokesAt = function(point) {
    console.log("[ " + point.x + "," + point.y + "] val = " + this.colorsAt(point).toString(16));
    for (var dir = 0; dir < 8; dir = dir + 1) {
      console.log("   spoke: " + dir + " colorindex" + this.spokeAt(point, dir));

    }
  };
  Grid.prototype.logValueAt = function(point) {
    console.log("[ " + point.x + "," + point.y + "] val = 0x" + this.hexValueAt(point) +
      this.dirList(this.hexValueAt(point)) + " outVectors = 0x" +
      this.outVectorsAt(point).toString(16) + this.dirList(this.outVectorsAt(point)) +
      " inVectors = 0x" + this.inVectorsAt(point).toString(16));
  };
  Grid.prototype.formatStateAt = function(point) {
    return " x " + point.x + " y " + point.y + " state 0x" + this.stateAt(point).toString(16);
  };
  Grid.prototype.dirList = function(state) {
    var list = " directions ";
    for (var dir = 0; dir < 6; dir = dir + 1) {
      if (((state & darworms.outMask[dir]) !== 0)) {
        list = list + " " + darworms.compassPts[dir];
      }
    }
    return list;
  }
  return {
    Grid: Grid
  };

})();
/* end Grid */
