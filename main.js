/*  DarWorms
    Copyright BitBLT Studios inc
    Author: David S. Maynard
    Deployment:
    scp -r -P 12960 ~/projects/SumoWorms/www/*.* dmaynard@bitbltstudios.com:/var/www/darworms/
    git push bitbltstudios:~/repo/ master

    darworms.com
*/

var deviceInfo = function() {
    alert("This is a deviceInfo.");
    document.getElementById("width").innerHTML = screen.width;
    document.getElementById("height").innerHTML = screen.height;
    document.getElementById("colorDepth").innerHTML = screen.colorDepth;
};

/* Game Globals    */


var theGameOver = true;
var focusPoint;
var focusWorm;
var focusValue;
var animFrame = 0;

var players = [1, 0, 0, 0];
var typeNames = [" None ", "Random", " Same ", " New  " ];
var theGame;

 var canvas;
 var wGraphics;
 var zoomcanvas;
 var zctx;
 var timer;
 // var xPts = [ 1.0, 0.5, -0.5, -1.0, -0.5, 0.5];
 // var yPts = [ 0.0,  1.0,  1.0,  0.0,  -1.0, -1.0];
 var xPts = [ 0.5, 0.25, -0.25, -0.5, -0.25, 0.25];
 var yPts = [ 0.0,  0.5,  0.5,  0.0,  -0.5, -0.5];
 // var targetPts = [ new Point( 0.375,0), new Point( 0.25, 0.375), new Point( -0.25, 0.375),
 //    new Point(-0.375,0), new Point(-0.25,-0.375), new Point(  0.25,-0.375)];


var setTypes = function () {
    document.getElementById("p1button").innerHTML = typeNames[players[0]];
    document.getElementById("p2button").innerHTML = typeNames[players[1]];
    document.getElementById("p3button").innerHTML = typeNames[players[2]];
    document.getElementById("p4button").innerHTML = typeNames[players[3]];
    for (var i = 0; i < gWorms.length; i = i + 1) {
        gWorms[i].wType = players[i];
    }    
};

var player1 = function() {
    players[0] = players[0] + 1;
    if (players[0] >= typeNames.length) {
        players[0] = 0;
    }
    setTypes();    
};

var player2 = function() {
    players[1] = players[1] + 1;
    if (players[1] >= typeNames.length) {
        players[1] = 0;
    }
    setTypes();    
};

var player3 = function() {
    players[2] = players[2] + 1;
    if (players[2] >= typeNames.length) {
        players[2] = 0;
    }
    setTypes();    
};

var player4 = function() {
    players[3] = players[3] + 1;
    if (players[3] >= typeNames.length) {
        players[3] = 0;
    }
    setTypes();    
};




var test2 = function() {
    alert("This is a test.");
};
var locationWatch = false;


var outMask = [1, 2, 4, 8, 16, 32];
var inMask =  [8, 16, 32, 1, 2, 4];

var inDir =   [3, 4, 5, 0, 1, 2];

function Point(x, y) { 
    this.x = x;
    this.y = y;
} 

Point.prototype.isEqualTo = function(other) { 
    return this.x == other.x && this.y == other.y;
};

Point.prototype.add = function( other) {
//    console.log (" adding (" + other.x + "," + other.y + " to (" + this.x + "," + this.y );
    return new Point( this.x + other.x, this.y + other.y);
};

Point.prototype.dist = function( other) {
//    console.log (" adding (" + other.x + "," + other.y + " to (" + this.x + "," + this.y );
    return Math.sqrt((this.x - other.x * 2) * (this.x - other.x*2) +  (this.y - other.y*2) * (this.y - other.y*2));
}

Point.prototype.wrap = function(wg, hg) {
    if (this.x >= wg) this.x  = this.x - wg;
    if (this.x < 0) this.x  = this.x + wg;
    if (this.y >= hg) this.y  = this.y - hg;
    if (this.y < 0)  {
        this.y  = this.y + hg;
    }
}

Point.prototype.format = function( ) {
    return "(" + this.x + "," + this.y + ")";
};

evenRowVec = [ new Point( 1, 0), new Point(  0,  1), new Point(-1,  1),
               new Point(-1, 0), new Point( -1, -1),  new Point(0,-1) ];
               
oddRowVec = [ new Point( 1, 0), new Point( 1,  1), new Point( 0,  1),
              new Point( -1,0), new Point( 0, -1), new Point( 1, -1) ];

/*    Grid   */
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
  for (var i = 0; i < width * height; i = i + 1) {
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
  if ( (this.valueAt(to)  & inMask[dir])  !== 0) {
      alert(" Attempted to eat eaten spoke at " + to.format());
    console.log ("  (" + to.x  + "," + to.y + ") dir: " + dir + " value: " );
     console.log( "Attempted to eat eaten spoke at " + to.format() + " dir " + dir  +" value: 0x" + value.toString(16));
  }
  this.setValueAt(to, this.valueAt(to) | inMask[dir] | (inMask[dir] << 16));
  this.setValueAt(from, this.valueAt(from) | outMask[dir] | (outMask[dir] << 8));
  this.setSpokeAt(from, dir, colorIndex);
  this.setSpokeAt(from, 6, colorIndex);
  this.setSpokeAt(to, inDir[dir], colorIndex);
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
  nP = new Point( point.x, point.y);
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

/* end Grid */

/* Worm  Constants */
codons = { "e": 0, "se": 1, "sw": 2, "w": 3, "nw": 4, "ne": 5, "unSet" : 6 , "isTrapped": 7};
compassPts = [ "e", "se", "sw", "w", "nw", "ne", "unSet", "isTrapped"];
wormStates = {"dead": 0, "moving" : 1, "paused": 2, "sleeping": 3};
wormStateNames = ["dead", "moving", "paused", "sleeping"];
initialWormStates = [3, 2, 2, 2];

/* Worm Object */

function Worm(colorIndex, state) {
  this.colorIndex = colorIndex;
  this.dna = new Array(64);
  this.state = state;
  this.nMoves = 0;
  this.score = 0;
  this.prevScore = 0;

  for (var i = 0; i < 64; i = i + 1) {
      this.dna[i] = codons.unSet;
  }
  this.dna[63] = codons.isTrapped;
  // set all the forced moves
  for (var j = 0; j < 6 ; j = j+ 1) {
      this.dna[ 0x3F ^ (1<<j)] = j;
  }
  this.randomize();
}

Worm.prototype.init = function( wType) {
    this.nMoves = 0;
    this.score = 0;
    this.prevScore = 0;
    if (wType === 0) { // none   asleep
       this.state = 3;  // sleeping
     }
    if (wType === 1) { // random
      for (var i = 0; i < 64; i = i + 1) {
          this.dna[i] = codons.unSet;
           }
       this.dna[63] = codons.isTrapped;
       // set all the forced moves
       for (var j = 0; j < 6 ; j = j+ 1) {
          this.dna[ 0x3F ^ (1<<j)] = j;
       }
       this.randomize();  // sleeping
     }
     if (wType === 2) { // same   
       this.state = 2;  // paused
     }
     if (wType === 3) { // new   
      for (var  k = 0; k < 64; k = k + 1) {
          this.dna[k] = codons.unSet;
           }
       this.dna[63] = codons.isTrapped;
       // set all the forced moves
       for (var n = 0; n < 6 ; n = n+ 1) {
          this.dna[ 0x3F ^ (1<<n)] = n;
       }
       this.state = 2;  // paused
     }     
};
Worm.prototype.getMoveDir = function (value) {
      if (value === 0x3F)  {  // trapped
         this.state = wormStates.dead;
         return 6;
      }
      return this.dna[value & 0x3F];
};

Worm.prototype.shouldDrawScore = function () {
   if (this.score !== this.prevScore  || (this.nMoves < 2)) {
       this.prevScore = this.score;
       return true;
   }
    return false;
};

Worm.prototype.randomize = function() {
    var dir;
      for (var i = 0; i < 63; i = i + 1) {
          // console.log(" randomize loop start  i = " + i + " dna[i] = " + this.dna[i]);
          if (this.dna[i] === codons.unSet ) {
            for (var j = 0; j < 100; j = j + 1) {
              dir = Math.floor(Math.random() * 6);
              //console.log( " dir = " + dir +  " i=" + i + " outMask[dir] = " + outMask[dir] + "& = " + (i & outMask[dir]));
              if ((i & outMask[dir]) === 0) {
                  this.dna[i] = dir;
                  // console.log(" Setting dir 0x" + i.toString(16) + " to " + compassPts[dir]);
                  break;                 
              }
            }
          if (this.dna[i] == codons.unSet) {
              console.log ("Error we rolled craps 10,000 times in a row");          
          }
      }
      // console.log(" randomize loop end  i = " + i + " dna[i] = " + this.dna[i]);
   }
};

Worm.prototype.log = function() {
  var dir;
  console.log( " Worm State: " + wormStateNames[this.state] + " at " + (this.pos !== undefined ? this.pos.format() : "position Undefined"));
  };
  
Worm.prototype.place = function(aState, aGame) {
  this.pos = aGame.origin;
  this.nMoves = 0;
  this.score = 0;
  this.state = aState;
  console.log(" placing worm   i = " + this.colorIndex + " state " + aState);
};

Worm.prototype.dump = function() {
   this.log();
   for (var i = 0; i < 64; i = i + 1) {
    console.log (" dna" + i + " = " + compassPts[this.dna[i]]);
    var spokes = [];
    for (var spoke = 0; spoke < 6; spoke = spoke + 1) {
        if ((i & outMask[spoke]) !== 0 ) {
            spokes.push(compassPts[spoke]);
        }
    }
    console.log (" dna" + i + " "+ spokes + " = " + compassPts[this.dna[i]]);    
  }
  
};
/* end of Worm */

/* WPane

an object containing grid a canvas a scale and an offset
  * can draw the grid points inside the canvas
   *
   *  grid is the game grid
   *  paneSize is the number of grid items to display w,h
   *  centerPoint  the x,y coordinates of the
   *  canvas
   *  scale ?
   *  margin ?
   *
*/

function WPane ( grid, size, center, canvas) {
    this.grid = grid;
    this.canvas = canvas;
    this.pWidth = canvas.width
    this.pHeight = canvas.height;
    this.ctx = canvas.getContext("2d");
    this.cWidth = size.x;
    this.cHeight =  size.y;
    this.pMargin  = 10;
    this.scale = new Point((this.pWidth - (2*this.pMargin))/(this.cWidth+0.5),
                           (this.pHeight- (2*this.pMargin))/(this.cHeight+0.5));
    this.offset = new Point(center.x - (this.cWidth >> 1), center.y - (this.cHeight >>1));
    this.offset.wrap(this.grid.width, this,grid.height);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.scale.x, this.scale.y);
    this.colorTable = ["000000", "881C0A", "#1C880A", "#1C0A88",
        "#AAAA00", "#448833", "#443388", "#338844",
        "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
        "#884433", "#448833", "#443388", "#338844"];
    this.alphaColorTable = ["rgba(  0,   0,   0, 0.2)",
        "rgba(  255,   0,   0, 0.2)", "rgba(    0, 255,   0, 0.2)", "rgba(    0,   0, 255, 0.2)", "rgba(  255, 255, 0, 0.2)",
        "#AAAA0080", "#44883380", "#44338880", "#33884480",
        "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
        "#88443380", "#44883380", "#44338880", "#33884480"];
}

WPane.prototype.clear = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle =  "rgba(222,222,222, 1.0)";
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.pWidth, this.pHeight);
    this.ctx.closePath();
    this.ctx.fill();
}

WPane.prototype.setCenter = function ( center ) {
    console.log( " WPane.prototype.setCenter  center: "   + center.format()  );

    this.offset = new Point(center.x - Math.floor(this.cWidth /2), center.y - Math.floor(this.cHeight /2));
    console.log( "     WPane.prototype.setCenter  offset: "   + this.offset.format()  );
    this.offset.wrap(this.grid.width, this.grid.height);
    console.log( "         WPane.prototype.setCenter  offset after wroa : "   + this.offset.format()  );

    }
WPane.prototype.drawCells = function () {
    this.clear();
    var gPos = new Point(this.offset.x,this.offset.y);
    for (var col = 0; col < this.cWidth ; col = col + 1) {
        for (var row = 0; row < this.cHeight ; row = row + 1) {
            /* at this pane coordinate draw that grid cell content  */
            this.drawCell(new Point(col,row), gPos);
            gPos.y = gPos.y + 1;
            if (gPos.y >= this.grid.height ) {gPos.y = 0;}
        }
        gPos.y = this.offset.y;
        gPos.x = gPos.x + 1;
        if (gPos.x >= this.grid.width ) {gPos.x = 0;}
    }
};

WPane.prototype.pSetTransform = function (point) {
    var xoff;
    var yoff;
    if (( (point.y+this.offset.y) & 1) === 0) {
        xoff = (point.x + 0.5 ) * this.scale.x + this.pMargin;
    } else {
        xoff = (point.x + 1.0 )  * this.scale.x  + this.pMargin;

    }
    yoff = (point.y + 0.5 ) * this.scale.y + this.pMargin;
    this.ctx.setTransform(this.scale.x,0,0,this.scale.y,xoff,yoff);
};

/* WPane.drawCell(wPoint, gPoint)
 *
  * in the pane at Position WPoint draw the cell for global grid poinr gPoint
  *
*/


WPane.prototype.drawCell = function( wPoint,  gPoint) {
    console.log( " WPane.prototype.drawCell wPoint "   + wPoint.format() + "  gPoint "  + gPoint.format() );

    this.pSetTransform(wPoint);
    this.ctx.fillStyle =  "rgba(080,222,222,0.1)";
    this.ctx.beginPath();
    this.ctx.rect(-0.5, -0.5, 1.0, 1.0);
    this.ctx.closePath();
    this.ctx.fill();
    var owner = this.grid.spokeAt( gPoint, 7);
    if (owner > 0 ) {
        this.ctx.strokeStyle = this.colorTable[owner & 0xF];
        this.ctx.lineWidth = 1.0/this.scale.x;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 0.2, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    } else {
        this.ctx.fillStyle = this.colorTable[this.grid.spokeAt(gPoint,6) & 0xF];
        this.ctx.lineWidth = 1.0/this.scale.x;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 0.1, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.fill();

    }
    var outvec = this.grid.outVectorsAt(gPoint);
    var invec = this.grid.inVectorsAt(gPoint);
    // console.log (" drawCell at" +  gPoint.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & outMask[i]) !== 0) {
            var outSpokeColor = this.colorTable[this.grid.spokeAt(gPoint, i)];
            // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + gPoint.format());
            this.ctx.strokeStyle  = outSpokeColor;
            this.ctx.lineWidth =   5.0/this.scale.x ;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(0,0);
            this.ctx.lineTo(xPts[i], yPts[i]);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        if ((invec & outMask[i]) !== 0) {
            var inSpokeColor = this.colorTable[this.grid.spokeAt(gPoint, i)];
            // console.log (" inSpokeColor " + i + " :  " + inSpokeColor + " at "  + gpoint.format());
            this.ctx.strokeStyle  = inSpokeColor;
            this.ctx.lineWidth = 5.0/this.scale.x;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(xPts[i], yPts[i]);
            this.ctx.lineTo(0,0);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }
};


/*  End of wPane */

/*    Game   */

gameStates = {"over": 0, "running" : 1, "waiting": 2, "paused": 3};
gameStateNames = ["over", "running", "waiting", "paused"];


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

  this.zoomPane = new WPane(this.grid, new Point(5,5) , new Point( gridWidth >> 1, gridHeight >>1) , document.getElementById("wcanvas"))
  this.scale = new Point((this.canvas.width - (2*this.margin))/gridWidth, (this.canvas.height- (2*this.margin))/gridHeight);
  this.origin = new Point( gridWidth >> 1, gridHeight >>1);
  console.log( "newGame  scalex "  + (this.canvas.width - (2*this.margin))/gridWidth);   
  context.scale(this.scale.x, this.scale.y);
  this.worms = [];
  this.needsRedraw = true;
  this.avePos = new Point(0,0);
  // worm index of zero means unclaimed.
  this.colorTable = ["000000", "881C0A", "#1C880A", "#1C0A88",
                     "#AAAA00", "#448833", "#443388", "#338844",
                     "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
                     "#884433", "#448833", "#443388", "#338844"];
  this.alphaColorTable = ["rgba(  0,   0,   0, 0.2)",
        "rgba(  255,   0,   0, 0.2)", "rgba(    0, 255,   0, 0.2)", "rgba(    0,   0, 255, 0.2)", "rgba(  255, 255, 0, 0.2)",
        "#AAAA0080", "#44883380", "#44338880", "#33884480",
        "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
        "#88443380", "#44883380", "#44338880", "#33884480"];

    this.xPts = [ 1.0, 0.5, -0.5, -1.0, -0.5, 0.5];


Game.prototype.log = function() {   this.yPts = [ 0.0,  1.0,  1.0,  0.0,  -1.0, -1.0];
    this.targetPts = [ new Point( 0.180,0), new Point( 0.09, 0.180), new Point( -0.09, 0.180),
        new Point(-0.180,0), new Point(-0.09,-0.180), new Point(  0.09,-0.180)];


}

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
             var inSpokeColor = this.colorTable[this.grid.spokeAt(point, i)];
             // console.log (" inSpokeColor " + i + " :  " + inSpokeColor + " at "  + point.format());
             wGraphics.strokeStyle  = inSpokeColor;
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
    theGame.drawZoom(point);
    wGraphics.save();
    // console.log( "drawSelectCell  canvas "  + this.canvas.width + " height "  + this.canvas.height);   
    // console.log( "drawSelectCell  grid "  + this.grid.width + " height "  + this.grid.height); 
    
    // This workd to draw the image bitmap 
    // wGraphics.setTransform(1.0, 0, 0, 1.0 , 0, 0);
    // wGraphics.drawImage(localImage, 10, 10);
    // return;


    var hoffset = 0;

    if((point.y & 1) === 1)  {
        hoffset = (this.canvas.width-(this.margin*2.0)) / 10;
    }
    wGraphics.scale(this.grid.width-(this.margin*2.0)/2, this.grid.height-(this.margin*2.0)/2);
    // wGraphics.translate(1.0, 1.0);
    wGraphics.setTransform(this.canvas.width, 0, 0, this.canvas.height,
        (this.canvas.width)/2  - this.margin - 4 + hoffset, (this.canvas.height)/2  - this.margin -4);
    // console.log( "drawSelectCell  scalex "  + this.grid.width/2 );
    wGraphics.fillStyle =  "rgba(222,222,222,0.2)";
    wGraphics.beginPath();
    wGraphics.rect(-1.0, -1.0, 2.0, 2.0);
    wGraphics.closePath();
    wGraphics.fill();    
    var owner = this.grid.spokeAt( point, 7);
    wGraphics.fillStyle = "rgba(0,0,0,0.2)";
    wGraphics.beginPath();
    wGraphics.arc(0, 0, 0.1, 0, Math.PI*2, true);
    wGraphics.closePath();
    wGraphics.fill();    
    
    var outvec = this.grid.stateAt(point);
    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & outMask[i]) !== 0) {
             var outSpokeColor = this.alphaColorTable[this.grid.spokeAt(point, i)];
             // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
             wGraphics.strokeStyle  = "rgba(0,0,0,0.2)";
             wGraphics.lineWidth = 8/this.canvas.width;
             wGraphics.lineCap = 'round';
             wGraphics.beginPath();
             wGraphics.moveTo(0,0);
             wGraphics.lineTo(this.targetPts[i].x, this.targetPts[i].y);
             wGraphics.stroke();
             wGraphics.closePath();            
        } else {
      /*
      wGraphics.fillStyle = this.colorTable[focusWorm.colorIndex];
            wGraphics.strokeStyle  = this.colorTable[focusWorm.colorIndex];
            wGraphics.beginPath();
            wGraphics.arc(this.targetPts[i].x, this.targetPts[i].y,  (0.125 / 64) * (64 - (animFrame & 0x3F)), 0, Math.PI*2, false);
            wGraphics.closePath();
            wGraphics.fill();               
      */       
            wGraphics.strokeStyle  = this.alphaColorTable[focusWorm.colorIndex];
            wGraphics.lineWidth = 8/this.canvas.width;
            wGraphics.moveTo(this.targetPts[i].x, this.targetPts[i].y);
            wGraphics.beginPath();
            wGraphics.arc(this.targetPts[i].x*2, this.targetPts[i].y*2,  (0.125 / 64) * (animFrame & 0x3F), 0, Math.PI*2, false);
            wGraphics.closePath();
            wGraphics.stroke();
            wGraphics.moveTo(0,0);
            wGraphics.lineTo((this.targetPts[i].x ) /  64.0  * (animFrame & 0x3F)  , (this.targetPts[i].y)  / 64.0 * (animFrame & 0x3F));
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
    wGraphics.clearRect(0,0,canvas.width,canvas.height);
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
    console.log (" drawZoom   "  + " at "  + aPos.format());

    this.zoomPane.setCenter(aPos);
    // this.zoomPane.setCenter(new Point(9,9));
    this.zoomPane.drawCells();

    // zctx.drawImage(canvas,(this.avePos.x * this.scale.x) - 25 ,(this.avePos.y * this.scale.y) - 25 ,100,100,0,0,100,100);
}
Game.prototype.makeMove = function() {
    var nAlive = 0;
    if (this.gameState === gameStates.waiting) {
        return;
    }
    // console.log ("Game  StartingTurn " + this.numTurns );
    for (var i = 0; i < this.worms.length; i = i + 1) {
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
        console.log (" death of worm " + active.colorIndex + " Current State = " + currentState);
      } else {
        var direction = active.getMoveDir(currentState);
        if (direction === codons.unSet) {
            this.gameState = gameStates.waiting;
            console.log(this.grid.formatStateAt(active.pos));
            console.log ( " setting gamestate to gameStates.waiting " +  this.gameState);
            focusPoint = active.pos;
            focusWorm = active;
            focusValue = currentState;
            return(true);           
        }
        this.dirtyCells.push(active.pos);
        // console.log (" Move Direction = " + direction);
        var next = this.grid.next(active.pos,direction);
        
        if( active.nMoves <= this.numTurns) {
          active.score = active.score + this.grid.move(active.pos,next,direction,active.colorIndex);
          this.numMoves = this.numMoves + 1; 
          active.nMoves = active.nMoves + 1;
          // console.log("    Worm " + active.colorIndex + "  just made move " + active.nMoves + " game turn " + this.numTurns + " From " + this.grid.formatStateAt(active.pos) + " direction  " + direction);
          active.pos = next;
        } else {
          console.log(" skipping turn worm " +  active.colorIndex + " has made "  + active.nMoves + " turn number is  " + this.numTurns);            
        }
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
    this.numTurns = this.numTurns + 1;

    return ( nAlive > 0);
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


 var gWorms = [new Worm(1, wormStates.paused), new Worm(2, wormStates.paused),  new Worm(3, wormStates.paused), new Worm(4, wormStates.paused)];
 // var localImage;

var updateScores = function () {

    if (theGame.worms[0] !== undefined  &&  theGame.worms[0].shouldDrawScore()) {
      // console.log( " worm 0 score is " + theGame.worms[0].score);
      document.getElementById('worm0score').innerHTML = theGame.worms[0].score;    
      document.getElementById('p1score').innerHTML = "\t" + theGame.worms[0].score;    
    }
    if (theGame.worms[1] !== undefined ) {
      document.getElementById('worm1score').innerHTML = theGame.worms[1].score;    
      document.getElementById('p2score').innerHTML = "\t" + theGame.worms[1].score;    
   }
    if (theGame.worms[2] !== undefined ) {
      document.getElementById('worm2score').innerHTML = theGame.worms[2].score;    
      document.getElementById('p3score').innerHTML = "\t" + theGame.worms[2].score;    
    }
    if (theGame.worms[3] !== undefined ) {
      document.getElementById('worm3score').innerHTML = theGame.worms[3].score;    
      document.getElementById('p4score').innerHTML = "\t" + theGame.worms[3].score;    
    }
};


var makeMoves = function () {
      // console.log(" makeMoves theGameOver " + theGameOver +  "  gameState " + gameStateNames[theGame.gameState] );
      var startTime = new Date().getTime();
      theGame.startFrameTimes.push(startTime);
      if (theGame.needsRedraw) {
        theGame.drawCells();
        theGame.needsRedraw = false;
        // wGraphics.drawImage(localImage, 10, 10);
        
      }
      if (theGameOver === false) {
          if (theGame.makeMove() === false) {
            theGameOver = true;
            theGame.elapsedTime = theGame.elapsedTime  + new Date().getTime();
            console.log(" Game Over");
            clearInterval(timer);
            document.getElementById("startpause").innerHTML = "Start Game";
            theGame.showTimes();
            theGame.gameState = gameStates.over;
            alert("Game Over ");
            wGraphics.restore();
          }
      }
      // theGame.drawCells();
      theGame.drawDirtyCells();
      theGame.getAvePos();
      // theGame.drawZoom(theGame.avePos);
      // zctx.drawImage(canvas,100,100,100,100,0,0,100,100);
      updateScores();
      var elapsed = new Date().getTime() - startTime;
      theGame.frameTimes.push(elapsed);
};

var updateGameState = function () {
    // console.log(" updateGameState: gameState " +  gameStateNames[theGame.gameState]);   
    animFrame = animFrame + 1;    
    if (theGame.gameState === gameStates.running) {
        makeMoves();
    }
    if (theGame.gameState === gameStates.waiting) {
        theGame.drawSelectCell(focusPoint);
    }
    
};

var selectDirection = function ( point ) {
    // console.log( "selectDirection: " + point.format());
    var outvec = theGame.grid.stateAt(focusPoint);
    var minDist = 100000;
    var dist;
    var select = -1;
    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & outMask[i]) === 0) {
          dist = point.dist(theGame.targetPts[i]);
          if (dist < minDist) {
             minDist = dist; 
             select = i;
          }
         // console.log( "selectDirection i: " + i + "  dist: " + dist + " Min Dist:" + minDist); 
        } 
    }
    if ((minDist < 0.2)  && (select >= 0)) {
        focusWorm.dna[focusValue & 0x3F] = select;
        theGame.gameState = gameStates.running;
        // console.log( "   focusWorm.dna[ " + focusValue + "] =  " + select); 
        // console.log( "focusWorm .position :" + focusWorm.pos.format() ); 
        theGame.clearCanvas();
        theGame.drawCells();
    }
};

var wormEventHandler = function(event){
  touchX = event.pageX;
  touchY = event.pageY;
                       //  wGraphics.fillStyle="#0f0";
                        // wGraphics.fillRect(touchX - 75, touchY - 50, 50, 50);
 
                        // wGraphics.font = "20pt Arial";
                        // wGraphics.fillText("X: " + touchX + " Y: " + touchY, touchX, touchY);
  console.log ( " Tap Event at x: " + touchX + " y: " + touchY);
  if (theGame.gameState === gameStates.waiting) {
    selectDirection( new Point((touchX/theGame.canvas.width) - 0.5, (touchY/theGame.canvas.height) - 0.5));
  }
};

var startgame = function() {
    /* grid = new Grid(4, 4, ctx);
    grid.logValueAt(new Point(0,0));
    grid.logValueAt(new Point(0,1));
    grid.move( new Point(0,0), new Point(0,1), 0);
    alert("This is a test5.");
    console.log(" moved");
    grid.logValueAt(new Point(0,0));
    grid.logValueAt(new Point(0,1));
    
    alert("This is a test2.");
   
    grid.each ( function (point, value) {
        grid.logValueAt (point) ;
        for (var dir = 0; dir < 6; dir ++) {
            nxt = grid.next(point, dir);
            console.log ("    next: " + dir + " [" + nxt.x + "," + nxt.y + "]");
            grid.move(point, nxt, dir);
            console.log ("    move: " + dir + grid.formatValueAt(point) + " next.state" + grid.formatValueAt(nxt) );            
        }
    });
    */
    if (theGame === undefined) {
        console.log(" theGame is undefined ");
        return;
    }
    if (theGame.gameState === gameStates.running) {
        // This is now a pause game button 
        clearInterval(timer);
        document.getElementById("startpause").innerHTML = "Resume Game";
        theGame.gameState = gameStates.paused;
        return;
    }
    if (theGame.gameState === gameStates.paused) {
        // This is now a pause game button 
        document.getElementById("startpause").innerHTML = "Pause Game";
        theGame.gameState = gameStates.running;        
        timer = setInterval(updateGameState,1000/$("#fps").val());
        return;
    }
    if (theGame.gameState === gameStates.over) {
        // This is now a start game button 
        // alert("About to Start Game.");

        document.getElementById("startpause").innerHTML = "<b>Pause Game</b>";        theGame.gameState = gameStates.running;
        console.log(" setInterval: " +  1000/$("#fps").val());   
        document.getElementById("startpause").innerHTML = "Pause Game";
        initTheGame(true);
        theGame.log();
        timer = setInterval(updateGameState,1000/$("#fps").val());
    }
 
};



var preventBehavior = function(e) {
    e.preventDefault();
};



function fail(msg) {
    alert(msg);
}



 
function initTheGame(startNow) {
    console.log(" initTheGame: startnow  " + startNow);
    console.log ( " initTheGame wGraphics " + wGraphics);
    
    var gWidth = 16;
    var gHeight = 16;
    gHeight = $("#gridsize").val();
    if ((gHeight & 1) !== 0) {
        // height must be an even number because of toroid shape
        gHeight = gHeight*1 + 1;       
    }
    gWidth = gHeight; 
    
    var game = new Game(gWidth, gHeight, canvas, wGraphics);
    game.clear();
    game.drawCells();
    game.worms = gWorms;
    console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + gHeight);
    for (var i = 0; i < gWorms.length; i = i + 1) {
        if (players[i] !== 0) { //  not None
            gWorms[i].init(players[i]);
        }
        gWorms[i].place( initialWormStates[players[i]] , game);
    }    
 
    theGame = game;
    if (startNow) {
        theGameOver = false;
        theGame.gameState = gameStates.running;
        
    } else {
        theGameOver = true;
        theGame.gameState = gameStates.over;
       
    }
    theGame.needsRedraw = true;
    
}

function init() {
    document.addEventListener("deviceready", deviceInfo, true);
    setTypes();
    canvas = document.getElementById("wcanvas");
    wGraphics = canvas.getContext("2d");
    // zcanvas = document.getElementById("zoomcanvas");
    // zctx =  zcanvas.getContext("2d");
    // localImage = document.getElementById("myImage");
    // console.log ( " localImage " + localImage + " width " + localImage.width);
    // wGraphics.drawImage(localImage, 10, 10);
    // alert( " init called");
    console.log ( " init wGraphics " + wGraphics);
    $('#wcanvas').bind('tap', wormEventHandler);
    // alert( " initTheGame to bw  called ");

    initTheGame(false);


}
