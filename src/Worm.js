//  Worm.js
import {
  Point
} from "./Point.js";
import {
  darworms
} from "./loader.js";
import {
  log
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
    log(" keyname: " + keyName)
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
      // log(" randomize loop start  i = " + i + " dna[i] = " + this.dna[i]);
      if (this.dna[i] === darworms.dwsettings.codons.unSet) {
        for (var j = 0; j < 1000; j = j + 1) {
          dir = Math.floor(Math.random() * 6);
          //log( " dir = " + dir +  " i=" + i + " outMask[dir] = " + outMask[dir] + "& = " + (i & outMask[dir]));
          if ((i & darworms.outMask[dir]) === 0) {
            this.dna[i] = dir;
            this.numChoices += 1;
            // log(" Setting dir 0x" + i.toString(16) + " to " + compassPts[dir]);
            break;
          }
        }
        if (this.dna[i] === darworms.dwsettings.codons.unSet) {
          log("Error we rolled craps 10,000 times in a row");
        }
      }
      // log(" randomize loop end  i = " + i + " dna[i] = " + this.dna[i]);
    }
    this.toText();
  };
  log() {
    var dir;
    log(" Worm State: " + darworms.wormStateNames[this.state] + " at " + (this.pos !== undefined ? this.pos.format() : "position Undefined"));
  };
  place(aState, aGame, pos) {
    this.pos = pos;
    this.startingPos = pos;
    this.nMoves = 0;
    this.score = 0;
    this.state = aState;
    log(" placing worm   i = " + this.colorIndex + " state " + aState + " " + this.numChoices + " of 64 possible moves defined");
  };
  dump() {
    this.log();
    for (var i = 0; i < 64; i = i + 1) {
      log(" dna" + i + " = " + darworms.compassPts[this.dna[i]]);
      var spokes = [];
      for (var spoke = 0; spoke < 6; spoke = spoke + 1) {
        if ((i & darworms.outMask[spoke]) !== 0) {
          spokes.push(darworms.compassPts[spoke]);
        }
      }
      log(" dna" + i + " " + spokes + " = " + darworms.compassPts[this.dna[i]]);
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
      if (this.dna[i] > 7) this.name += '#';
    };
    return this.name;
  };

  fromText(dnastring) {
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
          return (false);
      }
      if (!(((1 << this.dna[i]) & i) === 0) && (this.dna[i] !== 6)) {
        alert("illegal direction " + dnastring.charAt(i) + "(" + darworms.compassPts[this.dna[i]] +
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
    log("Emailing: " + this.toText());
    var mailtourl = "mailto:?subject=" +
      encodeURIComponent("Check out this cool Darworm") +
      "&body=" +
      encodeURIComponent("Darworms is a free web game available at \n") +
      encodeURIComponent( darworms.host + "\n") +
      // encodeURIComponent('<a href ="https://dmaynard.github.io/Darworms/public> Darworms" </a>') +
      encodeURIComponent("You can copy the darworm string below and then go to the game and paste the text into one of the players\n") +
      encodeURIComponent(this.toText());
    log("url: " + mailtourl);

    // document.location.href = mailtourl;
    window.open(mailtourl);

  }

};
/* end of Worm */
