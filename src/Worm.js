//  Worm.js
import {
  Point
} from "./Point.js";
import {
  darworms
} from "./loader.js";
import {
  log,
  logging,
  numOneBits
} from "./utils.js"
/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:00 AM
 * To change this template use File | Settings | File Templates.
 */
/* Worm Object */

export const musicalkeys = {
  "A Major": [
    darworms.notes.A,
    darworms.notes.B,
    darworms.notes.CS,
    darworms.notes.D,
    darworms.notes.E,
    darworms.notes.FS,
    darworms.notes.GS
  ],
  "B Major": [
    darworms.notes.B,
    darworms.notes.CS,
    darworms.notes.DS,
    darworms.notes.E,
    darworms.notes.FS,
    darworms.notes.GS,
    darworms.notes.AS
  ],
  "B Minor": [
    darworms.notes.B,
    darworms.notes.CS,
    darworms.notes.D,
    darworms.notes.E,
    darworms.notes.FS,
    darworms.notes.G,
    darworms.notes.A
  ],
  "C Major": [
    darworms.notes.C1,
    darworms.notes.D,
    darworms.notes.E,
    darworms.notes.F,
    darworms.notes.G,
    darworms.notes.A,
    darworms.notes.B
  ],
  "C Minor": [
    darworms.notes.C1,
    darworms.notes.D,
    darworms.notes.EF,
    darworms.notes.F,
    darworms.notes.G,
    darworms.notes.AF,
    darworms.notes.BF
  ],

  "D Major": [
    darworms.notes.D,
    darworms.notes.E,
    darworms.notes.FS,
    darworms.notes.G,
    darworms.notes.A,
    darworms.notes.B,
    darworms.notes.CS
  ],

  "E Major": [
    darworms.notes.E,
    darworms.notes.FS,
    darworms.notes.GS,
    darworms.notes.A,
    darworms.notes.B,
    darworms.notes.CS,
    darworms.notes.DS
  ],
  "F Major": [
    darworms.notes.F,
    darworms.notes.G,
    darworms.notes.A,
    darworms.notes.BF,
    darworms.notes.C2,
    darworms.notes.D,
    darworms.notes.E
  ],
  "F Minor": [
    darworms.notes.F,
    darworms.notes.G,
    darworms.notes.AF,
    darworms.notes.BF,
    darworms.notes.C2,
    darworms.notes.DF,
    darworms.notes.EF
  ],
  "G Major": [
    darworms.notes.G,
    darworms.notes.A,
    darworms.notes.B,
    darworms.notes.C2,
    darworms.notes.D,
    darworms.notes.E,
    darworms.notes.FS
  ],
  "G Minor": [
    darworms.notes.G,
    darworms.notes.A,
    darworms.notes.BF,
    darworms.notes.C2,
    darworms.notes.D,
    darworms.notes.EF,
    darworms.notes.F
  ]
};
 export const  dnaregx = /^[ABCDEF\?\*]{63}X$/;
export class Worm {
  constructor(colorIndex, state) {
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
    this.typeName = "";
    this.directionIndex = 0;
    this.diedAtFrame = 0;
    this.showTutorial = true;


    this.musickeyName = "C Major";

    this.MusicScale = [],

      this.audioSamplesPtrs = [];
    this.pos = new Point(-1, -1);
    this.startingPos = new Point(-1, -1);

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

  init(wType) {
    this.nMoves = 0;
    this.score = 0;
    this.prevScore = 0;
    this.MusicScale = musicalkeys["C Major"];
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
    if (wType === 4) { // smart
      for (var k = 0; k < 64; k = k + 1) {
        this.dna[k] = darworms.dwsettings.codons.smart;
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

  setNotes(index) {
    this.instrument = index;
    this.audioSamplesPtrs.length = 0;
    for (var j = 0; j < 7; j = j + 1) {
      this.audioSamplesPtrs.push(index); // c2,wav
    }

  }
  setKey(keyName) {
    if(logging()) console.log(" keyname: " + keyName)
    this.musickeyName = keyName;
    this.MusicScale = musicalkeys[keyName];
  }

  playScale() {
    for (var j = 0; j < 7; j = j + 1) {
      darworms.directionIndex = j;
      var sorted = this.MusicScale;
      sorted.sort(function(a, b) {
        return a - b;
      });
      setTimeout(function(that, index, notes) {
        if (that.audioSamplesPtrs[index] >= 0) {
          darworms.audioSamples[that.audioSamplesPtrs[index]].
          playSample(darworms.audioPlaybackRates[notes[index]], 0.0);
        }
        //do what you need here
      }, 500 * j, this, j, sorted);

    }
  }
  getMoveDir(value) {
    if (value === 0x3F) { // trapped
      this.state = wormStates.dead;
      this.died = true;
      return 6;
    }
    return this.dna[value & 0x3F];
  };
  shouldDrawScore() {
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
  randomize() {
    var dir;
    for (var i = 0; i < 63; i = i + 1) {
      // if(logging()) console.log(" randomize loop start  i = " + i + " dna[i] = " + this.dna[i]);
      if (this.dna[i] === darworms.dwsettings.codons.unSet) {
        for (var j = 0; j < 1000; j = j + 1) {
          dir = Math.floor(Math.random() * 6);
          //if(logging()) console.log( " dir = " + dir +  " i=" + i + " outMask[dir] = " + outMask[dir] + "& = " + (i & outMask[dir]));
          if ((i & darworms.outMask[dir]) === 0) {
            this.dna[i] = dir;
            this.numChoices += 1;
            // if(logging()) console.log(" Setting dir 0x" + i.toString(16) + " to " + compassPts[dir]);
            break;
          }
        }
        if (this.dna[i] === darworms.dwsettings.codons.unSet) {
          if(logging()) console.log("Error we rolled craps 10,000 times in a row");
        }
      }
      // if(logging()) console.log(" randomize loop end  i = " + i + " dna[i] = " + this.dna[i]);
    }
    this.toText();
  };
  log() {
    var dir;
    if(logging()) console.log(" Worm State: " + darworms.wormStateNames[this.state] + " at " + (this.pos !== undefined ? this.pos.format() : "position Undefined"));
  };
  place(aState, aGame, pos) {
    this.pos = pos;
    this.startingPos = pos;
    this.nMoves = 0;
    this.score = 0;
    this.state = aState;
    if(logging()) console.log(" placing worm   i = " + this.colorIndex + " state " + aState + " " + this.numChoices + " of 64 possible moves defined");
  };
  dump() {
    for (var i = 0; i < 64; i = i + 1) {
      if(logging()) console.log(" dna" + i + " = " + darworms.compassPts[this.dna[i]]);
      var spokes = [];
      for (var spoke = 0; spoke < 6; spoke = spoke + 1) {
        if ((i & darworms.outMask[spoke]) !== 0) {
          spokes.push(darworms.compassPts[spoke]);
        }
      }
      if(logging()) console.log(" dna" + i + " " + spokes + " = " + darworms.compassPts[this.dna[i]]);
    }

  };


  toText() {
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
      if (this.dna[i] === 8) this.name += '*';

      if (this.dna[i] > 8) this.name += '#';
    };
    return this.name;
  };

  fromText(dnastring) {

    if (!(dnaregx.test(dnastring))) {
      alert("illegal character in dna  " + dnastring );
      gooddna = false;return false;
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
        case '*':
          this.dna[i] = 8;
          break;

        default:
          alert(" illegal dna string at position " + (i + 1));
          return (false);
      }
      if (!(((1 << this.dna[i]) & i) === 0) && (this.dna[i] !== 6) && (this.dna[i] !== 8)) {
        alert("illegal direction " + dnastring.charAt(i) + " (" + darworms.compassPts[this.dna[i]] +
          ")" + "given for cell " + i);
        gooddna = false;
      }
    }
    if (gooddna) {
      this.toText();
    }
    return gooddna;
  };

  emailDarworm () {
    if(logging()) console.log("Emailing: " + this.toText());
    var mailtourl = "mailto:?subject=" +
      encodeURIComponent("Check out this cool Darworm") +
      "&body=" +
      encodeURIComponent("Darworms is a free web game available at \n") +
      encodeURIComponent( darworms.host + "\n") +
      // encodeURIComponent('<a href ="https://dmaynard.github.io/Darworms/public> Darworms" </a>') +
      encodeURIComponent("You can copy the darworm string below and then go to the game and paste the text into one of the players\n") +
      encodeURIComponent(this.toText());
    if(logging()) console.log("url: " + mailtourl);

    // document.location.href = mailtourl;
    window.open(mailtourl);

  }
  getNumGenes ( val ) {
    const reducer = ((accumulator, currentValue) => accumulator + ((currentValue === val ) ? 1 : 0));
    var codons = this.dna.reduce ( reducer, 0);  //  how many condons are set
    return codons;
  }
  getSmartMove( possibleMoves, center, currentState ) {
    const towardsCenterBonus = 30;
    const dnaDistributionBonus = 30;
    const nonlinearBonus = 30;
    const dnaNoneBonus = 60;
    //  score increased depending on the number of spokes in the dest cells
    const singleSpokes  = [ 1, 2, 4, 8, 16, 32];
    const oppositeDirs = [3, 4, 5, 0, 1, 2];
    const destSpokes = [0, 10, 40, 10, 60, 0, 0 ];  // we like cells with 4 spokes!
    var totalscore = 0;
    const reducer = ((accumulator, currentValue) => accumulator + (currentValue == 8 ? 0 : 1));
    var codons = this.dna.reduce ( reducer, 0);  //  how many condons are set
    log (" codons set: " + codons);
    possibleMoves.forEach( (pickTarget) => {
      pickTarget.score = 0;
      //  note excellent candidate for functional programming Here
      var reducedir =  ((accumulator, currentValue) => accumulator + ((currentValue == pickTarget.dir )? 1  : 0));
      // how many codons already point in this direction ?
      var nThisDir =  this.dna.reduce ( reducedir, 0);
      if ( nThisDir < (codons/6) ) {
        pickTarget.score += dnaDistributionBonus; // deficit of moves in this directions
      }
      if ( nThisDir == 1 ) { // onnly the forced move so far
        pickTarget.score += dnaNoneBonus; // no moves in this direction yet
      }

      if(logging()) console.log( " n in dir " + pickTarget.dir + " = " + nThisDir);
      pickTarget.score += destSpokes[numOneBits(pickTarget.spokes)];
      if (this.pos.x < center.x && ( pickTarget.dir == 0 || pickTarget.dir == 1  || pickTarget.dir == 5)) {
        pickTarget.score += towardsCenterBonus;
      }
      if (this.pos.x > center.x && ( pickTarget.dir == 2 || pickTarget.dir == 3  || pickTarget.dir == 4)) {
        pickTarget.score += towardsCenterBonus;
      }
      if (this.pos.y < center.y && (  pickTarget.dir == 1  || pickTarget.dir == 2)) {
        pickTarget.score += towardsCenterBonus;
      }
      if (this.pos.y > center.y && ( pickTarget.dir == 4 || pickTarget.dir == 5)) {
        pickTarget.score += towardsCenterBonus;
      }
      singleSpokes.forEach ( (val, i)  => {
        if (val == currentState) {  // a cell with a single spoke in
          if (pickTarget.dir != oppositeDirs [i]) {  // boost non-straight line directions
            pickTarget.score += nonlinearBonus;
          }
        }
      });
    });

    var  totalReducer = ((accumulator, currentPossible) => accumulator + (currentPossible.score));
    var totalScore = possibleMoves.reduce(totalReducer, 0);
    if(logging()) console.log( " total score " + totalScore);
    //  pick a weighted random directions
    var selectedDirection = -1;
    var weighted = Math.floor(Math.random() * totalScore);
    possibleMoves.forEach( (pickTarget) => {
      if ((weighted > 0) && (weighted < pickTarget.score)) {
        selectedDirection = pickTarget.dir;
      } else {
        weighted = weighted - pickTarget.score;
      }
    })
    if (selectedDirection > 0 ) {
      return selectedDirection;
    };
    //  emergency escape valve
    var which = Math.floor(Math.random() * possibleMoves.length);
    return ( possibleMoves[which].dir);
  }

  completeDarwormAI() {
    if(logging()) console.log(" complete completeDarwormAI called");
    this.dna.forEach( (value, index) => {
      if (value === darworms.dwsettings.codons.unSet) {
        this.dna[index] = darworms.dwsettings.codons.smart;
      }
    }
  );
  }
  completeDarwormRand() {
    if(logging()) console.log(" complete completeDarwormRand called");
    this.dna.forEach( (value, index) => {
      var possibleMoves = [];
      if (value === darworms.dwsettings.codons.unSet) {
        for (var dir = 0; dir < 6; dir ++) {
          if( (index & darworms.outMask[dir]) == 0 ) {
            possibleMoves.push(dir);
          }
        }
        this.dna[index] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      }
    }
  );
  }
};
/* end of Worm */
