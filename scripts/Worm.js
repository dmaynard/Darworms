/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:00 AM
 * To change this template use File | Settings | File Templates.
 */
/* Worm Object */
function Worm(colorIndex, state) {
  this.colorIndex = colorIndex;
  this.dna = new Array(64);
  this.state = state;
  this.nMoves = 0;
  this.score = 0;
  this.prevScore = 0;
  this.numChoices = 0;
  this.died = false;
  this.name = "";
  this.wType = 0; // None (asleep)

  this.audioSamplesPtrs = [];
  this.pos = new Point(-1, -1);

  // for (var j = 0; j < 6 ; j = j+ 1) {
  //     this.audioSamples.push(darworms.audioSamples [  ((colorIndex-1) + (j * 2)) % darworms.audioSamples.length]);
  //     this.numChoices += 1;
  //  }

  for (var i = 0; i < 64; i = i + 1) {
    this.dna[i] = darworms.dwsettings.codons.unSet;
  }

  this.dna[63] = darworms.dwsettings.codons.isTrapped;
  this.numChoices = 1;
  // set all the forced moves
  for (var j = 0; j < 6; j = j + 1) {
    this.dna[0x3F ^ (1 << j)] = j;
    this.numChoices += 1;
  }
  this.randomize();
  this.toText();
}

Worm.prototype.setNotes = function(index) {
  for (var j = 0; j < 6; j = j + 1) {
    var sampleIndex = ((index) + (j * 2)) % (darworms.audioSamples.length-1);
    // this.audioSamples.push(darworms.audioSamples[((index) + (j * 2)) % (darworms.audioSamples.length-1)]);
    // console.log (" index: " + index + " dir: " + j + " Sample Index: " + sampleIndex  + " length: " + darworms.audioSamples.length);
     // this.audioSamples.push(darworms.audioSamples[sampleIndex]);
     // this.audioSamples.push(sampleIndex);
     this.audioSamplesPtrs.push(index); // c2,wav
  }


}
Worm.prototype.init = function(wType) {
  this.nMoves = 0;
  this.score = 0;
  this.prevScore = 0;
  if (wType === 0) { // none   asleep
    this.state = 3; // sleeping
  }
  if (wType === 1) { // random
    for (var i = 0; i < 64; i = i + 1) {
      this.dna[i] = darworms.dwsettings.codons.unSet;
    }
    this.dna[63] = darworms.dwsettings.codons.isTrapped;
    this.numChoices = 1;
    // set all the forced moves
    for (var j = 0; j < 6; j = j + 1) {
      this.dna[0x3F ^ (1 << j)] = j;
      this.numChoices += 1;
    }
    this.randomize(); // sleeping
  }
  if (wType === 2) { // same
    this.state = 2; // paused
  }
  if (wType === 3) { // new
    for (var k = 0; k < 64; k = k + 1) {
      this.dna[k] = darworms.dwsettings.codons.unSet;
    }
    this.dna[63] = darworms.dwsettings.codons.isTrapped;
    this.numChoices = 1;
    // set all the forced moves
    for (var n = 0; n < 6; n = n + 1) {
      this.dna[0x3F ^ (1 << n)] = n;
      this.numChoices += 1;
    }
    this.state = 2; // paused
  }
  this.toText();
};

Worm.prototype.getMoveDir = function(value) {
  if (value === 0x3F) { // trapped
    this.state = wormStates.dead;
    this.died = true;
    return 6;
  }
  return this.dna[value & 0x3F];
};
Worm.prototype.shouldDrawScore = function() {
  if (this.score !== this.prevScore || (this.nMoves <= 2)) {
    this.prevScore = this.score;
    return true;
  }
  if (this.died) {
    this.died = false; // one-shot
    return true;
  }
  return false;
};
Worm.prototype.randomize = function() {
  var dir;
  for (var i = 0; i < 63; i = i + 1) {
    // console.log(" randomize loop start  i = " + i + " dna[i] = " + this.dna[i]);
    if (this.dna[i] === darworms.dwsettings.codons.unSet) {
      for (var j = 0; j < 1000; j = j + 1) {
        dir = Math.floor(Math.random() * 6);
        //console.log( " dir = " + dir +  " i=" + i + " outMask[dir] = " + outMask[dir] + "& = " + (i & outMask[dir]));
        if ((i & darworms.outMask[dir]) === 0) {
          this.dna[i] = dir;
          this.numChoices += 1;
          // console.log(" Setting dir 0x" + i.toString(16) + " to " + compassPts[dir]);
          break;
        }
      }
      if (this.dna[i] === darworms.dwsettings.codons.unSet) {
        console.log("Error we rolled craps 10,000 times in a row");
      }
    }
    // console.log(" randomize loop end  i = " + i + " dna[i] = " + this.dna[i]);
  }
  this.toText();
};
Worm.prototype.log = function() {
  var dir;
  console.log(" Worm State: " + wormStateNames[this.state] + " at " + (this.pos !== undefined ? this.pos.format() : "position Undefined"));
};
Worm.prototype.place = function(aState, aGame) {
  this.pos = aGame.origin;
  this.nMoves = 0;
  this.score = 0;
  this.state = aState;
  console.log(" placing worm   i = " + this.colorIndex + " state " + aState + " " + this.numChoices + " of 64 possible moves defined");
};
Worm.prototype.dump = function() {
  this.log();
  for (var i = 0; i < 64; i = i + 1) {
    console.log(" dna" + i + " = " + darworms.compassPts[this.dna[i]]);
    var spokes = [];
    for (var spoke = 0; spoke < 6; spoke = spoke + 1) {
      if ((i & darworms.outMask[spoke]) !== 0) {
        spokes.push(compassPts[spoke]);
      }
    }
    console.log(" dna" + i + " " + spokes + " = " + compassPts[this.dna[i]]);
  }

};
Worm.prototype.toText = function() {
  this.name = "";

  for (var i = 0; i < 64; i = i + 1) {
    if (this.dna[i] === 0) this.name += 'A';
    if (this.dna[i] === 1) this.name += 'B';
    if (this.dna[i] === 2) this.name += 'C';
    if (this.dna[i] === 3) this.name += 'D';
    if (this.dna[i] === 4) this.name += 'E';
    if (this.dna[i] === 5) this.name += 'F';
    if (this.dna[i] === 6) this.name += '?';
    if (this.dna[i] === 7) this.name += 'X';
    if (this.dna[i] > 7) this.name += '#';
  };
};
var compassPts = ["e", "ne", "nw", "w", "sw", "se", "unSet", "isTrapped"];

Worm.prototype.fromText = function(dnastring) {
  var regx = /^[ABCDEF\?]{63}X$/;
  if (!(regx.test(dnastring))) {
    return false;
  }
  var gooddna = true;
  for (var i = 0; i < 63; i = i + 1) {
    switch (dnastring.charAt(i)) {
      case 'A':
        this.dna[i] = 0;
        break;
      case 'B':
        this.dna[i] = 1;
        break;
      case 'C':
        this.dna[i] = 2;
        break;
      case 'D':
        this.dna[i] = 3;
        break;
      case 'E':
        this.dna[i] = 4;
        break;
      case 'F':
        this.dna[i] = 5;
        break;
      case '?':
        this.dna[i] = 6;
        break;
      default:
        alert(" illegal dna string at position " + (i + 1));
        return(false);
      }
      if(!(( (1<<this.dna[i]) & i) === 0) && (this.dna[i] !==6)) {
        alert("illegal direction " + dnastring.charAt(i) + "(" + compassPts[this.dna[i]]
        + ")"  + "given for cell " + i  );
        gooddna = false;
      }
    }
    if (gooddna) {
      this.toText();
    }
    return gooddna;
  };

/* end of Worm */
