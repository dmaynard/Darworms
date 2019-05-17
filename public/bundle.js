/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/21/13
 * Time: 11:37 PM
 */

class  Point {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  isEqualTo (other) {
      return this.x == other.x && this.y == other.y;
  };
  add (other) {
  //    console.log (" adding (" + other.x + "," + other.y + " to (" + this.x + "," + this.y );
      this.x = this.x + other.x;
      this.y = this.y + other.y;
    }
  dist(other) {
        //  console.log (" dist from (" + other.x + "," + other.y + ") to (" + this.x + "," + this.y );
        return Math.sqrt((this.x - other.x ) * (this.x - other.x) +  (this.y - other.y) * (this.y - other.y));
    }
  absDiff (other) {
        //  console.log (" dist from (" + other.x + "," + other.y + ") to (" + this.x + "," + this.y );
        return new Point( Math.abs(this.x-other.x) , Math.abs(this.y-other.y));
    }
  wrap (wg, hg) {
        if (this.x >= wg) this.x = this.x - wg;
        if (this.x < 0) this.x = this.x + wg;
        if (this.y >= hg) this.y = this.y - hg;
        if (this.y < 0) {
            this.y = this.y + hg;
        }
    };

    format ( ) {
        return "(" + this.x + "," + this.y + ")";
    };

    print ( ) {
      console.log ( " Private class variable " + privateString);
    }
}

var darworms$1 = {
  version: "0.9.2",
  // host: "localhost:5000",
  host: "https://dmaynard.github.io/Darworms/public",
  compassPts: ["e", "se", "sw", "w", "nw", "ne", "unSet", "isTrapped"],
  gameStates: {
    "over": 0,
    "running": 1,
    "waiting": 2,
    "paused": 3,
    "animToUI": 4,
    "animFromUI": 5
  },
  wormStates: {
    "dead": 0,
    "moving": 1,
    "paused": 2,
    "sleeping": 3,
    "dying": 4 //  dead but let the game keep going for a few frames to animate
  },
  wormStateNames: ["dead", "moving", "paused", "sleeping", "dying"],
  initialWormStates: [3, 2, 2, 2],
  themes: ["c", "d", "e", "f"],
  selectedIdx: 0,
  gameStateNames: ["over", "running", "waiting", "paused", "to_ui", "from_ui"],
  outMask: [1, 2, 4, 8, 16, 32],
  inMask: [8, 16, 32, 1, 2, 4],
  colorNames: ['red', 'green', 'blue', 'yellow'],
  buttonSelectors: ['#p1button', '#p2button', '#p3button', '#p4button'],
  buttonLSelectors: ['#p1Lbutton', '#p2Lbutton', '#p3Lbutton', '#p4Lbutton'],
  inDir: [3, 4, 5, 0, 1, 2],
  wCanvasPixelDim: [0, 0],
  wCanvasRef: undefined,
  minTwoColumnWidth: 480,
  leftColumnWidth: 320,
  screens: {},
  pickCells: [],
  graphics: {
    timer: undefined,
    scorectx: undefined,
    animFrame: 0,
    uiFrames: 0,
    rawFrameCount: 0,
    drawFrameCount: 0,
    uiFrameCount: 0,
    xPts: [0.5, 0.25, -0.25, -0.5, -0.25, 0.25],
    yPts: [0.0, 0.5, 0.5, 0.0, -0.5, -0.5],
    fps: 4,  //  initial frame rate
    frameInterval: 33.33333,
    uifps: 30,
    uiInterval: 33.33333,
    startTime: 0,
    now: 0,
    then: 0,
    uiThen: 0,
    elapsed: 0,
    uiElapsed: 0,
    vertex_x: [0.5, 0.5, 0, -0.5, -0.5, 0],
    vertex_fudge: 0.12,
    vertex_y: [0.3125, -0.3125, -0.6875, -0.3125, 0.3125, 0.6875],
    hexSize: 1.0,
    sqrt3: Math.sqrt(3),
    dyningAnimationFrames: 8

  },
  selectedDarworm: 0,
  notes: {
    C1: 0,
    CS: 1,
    DF: 1,
    D: 2,
    DS: 3,
    EF: 3,
    E: 4,
    F: 5,
    FS: 6,
    GF: 6,
    G: 7,
    GS: 8,
    FF: 8,
    AF: 8,
    A: 9,
    AS: 10,
    BF: 10,
    B: 11,
    C2: 12
  },

  dwsettings: {   //  User adjustable settings
    forceInitialGridSize: true,
    largeGridSize: 18, // The original Atari 800 Character mode
    smallGridSize: 10, // so cells can be selected with touch
    minLargeWidth: 400, //
    isLargeScreen: true,
    doAudio: 1,
    fixedInitPos: true,
    pickDirectionUI: 0,
    noWhere: undefined,
    gridGeometry: "torus",
    codons: {
      "e": 0,
      "ne": 1,
      "nw": 2,
      "w": 3,
      "sw": 4,
      "se": 5,
      "unSet": 6,
      "isTrapped": 7
    },
    colorTable: ["#000000", "#EE0000", "#00EE00", "#0404EE",
      "#D0A000", "#448833", "#443388", "#338844",
      "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
      "#884433", "#448833", "#443388", "#338844"
    ],
    alphaColorTable: ["rgba(  0,   0,   0, 0.2)",
      "rgba(  238,   0,   0, 0.4)", "rgba(    0, 128,   0, 0.4)", "rgba(    0,   0, 238, 0.4)", "rgba(  200, 200, 0, 0.4)",
      "#FFD70080", "#5fa40480", "#44338880", "#33884480",
      "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
      "#88443380", "#44883380", "#44338880", "#33884480"
    ],
    backGroundTheme: 0,
    doAnimations: true,
    gridBackground: ["#F5F5F5", "#404040"],
    cellBackground: ["#F5F5F5", "#404040"],
    masterAudioVolume: 0.3,
    gridSize: 18
  },
  images: {},
  audioContext: undefined,
  masterGainNode: undefined,

  audioPanner: undefined,
  audioSamples: [],
  // an array of 12 playback rates ranging from 0.5 to 1.0
  // this gives 12 notes from an octave in an equal tempered scale.
  audioPlaybackRates: [],
  audioFrequencies: [],
  gameTxt: null
  // gameTxt: '{"version":"0.9.1","createdAt":"Fri May 10 2019 21:33:43 GMT-0700 (Pacific Daylight Time)","numMoves":263,"numTurns":83,"width":10,"backGroundTheme":"1","doAnimations":true,"doAudio":"1","gridGeometry":"torus","fixedInitPos":"1","pickDirectionUI":"0","masterAudioVolume":0.3,"fps":"30","players":[{"index":0,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"FBFEBEEDCBFFEFFFDDDCFDADBFFFABFFBBDCBBAECEAEAEAEDCADBDADACACBBAX","score":14,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]},{"index":1,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"DCEEADEEEBCFEFFEFBCDBFFFFBFFAFFFBDADAEADBEAEABAECDDDADDDBBACABAX","score":13,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]},{"index":2,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"BCFDEDEECBACFBAFCCDCDFADCCCFABAFDEDEEDADBECCEEEEABDDBBADCBCCABAX","score":22,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]},{"index":3,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"AEDCFDFDECAEEBEFCFFDFFDDFBFFBFAFDBEEAEADEEACAEAEADADBBADBCACABAX","score":17,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]}]}'
};

window.addEventListener("load", function() {
    // console.log(" stage 1 loading finished");
    window.onerror = function(msg, url, line) {
      alert(msg + " " + url + " " + line);
    };
    $("[data-darworm='selector']").on('pageshow', darworms$1.main.setupEditPage);
    $("[data-darworm='selector']").on('pagehide', darworms$1.main.setSelectedDarwormType);
    $("#settingspage").on('pageshow', darworms$1.main.showSettings);
    $("#settingspage").on('pagebeforeshow', darworms$1.main.setupGridGeometry);
    $("#settingspage").on('pagehide', darworms$1.main.applySettings);
    $("#playpage").on('pageshow', darworms$1.main.initPlayPage);
    $("#playpage").on('pagehide', darworms$1.main.leavePlayPage);
    $("#edit-darworm-page").on('pageshow', darworms$1.main.initEditPage);
    $("#edit-darworm-page").on('pagehide', darworms$1.main.leaveditPage);
    $("#loadsavepage").on('pageshow', darworms$1.main.loadSavedGames);
    $("#loadsavepage").on('pagehide', darworms$1.main.freeSavedGames);

    $( "#tutorialpopup" ).popup({
        afterclose: function( event, ui ) {
          console.log(" afterclose even fired" + $('#tutorialpopup input[type=checkbox]').prop("checked"));
          if ( $('#tutorialpopup input[type=checkbox]').prop("checked") ) {
            darworms$1.theGame.focusWorm.showTutorial = false;
          }
        }
    });
    console.log("About to call darworms.main.init()");
    window.darworms = darworms$1;  // So index.html onclick can find handlers
    darworms$1.main.init();

  }

);

/**
 * Created by dmaynard on 1/19/15.
 */

function AudioSample(name, location) {
    this.location = location;
    this.name = name;
    this.incomingbuffer = undefined;
    this.savedBuffer = undefined;
    var xhr = new XMLHttpRequest();
    xhr.open('get',location, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = (function () {
        darworms$1.audioContext.decodeAudioData(xhr.response,
            (function(incomingBuffer) {
                // console.log( "on Load incoming Buffer");
                // console.log(" xhr " + xhr.status + "  " + xhr.statusText);
                // console.log(" incoming buffer = " + incomingBuffer );
                // console.log ( " this.name " + this.name);
                this.savedBuffer = incomingBuffer; // Save the buffer, we'll reuse it
            }
        ).bind(this));
    }).bind(this);
    xhr.send();
    darworms$1.audioSamples.push(this);
}

AudioSample.prototype.playSample = function (rate, pan) {
    var source;
    // console.log(" playSample " + this.name + "  " + this.location + "  savedBuffer " + this.savedBuffer);
    if (darworms$1.audioContext !== undefined && this.savedBuffer !== undefined) {
        // Do we have to create a new buffer every time we play a note ?
        source = darworms$1.audioContext.createBufferSource();
        source.buffer = this.savedBuffer;
        darworms$1.masterGainNode.gain.value = darworms$1.dwsettings.masterAudioVolume;
        source.connect(darworms$1.masterGainNode);
        // console.log(" playSample " + this.name + " volume  " + darworms.masterGainNode.gain.value);
        if ( darworms$1.audioPanner !== undefined ) {
          darworms$1.masterGainNode.connect(darworms$1.audioPanner);
          darworms$1.audioPanner.connect(darworms$1.audioContext.destination);
        }
        else {
          darworms$1.masterGainNode.connect(darworms$1.audioContext.destination);
        }

        if ( darworms$1.audioPanner !== undefined ) {
          darworms$1.audioPanner.pan.value = (pan * 0.80) ;  // jump cut is too harsh
        }
        source.start(0); // Play sound immediately. Renamed source.start from source.noteOn
        if (rate ) {
          source.playbackRate.value = rate;
        }

    }
};

/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/21/13
 * Time: 11:57 PM
 * To change this template use File | Settings | File Templates.
 */
/*    Grid   */

  const evenRowVec = [ {x: 1,y: 0}, {x: 0,y: 1}, {x:-1,y: 1},
                       {x:-1,y: 0}, {x:-1,y:-1}, {x: 0,y:-1}];

  const oddRowVec = [ {x: 1,y: 0}, {x: 1,y: 1}, {x:0,y: 1},
                      {x:-1,y: 0}, {x: 0,y:-1}, {x: 1,y:-1}];

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
  // sink mask is high bit of spoke 6
  const sinkMask = 0x08000000;

  class  Grid {
  constructor (width, height) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);

    //  Cell Format   8 bits each:  in-spoke eaten, out-spoke eaten, spoke eaten
    this.cells = new Array(width * height);

    //  7 * 4 bits of color index info for color of each spoke and center
    this.colors = new Array(width * height);
    this.clear();
  }

  clear () {
    for (var i = 0; i < this.cells.length; i++) this.cells[i] = 0;
    for (var i = 0; i < this.colors.length; i++) this.colors[i] = 0;
    // We implement reflecting at grid edges by
    // filling all of the spokes that would leave
    // the grid or wrap
    if (darworms$1.dwsettings.gridGeometry == 'reflect') {
      for (var i = 0; i < this.width; i = i + 1) {
        var topPoint = new Point(i, 0);
        var botPoint = new Point(i, this.height - 1);

        this.setValueAt(topPoint, this.valueAt(topPoint) | darworms$1.outMask[4] | darworms$1.outMask[5]); // block up
        this.setValueAt(topPoint, this.valueAt(topPoint) | ((this.valueAt(topPoint) & 0x3F) << 8)); // set outvec
        this.setSpokeAt(topPoint, 4, 0);
        this.setSpokeAt(topPoint, 5, 0);
        this.setSpokeAt(topPoint, 6, 0);
        this.setValueAt(botPoint, this.valueAt(botPoint) | darworms$1.outMask[1] | darworms$1.outMask[2]); // block down
        this.setValueAt(botPoint, this.valueAt(botPoint) | ((this.valueAt(botPoint) & 0x3F) << 8)); // set outvecs
        this.setSpokeAt(botPoint, 1, 0);
        this.setSpokeAt(botPoint, 2, 0);
        this.setSpokeAt(botPoint, 6, 0);

      }
      for (var j = 0; j < this.height; j = j + 1) {
        var leftPoint = new Point(0, j);
        var rightPoint = new Point(this.width - 1, j);

        if ((j & 1) == 0) { // even rows shifted left 1/2 cell
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | darworms$1.outMask[2] | darworms$1.outMask[3] | darworms$1.outMask[4]); // block left
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | ((this.valueAt(leftPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(leftPoint, 2, 0);
          this.setSpokeAt(leftPoint, 3, 0);
          this.setSpokeAt(leftPoint, 4, 0);
          this.setSpokeAt(leftPoint, 6, 0);
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | darworms$1.outMask[0]); //block right
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | ((this.valueAt(rightPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(rightPoint, 0, 0);
          this.setSpokeAt(rightPoint, 6, 0);
        } else { // odd rows shifted right on cell
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | darworms$1.outMask[3]); // block left
          this.setValueAt(leftPoint, this.valueAt(leftPoint) | ((this.valueAt(leftPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(leftPoint, 3, 0);
          this.setSpokeAt(leftPoint, 6, 0);
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | darworms$1.outMask[5] | darworms$1.outMask[0] | darworms$1.outMask[1]); //block right
          this.setValueAt(rightPoint, this.valueAt(rightPoint) | ((this.valueAt(rightPoint) & 0x3F) << 8)); // set outvecs
          this.setSpokeAt(rightPoint, 5, 0);
          this.setSpokeAt(rightPoint, 0, 0);
          this.setSpokeAt(rightPoint, 1, 0);
          this.setSpokeAt(rightPoint, 6, 0);
        }
      }
    }
  };
  valueAt (point) {
    return this.cells[point.y * this.width + point.x];
  };
  hexValueAt (point) {
    return (" 0x" + (this.valueAt(point)).toString(16));
  };
  stateAt (point) {
    return this.valueAt(point) & 0x3F;
  };
  outVectorsAt (point) {
    return (this.valueAt(point) >> 8) & 0x3F;
  };
  inVectorsAt (point) {
    return (this.valueAt(point) >> 16) & 0x3F;
  };
  spokeAt (point, dir) {
    return (this.colors[point.y * this.width + point.x] >>> (dir * 4)) & 0x07;
  };
  colorsAt (point) {
    return (this.colors[point.y * this.width + point.x]);
  }

  setSpokeAt (point, dir, colorIndex) {
    this.colors[point.y * this.width + point.x] =
      ((this.colors[point.y * this.width + point.x]) & spokeMask[dir]) |
      ((colorIndex & 0x0F) << (dir * 4));

  };
  setValueAt (point, value) {
    this.cells[point.y * this.width + point.x] = value;
  };

  setSinkAt (point) {
    this.cells[point.y * this.width + point.x] =
        (this.cells[point.y * this.width + point.x] ^ sinkMask);
  };

  isSink (point) {
    return ( (this.cells[point.y * this.width + point.x] & sinkMask) !== 0);
  };

  isInside (point) {
    return point.x >= 0 && point.y >= 0 &&
      point.x < this.width && point.y < this.height;
  };
  move (from, to, dir, colorIndex) {
    if ((this.inVectorsAt(to) & darworms$1.inMask[dir]) !== 0) {
      alert(" Attempted to eat eaten spoke at " + to.format());
      console.log("  (" + to.x + "," + to.y + ") dir: " + dir + " value: ");
      console.log("Attempted to eat eaten spoke at " + to.format() + " dir " + dir + " value: 0x" + this.valueAt(to).toString(16));
    }
    this.setValueAt(to, this.valueAt(to) | darworms$1.inMask[dir] | (darworms$1.inMask[dir] << 16));
    this.setValueAt(from, this.valueAt(from) | darworms$1.outMask[dir] | (darworms$1.outMask[dir] << 8));
    this.setSpokeAt(from, dir, colorIndex);
    this.setSpokeAt(from, 6, colorIndex);
    this.setSpokeAt(to, darworms$1.inDir[dir], colorIndex);
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
  next (point, dir) {
    var nP = new Point(point.x, point.y);
    // console.log ("  (" + point.x  + "," + point.y + ") dir: " + dir);
    if ((point.y & 1) === 0) {
      nP.add(evenRowVec[dir]);
    } else {
      nP.add(oddRowVec[dir]);
    }
    if ((darworms$1.dwsettings.gridGeometry == 'falloff' && ((nP.x < 0) || (nP.x > this.width - 1) || (nP.y < 0) || (nP.y > this.height - 1)))) {
      // console.log ("  (" + nP.x  + "," + nP.y + ") returning noWhere");
      return darworms$1.dwsettings.noWhere;
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
  each (action) {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var point = new Point(x, y);
        action(point, this.valueAt(point));
      }
    }
  };
  logSpokesAt (point) {
    console.log("[ " + point.x + "," + point.y + "] val = " + this.colorsAt(point).toString(16));
    for (var dir = 0; dir < 8; dir = dir + 1) {
      console.log("   spoke: " + dir + " colorindex" + this.spokeAt(point, dir));

    }
  };
  logValueAt (point) {
    console.log("[ " + point.x + "," + point.y + "] val = 0x" + this.hexValueAt(point) +
      this.dirList(this.hexValueAt(point)) + " outVectors = 0x" +
      this.outVectorsAt(point).toString(16) + this.dirList(this.outVectorsAt(point)) +
      " inVectors = 0x" + this.inVectorsAt(point).toString(16));
  };
  formatStateAt (point) {
    return " x " + point.x + " y " + point.y + " state 0x" + this.stateAt(point).toString(16);
  };
  dirList (state) {
    var list = " directions ";
    for (var dir = 0; dir < 6; dir = dir + 1) {
      if (((state & darworms$1.outMask[dir]) !== 0)) {
        list = list + " " + darworms$1.compassPts[dir];
      }
    }
    return list;
  }
}


/* end Grid */

/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:00 AM
 * To change this template use File | Settings | File Templates.
 */
/* Worm Object */

const musicalkeys = {
  "AMajor": [
    darworms$1.notes.A,
    darworms$1.notes.B,
    darworms$1.notes.CS,
    darworms$1.notes.D,
    darworms$1.notes.E,
    darworms$1.notes.FS,
    darworms$1.notes.GS
  ],
  "BMajor": [
    darworms$1.notes.B,
    darworms$1.notes.CS,
    darworms$1.notes.DS,
    darworms$1.notes.E,
    darworms$1.notes.FS,
    darworms$1.notes.GS,
    darworms$1.notes.AS
  ],
  "CMajor": [
    darworms$1.notes.C1,
    darworms$1.notes.D,
    darworms$1.notes.E,
    darworms$1.notes.F,
    darworms$1.notes.G,
    darworms$1.notes.A,
    darworms$1.notes.B
  ],
  "CMinor": [
    darworms$1.notes.C1,
    darworms$1.notes.D,
    darworms$1.notes.EF,
    darworms$1.notes.F,
    darworms$1.notes.G,
    darworms$1.notes.AF,
    darworms$1.notes.BF
  ],

  "DMajor": [
    darworms$1.notes.D,
    darworms$1.notes.E,
    darworms$1.notes.FS,
    darworms$1.notes.G,
    darworms$1.notes.A,
    darworms$1.notes.B,
    darworms$1.notes.CS
  ],

  "EMajor": [
    darworms$1.notes.E,
    darworms$1.notes.FS,
    darworms$1.notes.GS,
    darworms$1.notes.A,
    darworms$1.notes.B,
    darworms$1.notes.CS,
    darworms$1.notes.DS
  ],
  "FMajor": [
    darworms$1.notes.F,
    darworms$1.notes.G,
    darworms$1.notes.A,
    darworms$1.notes.BF,
    darworms$1.notes.C2,
    darworms$1.notes.D,
    darworms$1.notes.E
  ],
  "GMajor": [
    darworms$1.notes.G,
    darworms$1.notes.A,
    darworms$1.notes.B,
    darworms$1.notes.C2,
    darworms$1.notes.D,
    darworms$1.notes.E,
    darworms$1.notes.FS
  ]
};

class Worm {
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


    this.musickeyName = "CMajor";

    this.MusicScale = [],

      this.audioSamplesPtrs = [];
    this.pos = new Point(-1, -1);
    this.startingPos = new Point(-1, -1);

    for (var i = 0; i < 64; i = i + 1) {
      this.dna[i] = darworms$1.dwsettings.codons.unSet;
    }

    this.dna[63] = darworms$1.dwsettings.codons.isTrapped;
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
    this.MusicScale = musicalkeys["CMajor"];
    if (wType === 0) { // none   asleep
      this.state = 3; // sleeping
    }
    if (wType === 1) { // random
      for (var i = 0; i < 64; i = i + 1) {
        this.dna[i] = darworms$1.dwsettings.codons.unSet;
      }
      this.dna[63] = darworms$1.dwsettings.codons.isTrapped;
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
        this.dna[k] = darworms$1.dwsettings.codons.unSet;
      }
      this.dna[63] = darworms$1.dwsettings.codons.isTrapped;
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
    console.log(" keyname: " + keyName);
    this.musickeyName = keyName;
    this.MusicScale = musicalkeys[keyName];
  }

  playScale() {
    for (var j = 0; j < 7; j = j + 1) {
      darworms$1.directionIndex = j;
      var sorted = this.MusicScale;
      sorted.sort(function(a, b) {
        return a - b;
      });
      setTimeout(function(that, index, notes) {
        if (that.audioSamplesPtrs[index] >= 0) {
          darworms$1.audioSamples[that.audioSamplesPtrs[index]].
          playSample(darworms$1.audioPlaybackRates[notes[index]], 0.0);
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
      // console.log(" randomize loop start  i = " + i + " dna[i] = " + this.dna[i]);
      if (this.dna[i] === darworms$1.dwsettings.codons.unSet) {
        for (var j = 0; j < 1000; j = j + 1) {
          dir = Math.floor(Math.random() * 6);
          //console.log( " dir = " + dir +  " i=" + i + " outMask[dir] = " + outMask[dir] + "& = " + (i & outMask[dir]));
          if ((i & darworms$1.outMask[dir]) === 0) {
            this.dna[i] = dir;
            this.numChoices += 1;
            // console.log(" Setting dir 0x" + i.toString(16) + " to " + compassPts[dir]);
            break;
          }
        }
        if (this.dna[i] === darworms$1.dwsettings.codons.unSet) {
          console.log("Error we rolled craps 10,000 times in a row");
        }
      }
      // console.log(" randomize loop end  i = " + i + " dna[i] = " + this.dna[i]);
    }
    this.toText();
  };
  log() {
    console.log(" Worm State: " + darworms$1.wormStateNames[this.state] + " at " + (this.pos !== undefined ? this.pos.format() : "position Undefined"));
  };
  place(aState, aGame, pos) {
    this.pos = pos;
    this.startingPos = pos;
    this.nMoves = 0;
    this.score = 0;
    this.state = aState;
    console.log(" placing worm   i = " + this.colorIndex + " state " + aState + " " + this.numChoices + " of 64 possible moves defined");
  };
  dump() {
    this.log();
    for (var i = 0; i < 64; i = i + 1) {
      console.log(" dna" + i + " = " + darworms$1.compassPts[this.dna[i]]);
      var spokes = [];
      for (var spoke = 0; spoke < 6; spoke = spoke + 1) {
        if ((i & darworms$1.outMask[spoke]) !== 0) {
          spokes.push(darworms$1.compassPts[spoke]);
        }
      }
      console.log(" dna" + i + " " + spokes + " = " + darworms$1.compassPts[this.dna[i]]);
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
    }    return this.name;
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
        alert("illegal direction " + dnastring.charAt(i) + "(" + darworms$1.compassPts[this.dna[i]] +
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
    console.log("Emailing: " + this.toText());
    var mailtourl = "mailto:?subject=" +
      encodeURIComponent("Check out this cool Darworm") +
      "&body=" +
      encodeURIComponent("Darworms is a free web game available at \n") +
      encodeURIComponent("https://dmaynard.github.io/Darworms/public\n") +
      // encodeURIComponent('<a href ="https://dmaynard.github.io/Darworms/public> Darworms" </a>') +
      encodeURIComponent("You can copy the darworm string below and then go to the game and paste the text into one of the players\n") +
      encodeURIComponent(this.toText());
    console.log("url: " + mailtourl);

    // document.location.href = mailtourl;
    window.open(mailtourl);

  }

}/* end of Worm */

const xPts = [0.8, 0.4, -0.4, -0.8, -0.4, 0.4];
  const yPts = [0.0, .67, .67, 0.0, -.67, -.67];
  let pGraphics = null;

  function drawdna ( canvas, darworm, cellstate)  {
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    pGraphics = canvas.getContext("2d");
    // I have NO IDEA why this scale factor is needed
    // but experiment proves it IS needed to make circles round
    // and to fill the canvasIsDirty
    // this may be a JQuery mobile bug?
    pGraphics.setTransform( 1.5*width/2.0, 0, 0, .75*height/2, 1.5*width/2.0, .75*height/2);

    pGraphics.fillStyle = darworms$1.dwsettings.cellBackground[darworms$1.dwsettings.backGroundTheme];
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
  }

var wGraphics;
var wCanvas;
var scale;  // this really shouldm't be needed eleswhere
var grid;  // module global passed in at init time

let xPts$1 = [1.0, 0.5, -0.5, -1.0, -0.5, 0.5];
let yPts$1 = [0.0, 1.0, 1.0, 0.0, -1.0, -1.0];
let asterixSize = 0.2;
let timeInDraw = 0;
let gameElapsedTime = 0;
let frameTimes = [];
let startFrameTimes = [];
let dirtyCells = [];
let theGame = null;
function graphicsInit(game) {
  wCanvas = document.getElementById("wcanvas");
  wGraphics = wCanvas.getContext("2d");
}
function setGrid(currentGrid, game) {
   grid = currentGrid;
   timeInDraw = 0;
   frameTimes.length = 0;
   startFrameTimes.length = 0;
   theGame = game;

}

function setScale ( gridWidth, gridHeight) {
  scale = new Point((wCanvas.width / (gridWidth + 1.5)), (wCanvas.height / (gridHeight + 1)));
}
 function reScale(gridWidth, gridHeight) {
   setScale(gridWidth, gridHeight);
   console.log(" reScaled to " + scale.format());
 }
function clearCanvas() {
  // Store the current transformation matrix
  wGraphics.save();
  // Use the identity matrix while clearing the canvas
  wGraphics.setTransform(1, 0, 0, 1, 0, 0);
  wGraphics.clearRect(0, 0, wCanvas.width,  wCanvas.height);
  wGraphics.fillStyle = darworms$1.dwsettings.cellBackground[darworms$1.dwsettings.backGroundTheme];
  wGraphics.fillRect(0, 0, wCanvas.width, wCanvas.height);

  // Restore the transform
  wGraphics.restore();
  //    wGraphics.clearRect(0,0,canvas.width,canvas.height);
}
function startGameTimer() {
  gameElapsedTime =  - new Date().getTime();
}

function stopGameTimer() {
  gameElapsedTime += new Date().getTime();
}
function getOffset(point) {
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

function gsetTranslate(point) {
  var cellOffset = getOffset(point);
  wGraphics.setTransform(scale.x, 0, 0, scale.y, cellOffset.x, cellOffset.y);
  // console.log( "Drawing cell " +  point.format() + " x= " + cellOffset.x + "  y= " + cellOffset.y);
}

function drawCells() {
    wGraphics.save();
    for (var col = 0; col < grid.width; col = col + 1) {
      for (var row = 0; row < grid.height; row = row + 1) {
        drawcell(new Point(col, row));
      }
    }
    wGraphics.restore();
  }
function drawcell(point) {
  // if (point.isEqualTo(new Point (this.grid.width-1, this.grid.height/2))) {
  //     console.log(this.grid.formatStateAt(point));
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

  wGraphics.strokeStyle = darworms$1.dwsettings.colorTable[owner & 0xF];
  wGraphics.fillStyle =
    darworms$1.dwsettings.cellBackground[darworms$1.dwsettings.backGroundTheme];

  wGraphics.beginPath();
  wGraphics.moveTo(darworms$1.graphics.vertex_x[0], darworms$1.graphics.vertex_y[0]);
  for (var j = 1; j < 6; j = j + 1) {
    wGraphics.lineTo(darworms$1.graphics.vertex_x[j], darworms$1.graphics.vertex_y[j]);
  }
  // wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
  wGraphics.stroke();

  wGraphics.closePath();
  wGraphics.fill();
  // wGraphics.stroke();

  if (owner) {
    wGraphics.strokeStyle = darworms$1.dwsettings.colorTable[owner & 0xF];
    wGraphics.fillStyle =
      darworms$1.dwsettings.alphaColorTable[owner & 0xF];
    wGraphics.beginPath();
    wGraphics.moveTo(darworms$1.graphics.vertex_x[0], darworms$1.graphics.vertex_y[0]);
    for (var j = 1; j < 6; j = j + 1) {
      wGraphics.lineTo(darworms$1.graphics.vertex_x[j], darworms$1.graphics.vertex_y[j]);
    }
    // wGraphics.moveTo(darworms.graphics.vertex_x[0], darworms.graphics.vertex_y[0]);
    wGraphics.stroke();
    wGraphics.closePath();
    wGraphics.fill();
  }

  // wGraphics.stroke();



  wGraphics.fillStyle = darworms$1.dwsettings.alphaColorTable[grid.spokeAt(point, 6) & 0xF];


  // wGraphics.fillStyle =  darworms.dwsettings.cellBackground[1-darworms.dwsettings.backGroundTheme];
  wGraphics.lineWidth = 2.0 / scale.x;
  wGraphics.beginPath();
  wGraphics.arc(0, 0, 0.1, 0, Math.PI * 2, true);
  wGraphics.closePath();
  wGraphics.fill();
  //  draw hex outline
  wGraphics.strokeStyle = darworms$1.dwsettings.cellBackground[1 - darworms$1.dwsettings.backGroundTheme];
  wGraphics.lineWidth = 1.0 / scale.x;
  wGraphics.beginPath();
  wGraphics.moveTo(darworms$1.graphics.vertex_x[0], darworms$1.graphics.vertex_y[0]);
  for (var j = 1; j < 6; j = j + 1) {
    wGraphics.lineTo(darworms$1.graphics.vertex_x[j], darworms$1.graphics.vertex_y[j]);
  }
  wGraphics.lineTo(darworms$1.graphics.vertex_x[0], darworms$1.graphics.vertex_y[0]);
  wGraphics.stroke();
  wGraphics.closePath();

  var outvec = grid.outVectorsAt(point);
  var invec = grid.inVectorsAt(point);
  // console.log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

  for (var i = 0; i < 6; i = i + 1) {
    if ((outvec & darworms$1.outMask[i]) !== 0) {
      var outSpokeColor = darworms$1.dwsettings.colorTable[grid.spokeAt(point, i)];
      // console.log (" outSpokeColor " + i + " :  " + outSpokeColor + " at "  + point.format());
      wGraphics.strokeStyle = outSpokeColor;
      wGraphics.lineWidth = 2.0 / scale.x;
      wGraphics.lineCap = 'round';
      wGraphics.beginPath();
      wGraphics.moveTo(0, 0);
      wGraphics.lineTo(xPts$1[i], yPts$1[i]);
      wGraphics.stroke();
      wGraphics.closePath();
    }
    if ((invec & darworms$1.outMask[i]) !== 0) {
      wGraphics.strokeStyle = darworms$1.dwsettings.colorTable[grid.spokeAt(point, i)];
      wGraphics.lineWidth = 2.0 / scale.x;
      wGraphics.lineCap = 'round';
      wGraphics.beginPath();
      wGraphics.moveTo(xPts$1[i], yPts$1[i]);
      wGraphics.lineTo(0, 0);
      wGraphics.stroke();
      wGraphics.closePath();
    }
  }
  if (grid.isSink(point)) {
    wGraphics.strokeStyle = darworms$1.dwsettings.colorTable[0];
    for (var k = 0; k < 3; k = k + 1) {
      var m = ((k + 3) % 6);
      wGraphics.beginPath();
      wGraphics.moveTo(xPts$1[k] * asterixSize, yPts$1[k] * asterixSize);
      wGraphics.lineTo(xPts$1[m] * asterixSize, yPts$1[m] * asterixSize);
      wGraphics.stroke();
      wGraphics.closePath();
      wGraphics.lineTo(darworms$1.graphics.vertex_x[j], darworms$1.graphics.vertex_y[j]);
    }
  }  timeInDraw += Date.now();
}
function drawDirtyCells() {
  var pt;
  // wGraphics.save();
  // console.log(" Grawing dirty cells" + this.dirtyCells.length);
  while ((pt = dirtyCells.pop()) !== undefined) {
    drawcell(pt);
  }
  // wGraphics.restore();
}
function pushDirtyCell( pos ) {
  dirtyCells.push(pos);
}
function highlightWorm(worm, index) {
  if (worm.state === darworms$1.gameStates.waiting) {
    gsetTranslate(worm.pos);

    wGraphics.fillStyle = darworms$1.dwsettings.cellBackground[darworms$1.dwsettings.backGroundTheme];
    wGraphics.beginPath();
    wGraphics.arc(0, 0, 0.2, 0, Math.PI * 2, true);
    wGraphics.closePath();
    wGraphics.fill();

    wGraphics.fillStyle = darworms$1.dwsettings.alphaColorTable[worm.colorIndex];
    wGraphics.beginPath();
    wGraphics.arc(0, 0, 0.2 * ((darworms$1.graphics.animFrame & 0x1F) / 0x1F), 0, Math.PI * 2, true);
    wGraphics.closePath();
    wGraphics.fill();

  }
}

function   initPickUI(worm) {

    console.log(" initPickUI");
    darworms$1.pickCells = new Array();
    var outvec = this.grid.outVectorsAt(worm.pos);
    var inVec = this.grid.inVectorsAt(worm.pos);
    // console.log (" drawCell at" +  point.format() + " outVectors 0x" + outvec.toString(16) + " inVectors 0x" + invec.toString(16));

    for (var dir = 0; dir < 6; dir = dir + 1) {
      if (((outvec & darworms$1.outMask[dir]) == 0) && ((inVec & darworms$1.outMask[dir]) == 0)) {
        var pickTarget = {};
        pickTarget.pos = this.grid.next(worm.pos, dir);
        pickTarget.dir = dir;
        pickTarget.color = darworms$1.dwsettings.alphaColorTable[theGame.focusWorm.colorIndex];
        pickTarget.wormColorIndex = theGame.focusWorm.colorIndex;
        darworms$1.pickCells.push(pickTarget);
      }
    }
  }


  function drawPickCells() {
    var animFraction = 1.0 * (darworms$1.graphics.animFrame & 0x7F) / 128;
    if ((darworms$1.dwsettings.pickDirectionUI == 1) && (animFraction < 0.1)) {
      clearCanvas();
      drawCells(); // shound use backbuffer instead of redrawing?
    }
    darworms$1.pickCells.forEach(function(pickTarget) {
      drawPickCell(pickTarget.pos, pickTarget.color);
    });
    drawPickCellOrigin(darworms$1.theGame.focusWorm.pos,
      darworms$1.dwsettings.alphaColorTable[darworms$1.theGame.focusWorm.colorIndex]);

    if (darworms$1.dwsettings.pickDirectionUI == 1) {
      darworms$1.pickCells.forEach(function(pickTarget) {
        drawExpandedTarget(pickTarget);
      });
    }

    darworms$1.theGame.worms.forEach(function(worm, index) {
       highlightWorm(worm, index);
    }, darworms$1.theGame);
  }


function drawPickCell(point, activeColor) {
  // wGraphics.save();
  gsetTranslate(point);
  wGraphics.fillStyle = darworms$1.dwsettings.cellBackground[darworms$1.dwsettings.backGroundTheme];
  // wGraphics.fillRect(-0.5, -0.5, 1.0, 1.0);
  var owner = this.grid.spokeAt(point, 7);
  if (owner !== 0) {
    console.log(" Why is an owned cell a target selection? " + point.format(point));
  }
  drawcell(point); // set up original background for this cell

  var animFraction = 1.0 * (darworms$1.graphics.animFrame & 0x3F) / 64;

  wGraphics.strokeStyle = activeColor;
  wGraphics.fillStyle = activeColor;
  wGraphics.beginPath();
  wGraphics.moveTo(darworms$1.graphics.vertex_x[0] * animFraction, darworms$1.graphics.vertex_y[0] * animFraction);
  for (var j = 1; j < 6; j = j + 1) {
    wGraphics.lineTo(darworms$1.graphics.vertex_x[j] * animFraction, darworms$1.graphics.vertex_y[j] * animFraction);
  }
  wGraphics.moveTo(darworms$1.graphics.vertex_x[0], darworms$1.graphics.vertex_y[0]);
  wGraphics.stroke();
  wGraphics.closePath();
  wGraphics.fill();
  // wGraphics.stroke();



  wGraphics.fillStyle = darworms$1.dwsettings.alphaColorTable[this.grid.spokeAt(point, 6) & 0xF];
}function drawPickCellOrigin(point, activeColor) {
  // wGraphics.save();
  gsetTranslate(point);
  wGraphics.fillStyle = darworms$1.dwsettings.cellBackground[darworms$1.dwsettings.backGroundTheme];
  // wGraphics.fillRect(-0.5, -0.5, 1.0, 1.0);
  var owner = this.grid.spokeAt(point, 7);
  if (owner !== 0) {
    console.log(" Why is an owned cell a target selection origin? " + point.format(point));
  }
  drawcell(point); // set up original backgrounf for this cell

  var animFraction = 1.0 * (darworms$1.graphics.animFrame & 0x3F) / 64;

  wGraphics.strokeStyle = activeColor;
  wGraphics.fillStyle = activeColor;
  var outvec = this.grid.outVectorsAt(point);
  var invec = this.grid.inVectorsAt(point);
  for (var dir = 0; dir < 6; dir = dir + 1) {
    if (((outvec & darworms$1.outMask[dir]) == 0) && ((invec & darworms$1.outMask[dir]) == 0)) {


      wGraphics.lineWidth = 3.0 / scale.x;
      wGraphics.lineCap = 'round';
      wGraphics.beginPath();
      wGraphics.moveTo(0, 0);
      wGraphics.lineTo(xPts$1[dir] * animFraction, yPts$1[dir] * animFraction);
      wGraphics.stroke();
      wGraphics.closePath();

    }

  }

}function drawExpandedTarget(pickTarget) {
  // Draw the up to six large pick targets on screen perimeter
  var screenCoordinates = getOffset(pickTarget.pos);

  wGraphics.save();


  const fillColorString = darworms$1.dwsettings.alphaColorTable[pickTarget.wormColorIndex];

  wGraphics.strokeStyle = fillColorString;

  wGraphics.lineWidth = 4;
  wGraphics.setTransform(1.0, 0, 0, 1.0, 0, 0);
  wGraphics.beginPath();
  var xloc = ((xPts$1[pickTarget.dir] * wCanvas.width * .75) / 2) + (wCanvas.width / 2);
  var yloc = ((yPts$1[pickTarget.dir] * wCanvas.height * .75) / 2) + (wCanvas.height / 2);

  wGraphics.arc(xloc, yloc, 20, 0, Math.PI * 2, false);
  wGraphics.closePath();
  wGraphics.stroke();

  wGraphics.strokeStyle = fillColorString;
  wGraphics.lineWidth = 2;
  wGraphics.moveTo(xloc, yloc);
  wGraphics.beginPath();
  wGraphics.moveTo(xloc, yloc);
  var animFraction = 1.0 * (darworms$1.graphics.animFrame & 0x7F) / 128;
  wGraphics.lineTo(
    (xloc + ((screenCoordinates.x - xloc) * animFraction)),
    (yloc + ((screenCoordinates.y - yloc) * animFraction)));

  wGraphics.closePath();
  wGraphics.stroke();
  wGraphics.restore();
}

function selectDirection(point) {
  ((darworms$1.dwsettings.pickDirectionUI == 1)) ? selectLargeUIDirection(point):
    selectSmallUIDirection(point);
}

function selectSmallUIDirection(touchPoint) {
  // we should be able to bind the forEach to this instead using darworms.theGame
  darworms$1.pickCells.forEach(function(pickTarget) {
    var screenCoordinates = getOffset(pickTarget.pos);
    var absdiff = touchPoint.absDiff(screenCoordinates);
    var diff = new Point(touchPoint.x - screenCoordinates.x, touchPoint.y - screenCoordinates.y);
    if ((absdiff.x < (scale.x / 2)) && (absdiff.y < (scale.y / 2)) &&
      this.gameState === darworms$1.gameStates.waiting) {
      console.log(" target hit delta: " + diff.format());
      setDNAandResumeGame(pickTarget.dir);
    }
  }, darworms$1.theGame);

}

function setDNAandResumeGame(direction) {
  theGame.focusWorm.dna[theGame.focusValue & 0x3F] = direction;
  theGame.focusWorm.numChoices += 1;
  darworms$1.theGame.gameState = darworms$1.gameStates.running;
  clearCanvas();
  drawCells();
}

function selectLargeUIDirection(point) {
  // console.log( "selectDirection: " + point.format());
  var outvec = darworms$1.theGame.grid.stateAt(theGame.focusWorm.pos);
  var minDist = 100000;
  var dist;
  var select = -1;
  for (var i = 0; i < 6; i = i + 1) {
    if ((outvec & darworms$1.outMask[i]) === 0) {
      const target = new Point(
        (((darworms$1.theGame.xPts[i] * wCanvas.width * .75) / 2) + (wCanvas.width / 2)),
        (((darworms$1.theGame.yPts[i] * wCanvas.height * .75) / 2) + (wCanvas.height / 2)));

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
  if ((minDist < wCanvas.width / 8) && (select >= 0)) {
    setDNAandResumeGame(select);
  }
}
function animateDyingWorms() {
    for (var i = 0; i < 4; i = i + 1) {
      // We don't want to do the animates in the same order ever frame because
      // when tow worms die together the second's animations would always overwite
      // the first's/

      var whichWorm = ((i + darworms$1.graphics.uiFrames) & 0x3);
      if (theGame.worms[whichWorm].state == darworms$1.wormStates.dying) {
        animateDyingCell(theGame.worms[whichWorm]);
      }
    }
  }

function animateDyingCell(worm) {
  drawcell(worm.pos);
  drawShrikingOutline(worm);
}

function drawShrikingOutline(worm) {
  var animFraction = (darworms$1.graphics.dyningAnimationFrames - (darworms$1.graphics.uiFrames - worm.diedAtFrame)) /
    darworms$1.graphics.dyningAnimationFrames;
  gsetTranslate(worm.pos);

  wGraphics.strokeStyle = darworms$1.dwsettings.alphaColorTable[worm.colorIndex];
  wGraphics.lineWidth = .1;
  wGraphics.fillStyle = darworms$1.dwsettings.alphaColorTable[worm.colorIndex];
  wGraphics.beginPath();
  wGraphics.moveTo(darworms$1.graphics.vertex_x[0] * animFraction, darworms$1.graphics.vertex_y[0] * animFraction);
  for (var j = 1; j < 6; j = j + 1) {
    wGraphics.lineTo(darworms$1.graphics.vertex_x[j] * animFraction, darworms$1.graphics.vertex_y[j] * animFraction);
  }
  wGraphics.lineTo(darworms$1.graphics.vertex_x[0] * animFraction, darworms$1.graphics.vertex_y[0] * animFraction);
  //wGraphics.stroke();
  wGraphics.closePath();
  wGraphics.stroke();
  //wGraphics.fill();
  // wGraphics.stroke();
}

function showTimes() {
    var min = 100000000;
    var max = 0;
    var ave = 0;
    var nFrames = 0;
    var sumTime = 0;
    var fps = 0;
    console.log("frameTimes.length " + frameTimes.length);
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


  }
  // this should be moved to graphics.js
function resizeCanvas() {
    var xc = $('#wcanvas');
    var canvasElement = document.getElementById('wcanvas');
    var sc = $('#scorecanvas');
    var nc = $('#navcontainer');
    var fb = $('#footerbar');
    var w = $(window).width();
    var h = $(window).height();
    if (h > 400) {
      xc.css({
        width: w - 20 + 'px',
        height: h - 140 + 'px'
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
      alert(" Resize " + w + " x " + h + " debug " + $('#debug').slider().val() + "arg " + nw);
    }

    if (darworms$1.theGame) {
      setScale(this.grid.width, this.grid.height);
      darworms$1.theGame.needsRedraw = true;
      clearCanvas();
      drawCells();
    }
  }

// scorecanvas.js

var scoreCanvas;
var scorectx;

function scoreCanvasInit(game) {
  scoreCanvas = document.getElementById("scorecanvas");
  scorectx = scoreCanvas.getContext("2d");
  scorectx.font = "bold 18px sans-serif";
  scorectx.shadowColor = "rgb(190, 190, 190)";
  scorectx.shadowOffsetX = 3;
  scorectx.shadowOffsetY = 3;
}

function clearScore(segmentIndex, totalSegments) {
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

function updateScores(wormArray) {

  wormArray.forEach(function(aworm, i) {
    if (aworm !== undefined && aworm.shouldDrawScore()) {
      clearScore(i, 4);
      scorectx.fillStyle = darworms$1.dwsettings.colorTable[i + 1];
      // scorectx.shadowOffsetX = 3;
      // scorectx.shadowOffsetY = 3;
      scorectx.fillText(aworm.score, scoreStartx(i, 4, aworm.score.toString()), 15);
    }
  });
  // for (i = 0; i < 4; i++) {
  //   if (aworm !== undefined && shouldDrawScore.shouldDrawScore()) {
  //      clearScore(i, 4);
  //      scorectx.fillStyle = darworms.dwsettings.colorTable[i + 1];
  // scorectx.shadowOffsetX = 3;
  // scorectx.shadowOffsetY = 3;
  //      scorectx.fillText(aworm.score, scoreStartx(i, 4, aworm.score.toString()), 15);
  //    }
}

// gameio.js

let gameObj =  {};
let gameTxt = "";
let gameUrl = "";


function pick(o, ...fields) {
    return fields.reduce((a, x) => {
        if(o.hasOwnProperty(x)) a[x] = o[x];
        return a;
    }, {});
}

function addPick(a, o, ...fields) {
    return Object.assign(a,pick(o, ...fields))
}

function gameName( game ) {
  const then = new Date(game.createdAt);
  var name = then.toString();
  let nplayers = 0;
  game.players.forEach ( function (aworm, i) {
    if (aworm.typeName !== " None ") nplayers++;
  });
  name = name.substr(0, name.indexOf('GMT'));
  name += '[' + game.width + 'x' +  game.width + ': ' + nplayers ;
  name += (nplayers == 1) ? ' player]' : ' players]';
  return name;
}
function emailGame( gameText) {
  var mailtourl = "mailto:?subject=" +
    encodeURIComponent("Darworms Game ") +
    "&body=" +
    encodeURIComponent("Darworms is a unique, free web strategy territoty capture game. Select everything below and paste it into browser address bar \n") +
    // encodeURIComponent("Here is an example of a game I played: \n") +

    encodeURIComponent(darworms.host) +
    encodeURIComponent("?darwormsgame=") +
    encodeURIComponent(gameText);
  console.log("url: " + mailtourl);
  // document.location.href = mailtourl;
  window.open(mailtourl);

}
function encodeGame( game, settings, graphics, version) {
    console.log (" encodeGame 0 ");
    now = new Date();
    gameObj = { version: version};
    gameObj.createdAt = now.valueOf();
    gameObj = addPick( gameObj, game,"numMoves", "numTurns");
    gameObj = addPick( gameObj, game.grid, "width");
    gameObj = addPick( gameObj, settings, "backGroundTheme", "doAnimations",
     "doAudio", "gridGeometry", "fixedInitPos", "pickDirectionUI", "masterAudioVolume");
    gameObj = addPick( gameObj, graphics, "fps");

    gameObj.players = [];
    game.worms.forEach ( function (aworm, i) {
      var wrm = { index: i};
      // new dna may have been set in this game
      aworm.toText();
      wrm = addPick(wrm, aworm, "typeName", "startingPos", "name", "score", "instrument", "musickeyName", "MusicScale");
      gameObj.players.push(wrm);
    });

    gameTxt = JSON.stringify(gameObj);
    gameUrl = encodeURIComponent(gameTxt);
    let testOne = decodeURIComponent(gameUrl);
    let testTwo = JSON.parse(testOne);
    let testThree = JSON.stringify(testTwo);
    console.log("before: " + gameTxt);
    console.log("after:  " + testThree);
    return (gameTxt)

}

function loadGames () {
  const data = JSON.parse(localStorage.getItem('darwormgames'));
  darworms.savedgames = data || [];
  darworms.savedgames.forEach ( function (gameTxt, i) {
    const gameObj = JSON.parse(gameTxt);
    const then = new Date(gameObj.createdAt);
    /* const elementStr = '<li> <button data-role="button" data-inline="false"  data-theme="a" lass="ui-btn ui-shadow ui-corner-all"> ' +
    then.toTimeString() +
     '</button></li>';
    $('#savedgames')[0].appendChild(elementStr).trigger('create');
*/
    $('#savedgames').append('<li><a>' + gameName(gameObj) + '</a><a class="deleteMe"></a></li>').listview('refresh');
    const liStr = '<li><a class="ui-btn>"' + then.toTimeString() + '</a><a class="deleteMe"></a></li>';
    //    $('#savedgames').append(liStr).trigger('create');
    //    $('#savedgames').append('<li id="l1"><a>5.00</a><a id="1" class="deleteMe"></a></li>').trigger('create');
     console.log(" liStr: " + liStr);


  });

}

function freeGames () {
  const svgamelist = $('#savedgames')[0];
  while (svgamelist.firstChild) {
    svgamelist.removeChild(svgamelist.firstChild);
  }

}

function saveGame (gameTxt) {
   console.log (" saveGame ");
   darworms.savedgames.push(gameTxt);
   localStorage.setItem('darwormgames', JSON.stringify(darworms.savedgames));


}

//  Game.js

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

// the jump from full pan left (-1.0) to full pan right (+1.0)
// is too jaring. This limits pan to [-.8 , +.8]
// Could be a setting  (pan effect 0 - 1)
const maxpan = 0.8;

class Game {
  constructor(gridWidth, gridHeight) {

    wCanvas.width = darworms$1.wCanvasPixelDim.x;
    wCanvas.height = darworms$1.wCanvasPixelDim.y;


    this.gameState = darworms$1.gameStates.over;
    this.grid = new Grid(gridWidth, gridHeight);
    setGrid(this.grid, this);

    this.numTurns = 0;
    this.numMoves = 0;
    this.activeIndex = 0;

    setScale(gridWidth, gridHeight);
    console.log(" new Game scale set to " + scale.format());
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
      darworms$1.dwsettings.pickDirectionUI = 1;
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
    console.log(" Game Canvas size  " + new Point(wCanvas.width, wCanvas.height).format());
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
    setGrid(this.grid, this);
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
    w.state = darworms$1.wormStates.paused;
    this.worms.push(w);
  };
  getAvePos(w) {
    var nActiveAve = 0;
    this.avePos.x = 0;
    this.avePos.y = 0;

    for (var i = 0; i < this.worms.length; i = i + 1) {
      var active = this.worms[i];
      if (active.state === darworms$1.wormStates.moving) {
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
    if (this.gameState === darworms$1.gameStates.waiting) {
      return;
    }
    // console.log ("Game  StartingTurn " + this.numTurns );
    for (var i = nextToMove; i < this.worms.length; i = i + 1) {
      var active = this.worms[i];
      darworms$1.theGame.activeIndex = i;
      // console.log (" GamemakeMove   for worm" + i + " :  " + darwormd.wormStateNames[active.state] + " at "  + active.pos.format());
      if (active.state === darworms$1.wormStates.sleeping) {
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
        if ((active.state != (darworms$1.wormStates.dead) && (active.state != darworms$1.wormStates.dying))) {
          if (darworms$1.dwsettings.doAnimations) {
            if ((darworms$1.dwsettings.doAudio == 1) && darworms$1.audioSamples[darworms$1.audioSamples.length - 1]) {
              darworms$1.audioSamples[darworms$1.audioSamples.length - 1].playSample(1.0, 0.0);
            }
          }
          active.state = (darworms$1.dwsettings.doAnimations) ? darworms$1.wormStates.dying : darworms$1.wormStates.dead;
          active.diedAtFrame = darworms$1.graphics.uiFrames;
          console.log(" darworm " + active.colorIndex + " dying at frame: " + darworms$1.graphics.animFrame);
        }

        if (active.state == darworms$1.wormStates.dying) {
          if ((darworms$1.graphics.uiFrames - active.diedAtFrame) > darworms$1.graphics.dyningAnimationFrames) {
            active.state = darworms$1.wormStates.dead;
            console.log(" darworm " + active.colorIndex + " dead at frame: " + darworms$1.graphics.animFrame);
          }
        }

      } else {
        var direction = active.getMoveDir(currentState);
        if (direction === darworms$1.dwsettings.codons.unSet) {
          this.gameState = darworms$1.gameStates.waiting;
          // console.log(" setting gamestate to  " + this.gameState);
          focusPoint = active.pos;
          darworms$1.theGame.focusWorm = active;
          darworms$1.theGame.focusValue = currentState;
          if (darworms$1.theGame.focusWorm.showTutorial) {
            $("input[type='checkbox']").attr("checked", false);
            var btns = ['#p1button', '#p2button', '#p3buton', '#p4button'];
            // ToDo  set proper theme for popup   red green blue ye
            // Setter
            // $('#tutorialpopup' ).popup( "option", "overlayTheme", "d" );
            $('#tutorialpopup').popup("option", "theme", darworms$1.themes[darworms$1.theGame.activeIndex]);
            // this makes the popup background transparent, but it looks reall bad
            // $('#tutorialpopup').popup( "option","theme", 'none' );
            console.log(" init popup here");
            drawdna(document.getElementById('popupcanvas'), active, currentState);
            $('#tutorialpopup').popup("open", {
              positionTo: btns[darworms$1.theGame.activeIndex]
            });
          }
          nextToMove = i;
          this.numMoves = this.numMoves + 1;
          active.nMoves = active.nMoves + 1;
          drawDirtyCells();
          initPickUI(active);
          return (true);
        }
        {
          pushDirtyCell(active.pos);
        }
        // console.log (" Move Direction = " + direction);
        var next = this.grid.next(active.pos, direction);
        if (next.isEqualTo(darworms$1.dwsettings.noWhere)) { // fell of edge of world
          active.state = darworms$1.wormStates.dead;
          active.died = true;
        } else {
          var didScore = this.grid.move(active.pos, next, direction, active.colorIndex);
          active.score = active.score + didScore;
          this.numMoves = this.numMoves + 1;
          active.nMoves = active.nMoves + 1;
          // console.log("    Worm " + active.colorIndex + "  just made move " + active.nMoves + " game turn " + this.numTurns + " From " + this.grid.formatStateAt(active.pos) + " direction  " + direction);
          active.pos = next;

          {
            pushDirtyCell(next);
            if (darworms$1.dwsettings.doAudio == 1 && graphicsOn) {
              let panValue = maxpan * ((active.pos.x - (darworms$1.theGame.grid.width / 2)) / (darworms$1.theGame.grid.width / 2));
              if ((active.audioSamplesPtrs[direction] !== undefined) && (active.audioSamplesPtrs[direction] >= 0)) {
                darworms$1.audioSamples[active.audioSamplesPtrs[direction]].
                playSample(
                  darworms$1.audioPlaybackRates[active.MusicScale[(didScore == 1) ? 6 : direction]],
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
      if ((active.state !== darworms$1.wormStates.dead)) {
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

// end of Module prototypes

//  Called from Timer Loop

function makeMoves() {
  // console.log(" makeMoves theGameOver " + theGameOver +  "  gameState " + gameStateNames[theGame.gameState] );
  var startTime = new Date().getTime();
  startFrameTimes.push(startTime);
  if (darworms$1.theGame.needsRedraw) {
    drawCells();
    darworms$1.theGame.needsRedraw = false;
  }
  if (darworms$1.theGame.gameState != darworms$1.gameStates.over) {
    if (darworms$1.theGame.makeMove(darworms$1.dwsettings.doAnimations) === false) {
      stopGameTimer();
      console.log(" Game Over");
      clearInterval(darworms$1.graphics.timer);
      // document.getElementById("startpause").innerHTML = "Start Game";
      $("#startpause").text("Start Game");
      showTimes();
      updateScores(darworms$1.theGame.worms);
      darworms$1.theGame.gameState = darworms$1.gameStates.over;
      darworms$1.gameTxt = encodeGame( darworms$1.theGame, darworms$1.dwsettings, darworms$1.graphics, darworms$1.version);
      // decodeGame(gameTxt);
      // darworms.main.injectSettings(gameTxt);
    }
  }
  if (darworms$1.dwsettings.doAnimations) {
    drawDirtyCells();
    animateDyingWorms();
    darworms$1.theGame.getAvePos();
  }
  updateScores(darworms$1.theGame.worms);
  var elapsed = new Date().getTime() - startTime;
  frameTimes.push(elapsed);
}// Called from user actions


function gameInit() {
  // used to initialize variables in this module's closure
  console.log(" wCanvas,width: " + wCanvas.width);
  graphicsInit(this);
  scoreCanvasInit();
  nextToMove = 0;

}
/* end of Game */

/*
  <script src="scripts/loader.js"></script>
  <script src="scripts/AudioSample.js"></script>
  <script src="scripts/Point.js"></script>
  <script src="scripts/Grid.js"></script>
  <script src="scripts/Worm.js"Games></script>
  <script src="scripts/WPane.js"></script>
  <script src="scripts/Game.js"></script>
  <script src="scripts/main.js"></script>
*/
/*  DarWorms
 Copyright BitBLT Studios inc
 Author: David S. Maynard
 Deployment to Rackspace:
 scp -r -P 12960 ~/projects/SumoWorms/www/*.* dmaynard@bitbltstudios.com:/var/www/darworms/
 git push bitbltstudios:~/repo/ master

 darworms.com

   interesting DarWorms
 EEF?A??FB??F?FF?CC?F?FF???A?FF?FD??E?EE??CE?E??E?DD?D??DB??C?BAX
 DBCDAFEDCEFFEFEEFFADDBADBCFFFFAFBCCCADEDBBAEBBEEABDDABDDCBACABAX
 AEF?AE?DB??F?FF?C??C?FF??FA?FF?FD??C?BE??CA?A??E?B??A??DA??C?BAX
 AEF?AE?EB??F?FF?C??D?FD??BC?B??FD??D?DE??CC?B??E?DA?BD?DB??C?BAX
 AEF?AE?FB??E?FF?C??F?FD??FC?BF?FD??D?EA??CA?A??E?BD?A??DB??C?BAX
 AEF?AB?FB??F?FE?C??C?FA??BA?A??FD??D?EEE?EA?E??E?CA?D??DC??C?BAX
 //  nice   almost perfect worm (316)
 AEF?AE?FB??C?FE?C??D?DF??CA?AF?FD??E?BA??BA?A??E?DD?A??DC??C?BAX

 // perfect
 DFADAFEEFBCEBFEFDDCDBDADCBAFBBAFEDCEBEDEAEECAEAEDDADDBDDBBACABAX

 // perfect and interesting
 FDEDBDAEABFEBEEFCFDFBFFFFBCCBBAFDBEDAEDEACCCBBAEACCCBDADCCCCBBAX

 // nice score  297
 AEF?AF?FB??E?FA?C??F?DD??CA?F??FD??E?BAE?EE?E??E?BD?D??DA??C?BAX

 // 116
 AEF?AE?FB??C?BE?C??F?DD??FA?BF?FD??E??A??CC?B??E?D??D??DC??C?BAX

 //  short  score 10
 //  short score 42
 AEF?AE?FB??C?BE?C??F?DDF??C?B??FD??E??A??EA?B??E?DA?D??DC??C?BAX
// short score 2
 AEF?AB?FB????B?EC??F?B????C????FD?????E???C????E?D??B??DC??C?BAX
// nice 30
AEF?AF?FB????BA?C??F?DA???F?B??FD??E?D?D???????E?D??D??DC??C?BAX


LOGO Darworm  (score 3)
DFA?B??FC?????A?D???????C???B??FE??E???????????E?D?????D???CBBAX
DFA?B??FC?????A?D???????C???B??FE??ED??????????E?D?????DC??CBBAX
DFA?B?AFC???E?A?D???????CF??B??FE??ED?D??B?????E?D?????DC??CBBAX
DFA?B?AFC???E?A?D???????CF??B??FE??ED?DE?B?????E?D?????DC??CBBAX
DFA?B?AFC???E?A?D???????CF??B??FE??ED?D??B?????E?D?????DC??CBBAX
DFA?B?AFC???E?A?D???????C???B?AFE??EDB?E????B??E?D??B??DC??CBBAX
DFA?B?AFC???E?A?D???????C???B?AFE??EDB?E?C??B??E?D??B??DC??CBBAX

// Almost space filling
 FEF?A??FB??C?BA?C??D?DF??BA?B??FD?EE?BA??EE?A??E?DD?D?DDC??C?BAX

// good for fall off edge gameState
EFA?B??FB??C??A?C??FDD????C?B??FD??E?E???EC?B??E????B??DC??CBBAX
EFA?B??FB??C??A?C??FDD????C?B??FD??E?E???EC?B??E?D??B??DC??CBBAX

// Interesting two player gamestate
EFAFB?AFC?CC?BE?D??F?DA??BFFB??FE??E?EAE?EC?B??E?DA?BBADC??C?BAX
FBCFEFFFBEEFBEEEFDCDFDAFACFCFFFFDDCCEDEDCBCEBBEEABDDBDDDCCACBBAX
//  new worm filled completly via game play
EBCCDBADECCCBBEEFBCCDBFFFFFCFFFFEBCCDEADCECCEBEEDBACDBDDABCCBBAX
*/

darworms$1.main = (function() {

  var deviceInfo = function() {
    alert("This is a deviceInfo.");
    document.getElementById("width").innerHTML = screen.width;
    document.getElementById("height").innerHTML = screen.height;
    document.getElementById("colorDepth").innerHTML = screen.colorDepth;
  };

  var playerTypes = [3, 0, 1, 0];
  var buttonNames = ['#p1button', '#p2button', '#p3button', '#p4button',
    '#p1Lbutton', '#p2Lbutton', '#p3Lbutton', '#p4Lbutton'
  ];
  var typeNames = [" None ", "Random", " Same ", " New  "];
  var textFields = ['#p1textfield', '#p2textfield', '#p3textfield', '#p4textfield', '#edittextfield'];




  var gWorms = [new Worm(1, darworms$1.wormStates.paused), new Worm(2, darworms$1.wormStates.paused), new Worm(3, darworms$1.wormStates.paused), new Worm(4, darworms$1.wormStates.paused)];


  var setButtonNames = function() {
    // document.getElementById("p1button").innerHTML = typeNames[players[0]];
    // document.getElementById("p1button").html(typeNames[players[0]]).button("refresh");
    $("#p1button").text(typeNames[playerTypes[0]]);
    $("#p2button").text(typeNames[playerTypes[1]]);
    $("#p3button").text(typeNames[playerTypes[2]]);
    $("#p4button").text(typeNames[playerTypes[3]]);

    $("#p1Lbutton").text(typeNames[playerTypes[0]]);
    $("#p2Lbutton").text(typeNames[playerTypes[1]]);
    $("#p3Lbutton").text(typeNames[playerTypes[2]]);
    $("#p4Lbutton").text(typeNames[playerTypes[3]]);
    var bref = $("#p4button");
    var brefa = bref[0];

    gWorms.forEach(function(worm, i) {
      worm.wType = playerTypes[i];
      worm.typeName = typeNames[worm.wType];
      // worm.setNotes(i);
      $(buttonNames[i]).removeClass(
        playerTypes[i] === 0 ? "ui-opaque" : "ui-grayed-out");
      $(buttonNames[i]).addClass(
        playerTypes[i] === 0 ? "ui-grayed-out" : "ui-opaque");
    });
  };

  var setupEditPage = function() {
    // darworms.selectedIdx = $.mobile.activePage.attr("data-selecteddarworm");
    if (darworms$1.theGame && darworms$1.theGame.gameState !== darworms$1.gameStates.over) {
      $('.darwormTypeRadioButtons').hide();
      $('.playKeyNotes').hide();
    } else {
      $('.darwormTypeRadioButtons').show();
      $('.playKeyNotes').show();
      var darwormType = playerTypes[darworms$1.selectedIdx];
      var color = darworms$1.colorNames[darworms$1.selectedIdx];
      switch (darwormType) {
        case 0:
          $('#' + 'edit' + '-radio-choice-1').prop("checked", true).checkboxradio("refresh");
          break
        case 1:
          $('#' + 'edit' + '-radio-choice-2').prop("checked", true).checkboxradio("refresh");
          break;
        case 2:
          $('#' + 'edit' + '-radio-choice-3').prop("checked", true).checkboxradio("refresh");
          break;
        case 3:
          $('#' + 'edit' + '-radio-choice-4').prop("checked", true).checkboxradio("refresh");
          break;
      }
      var selectinput = 'input[name=' + 'edit' + '-radio-choice]';

      // $('input[name=green-radio-choice]').checkboxradio("refresh");
      // var selectedType = $(selectinput + ':checked').val();
      $(selectinput).checkboxradio("refresh");
      // gWorms.forEach(function(worm, i) {
      //  worm.toText();
      $("input[name='edit-textname']").textinput({
        theme: darworms$1.themes[darworms$1.selectedIdx]
      });
      $(textFields[4]).val(playerTypes[darworms$1.selectedIdx] == 0 ? "" : gWorms[darworms$1.selectedIdx].name);
      //  })
    }
  };

  var setSelectedDarwormType = function() {
    /*
     if (darworms.theGame && darworms.theGame.gameState !== darworms.gameStates.over) {
       return;
     }
     var color = darworms.colorNames[darworms.selectedIdx];
     var selectinput = 'input[name=' + 'edit' + '-radio-choice]';
     var selectedType = $(selectinput + ':checked').val();
     switch (selectedType) {
       case "none":
         playerTypes[darworms.selectedIdx] = 0;
         break;
       case "random":
         playerTypes[darworms.selectedIdx] = 1;
         break;
       case "same":
         playerTypes[darworms.selectedIdx] = 2;
         break;
       case "new":
         playerTypes[darworms.selectedIdx] = 3;
         break

       default:
         alert("unknown type");
     }
     */
    setButtonNames();
  };

  var showSettings = function() {
    if (darworms$1.theGame && darworms$1.theGame.gameState !== darworms$1.gameStates.over) {
      $('#geometryradios').hide();
      $('#gridsizeslider').hide();
      $('#abortgame').show();
    } else {
      $('#geometryradios').show();
      $('#gridsizeslider').show();
      $('#abortgame').hide();
    }
    if (darworms$1.dwsettings.forceInitialGridSize) {
      $('#gridsize').val(
        darworms$1.dwsettings.isLargeScreen ? darworms$1.dwsettings.largeGridSize :
        darworms$1.dwsettings.smallGridSize).slider("refresh");
      darworms$1.dwsettings.forceInitialGridSize = false;
    }
   $('#fps').val(darworms$1.graphics.fps).slider("refresh");

   $('#gridsize').val(darworms$1.dwsettings.gridSize).slider("refresh");
   $('#backg').val(darworms$1.dwsettings.backGroundTheme).slider("refresh");
   $('#doanim').val(darworms$1.dwsettings.doAnimations).slider("refresh");
   $('#audioon').val(darworms$1.dwsettings.doAudio).slider("refresh");
   $('#fixedinitpos').val(darworms$1.dwsettings.fixedInitPos).slider("refresh");

   $('#pickDirectionUI').val(darworms$1.dwsettings.pickDirectionUI).slider("refresh");


  };

  var applySettings = function() {

    darworms$1.dwsettings.gridGeometry = $('input[name=geometry-radio-choice]:checked').val();
    if (darworms$1.dwsettings.backGroundTheme !== $('#backg').slider().val()) {
      darworms$1.dwsettings.backGroundTheme = $('#backg').slider().val();
      if (darworms$1.theGame) {
        clearCanvas();
        drawCells();
      }
    }
    darworms$1.dwsettings.gridSize = parseInt($('#gridsize').val());
    darworms$1.dwsettings.doAnimations = $('#doanim').slider().val() == "true" ? true : false;
    darworms$1.dwsettings.doAudio = $('#audioon').slider().val()  == "1" ? 1 : 0;    darworms$1.dwsettings.fixedInitPos = $('#fixedinitpos').slider().val()  == "1" ? 1 : 0;
    darworms$1.dwsettings.pickDirectionUI = $('#pickDirectionUI').slider().val() == "1" ? 1 : 0;

    console.log(" darworms.dwsettings.doAnimations " + darworms$1.dwsettings.doAnimations);
    console.log(" darworms.dwsettings.doAudio " + darworms$1.dwsettings.doAudio);
    darworms$1.dwsettings.masterAudioVolume = $("#audiovol").val() / 100;
    darworms$1.graphics.fps = parseInt($("#fps").val());
    darworms$1.graphics.frameInterval = 1000 / darworms$1.graphics.fps;

    console.log(" darworms.dwsettings.masterAudioVolume " + darworms$1.dwsettings.masterAudioVolume);
  };

  var injectSettings = function(gameTxt) {
    var gameObj = JSON.parse(gameTxt);
    darworms$1.dwsettings.gridGeometry = gameObj.gridGeometry;
    if (darworms$1.dwsettings.backGroundTheme !== gameObj.backGroundTheme) {
      darworms$1.dwsettings.backGroundTheme = gameObj.backGroundTheme;
      if (darworms$1.theGame) {
        clearCanvas();
        drawCells();
      }
    }
    darworms$1.dwsettings.doAnimations = gameObj.doAnimations;
    darworms$1.dwsettings.doAudio = gameObj.doAudio;
    darworms$1.dwsettings.fixedInitPos = gameObj.fixedInitPos;

    darworms$1.dwsettings.pickDirectionUI = gameObj.pickDirectionUI;
    darworms$1.dwsettings.masterAudioVolume = gameObj.masterAudioVolume;
    darworms$1.graphics.fps = gameObj.fps;
    darworms$1.graphics.frameInterval = 1000 / darworms$1.graphics.fps;
    darworms$1.dwsettings.gridSize = gameObj.width;

    var regx = /^[ABCDEF\?]{63}X$/;
    gameObj.players.forEach(function(aworm) {
      var i = aworm.index;
      gWorms[i].name = aworm.name;
      //  decode  tyename therefore

      if (regx.test(gWorms[i].name)) {
        if (!gWorms[i].fromText(gWorms[i].name)) {
           alert("Invalid DNA for Daworm # " + (i+1) + " " );
           gWorms[i].wType = 0;
        }
      }

      gWorms[i].wType = aworm.typeName == " None " ? 0 : 2;
      playerTypes[i] = gWorms[i].wType;
      gWorms[i].score = aworm.score;
      gWorms[i].instrument = aworm.instrument;
      gWorms[i].musickeyName = aworm.musickeyName;
      gWorms[i].MusicScale = aworm.MusicScale;

    });
  };

  var setupGridGeometry = function() {
    console.log(" pagebeforeshow setupGridGeometry ");
    if (darworms$1.theGame && darworms$1.theGame.gameState !== darworms$1.gameStates.over) {
      $('#geometryradios').hide();
    } else {
      $('#geometryradios').show();
    }

    var gridGeometry = darworms$1.dwsettings.gridGeometry;

    switch (gridGeometry) {
      case 'torus':
        $('#geometry-radio-torus').prop("checked", true).checkboxradio("refresh");
        break;
      case 'falloff':
        $('#geometry-radio-falloff').prop("checked", true).checkboxradio("refresh");
        break;
      case 'reflect':
        $('#geometry-radio-reflect').prop("checked", true).checkboxradio("refresh");
        break;
      default:
        alert(" unknown grid geometry requested: " + gridGeometry);

    }
  };

  var pointerEventToXY = function(e) {
    var out = {
      x: 0,
      y: 0
    };
    if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      out.x = touch.pageX;
      out.y = touch.pageY;
    } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave') {
      out.x = e.pageX;
      out.y = e.pageY;
    } else if (e.type == 'tap') {
      out.x = (e.clientX || e.changedTouches[0].pageX) - (e.currentTarget.offsetLeft);
      out.y = (e.clientY || e.changedTouches[0].pageY) - (e.currentTarget.offsetTop);
    }
    return out;
  };

  var wormEventHandler = function(event) {
    var loc = pointerEventToXY(event);
    var touchX = loc.x;
    var touchY = loc.y;
    /*
    var touchX = (event.offsetX || event.clientX);
    var touchY = (event.offsetY || event.clientY);
    var touchX = touchX - event.currentTarget.;  //  padding between canvas container and wcanvas
    var touchY = touchY - 15;  //  padding between canvas container and wcanvas
    // alert( event.toString() + " tap event x:" + touchX + "  y:" + touchY)
    */

    console.log(" Tap Event at x: " + touchX + " y: " + touchY);
    // console.log(" wcanvas css   width " + $('#wcanvas').width() + " css   height " + $('#wcanvas').height());
    // console.log (" wcanvas coord width " + wCanvas.width + " coord height "  + wCanvas.height  );
    if (darworms$1.theGame.gameState === darworms$1.gameStates.waiting) {
      selectDirection(new Point(touchX, touchY));
    }
  };
  darworms$1.menuButton = function() {
    console.log(" menuButton");
    if (darworms$1.theGame.gameState && ((darworms$1.theGame.gameState == darworms$1.gameStates.running) ||
        (darworms$1.theGame.gameState == darworms$1.gameStates.paused))) {
      darworms$1.theGame.gameState = darworms$1.gameStates.paused;
      $.mobile.changePage("#settingspage");
      darworms$1.theGame.needsRedraw = true;
      drawCells();
      $("#startpause").text("Resume Game");
    } else {
      if (darworms$1.theGame.gameState == darworms$1.gameStates.waiting) {
        $.mobile.changePage("#settingspage");
      } else {
        $.mobile.changePage("#menupage");
      }
    }
  };
  darworms$1.setKeyVal = function(index) {
    var selectedKeyInput = $('#select-native-key');
    if (selectedKeyInput.length == 1) {
      gWorms[darworms$1.selectedIdx].setKey(selectedKeyInput.val());
    }
  };
  darworms$1.setInstrumentVal = function(index) {
    var selectedInstrumentInput = $('#select-native-edit');
    if (selectedInstrumentInput.length == 1) {
      var instrument = parseInt(selectedInstrumentInput.val());
      gWorms[darworms$1.selectedIdx].setNotes(instrument);

    }
  };
  darworms$1.sendemail = function() {
    console.log(" sendEMail " + darworms$1.gameTxt);
    emailGame(darworms$1.gameTxt);
  };

  darworms$1.saveGame = function() {
    console.log(" saveGame ");
    saveGame(darworms$1.gameTxt);
  };

  darworms$1.startgame = function(startNow) {
    console.log(" Startgame start now = " + startNow);
    if (darworms$1.theGame) {
      console.log("GameState is " +
        darworms$1.theGame.gameState + (darworms$1.gameStateNames[darworms$1.theGame.gameState]));
    }
    // wCanvas.width = $('#wcanvas').width();
    // wCanvas.height = $('#wcanvas').height(); // make it square
    darworms$1.dwsettings.isLargeScreen = wCanvas.width >= darworms$1.dwsettings.minLargeWidth;
    var curScreen = new Point(wCanvas.width, wCanvas.height);
    darworms$1.wCanvasPixelDim = curScreen;

    var curScreen = new Point(wCanvas.width, wCanvas.height);
    if (darworms$1.theGame === undefined || darworms$1.theGame === null || darworms$1.theGame.grid.height != darworms$1.dwsettings.gridSize ||
      !(darworms$1.wCanvasPixelDim.isEqualTo(curScreen))) {
      console.log(" theGame size has changed Screen is" + curScreen.format() + " grid = " + darworms$1.dwsettings.gridSize + " x " +
        darworms$1.dwsettings.gridSize);
      if ((darworms$1.dwsettings.gridSize & 1) !== 0) {
        // height must be an even number because of toroid shape
        darworms$1.dwsettings.gridSize = darworms$1.dwsettings.gridSize + 1;
      }

      if ($('#debug').slider().val() === 1) {
        alert(" wCanvas " + wCanvas.width + " x " + wCanvas.height +
          " css " + $('#wcanvas').width() + " x " + $('#wcanvas').height() +
          " window " + window.innerWidth + " x " + window.innerHeight);
      }
      darworms$1.theGame = new Game(darworms$1.dwsettings.gridSize, darworms$1.dwsettings.gridSize);
    }
    if (darworms$1.theGame.gameState === darworms$1.gameStates.over) {
      darworms$1.theGame.initGame();
      $("#startpause").text("Start Game");
      darworms$1.theGame.needsRedraw = true;
      drawCells();
      darworms$1.theGame.worms = gWorms;
      console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + darworms$1.dwsettings.gridSize);

      gWorms.forEach(function(worm, i) {
        worm.init(playerTypes[i]);
        if (playerTypes[i] !== 0) { //  not None

          $(buttonNames[i]).addClass("ui-opaque");
        } else {
          $(buttonNames[i]).addClass("ui-grayed-out");
        }
        // $(textFields[i]).val(worm.toText());
        var startingPoint = ((darworms$1.dwsettings.fixedInitPos == 1) ? darworms$1.theGame.origin :
           (playerTypes[i] == 2 ) ? worm.startingPos :  // Same
            new Point((Math.floor(Math.random() * darworms$1.theGame.grid.width)),
            (Math.floor(Math.random() * darworms$1.theGame.grid.height))));


        worm.place(darworms$1.initialWormStates[playerTypes[i]], darworms$1.theGame,
          startingPoint);
        if (playerTypes[i] !== 0) { //  not None
          darworms$1.theGame.grid.setSinkAt(startingPoint);
        }
      });
    }
    if (startNow === false) return;
    updateScores(gWorms);
    console.log(" NEW in startgame darworms.dwsettings.doAnimations " + darworms$1.dwsettings.doAnimations);
    if (darworms$1.theGame.gameState === darworms$1.gameStates.running) {
      // This is now a pause game button
      // clearInterval(darworms.graphics.timer);
      // document.getElementById("startpause").innerHTML = "Resume Game";
      $("#startpause").text("Resume Game");
      darworms$1.theGame.gameState = darworms$1.gameStates.paused;
      darworms$1.theGame.needsRedraw = true;
      drawCells();
      return;
    }
    if (darworms$1.theGame.gameState === darworms$1.gameStates.paused) {
      // This is now a start game button
      // document.getElementById("startpause").innerHTML = "Pause Game";
      $("#startpause").text("Pause");
      darworms$1.theGame.gameState = darworms$1.gameStates.running;
      // darworms.graphics.timer = setInterval(updateGameState, 1000 / $("#fps").val());
      // startGameLoop( $("#fps").val());
      return;
    }
    if (darworms$1.theGame.gameState === darworms$1.gameStates.over) {
      // This is now a start game button
      // alert("About to Start Game.");
      darworms$1.theGame.gameState = darworms$1.gameStates.running;
      // darworms.graphics.timer = setInterval(updateGameState, 1000 / $("#fps").val());
      var animFramesPerSec = darworms$1.dwsettings.doAnimations ? darworms$1.graphics.fps : 60;
      startGameLoop(animFramesPerSec);
      console.log(" setInterval: " + 1000 / $("#fps").val());
      // document.getElementById("startpause").innerHTML = "Pause Game";
      $("#startpause").text("Pause Game");
      initTheGame(true);
      darworms$1.theGame.log();
    }
    if (!darworms$1.dwsettings.doAnimations) {
      // run game loop inline and draw after game is over
      //  No.  This locks the browser.  We must put it inside the the
      // animation request and do a set of moves each animframe and draw the
      // playfield
      console.log('darworms.dwsettings.doAnimations == "false"');
      darworms$1.theGame.gameState = darworms$1.gameStates.running;
      clearCanvas();
      drawCells();

      console.log(" Game Running");
      $("#startpause").text("Running");
      /*  busy loop making moves.  Freezes the javascript engine!
        while (darworms.theGame.gameState != darworms.gameStates.over) {
         if (darworms.theGame.gameState === darworms.gameStates.waiting) {
           break;
         }
         if (darworms.theGame.makeMove(false) === false) {
           darworms.theGame.elapsedTime = darworms.theGame.elapsedTime + new Date().getTime();
           console.log(" Game Over");
           darworms.theGame.showTimes();
           darworms.theGame.gameState = darworms.gameStates.over;
           $("#startpause").text("Start Game");
           // wGraphics.restore();
         }
       }
       drawCells();
       darworms.gameModule.updateScores();

       $("#startpause").text("Start Game");
       */
    }

  };

  var startGameLoop = function(frameRate) {
    darworms$1.graphics.fps = frameRate;
    darworms$1.graphics.frameInterval = 1000 / frameRate;
    darworms$1.graphics.iufps = 30;
    darworms$1.graphics.uiInterval = 1000 / frameRate;
    darworms$1.graphics.animFrame = 0;
    darworms$1.graphics.uiFrames = 0;

    darworms$1.graphics.rawFrameCount = 0;
    darworms$1.graphics.drawFrameCount = 0;
    darworms$1.graphics.rawFrameCount = 0;
    darworms$1.graphics.uiFrameCount = 0;
    darworms$1.graphics.then = Date.now();

    darworms$1.graphics.uiThen = Date.now();
    darworms$1.graphics.startTime = darworms$1.graphics.then;
    darworms$1.graphics.uiInterval = 1000 / darworms$1.graphics.uifps;
    doGameLoop();
  };

  var doGameLoop = function() {
    // This is the game loop
    // Called from requestAnimationFrame
    // We either make one round of moves
    // or if we are waiting for user input
    // and we draw the direction selection screen
    //

    darworms$1.graphics.rawFrameCount++;
    if (darworms$1.theGame.gameState == darworms$1.gameStates.over) {
      //  end of game cleanup
      gWorms.forEach(function(worm, i) {
        if (worm.wType == 3) { //  new
          worm.wType = 2; // Same

        }
        worm.toText(); //  update string version of dna
      });
      for (let ig = 0; ig < 4; ig++) {
        playerTypes[ig] = gWorms[ig].wType;
      }
      setButtonNames();
      return;
    }
    requestAnimationFrame(doGameLoop);
    //   makes game moves or select a new direction for a worm
    //  update graphics
    darworms$1.graphics.animFrame = darworms$1.graphics.animFrame + 1;
    if (darworms$1.theGame.gameState === darworms$1.gameStates.running) {
      darworms$1.graphics.now = Date.now();
      if (darworms$1.dwsettings.doAnimations) {
        darworms$1.graphics.elapsed = darworms$1.graphics.now - darworms$1.graphics.then;
        if (darworms$1.graphics.elapsed > darworms$1.graphics.frameInterval) {
          darworms$1.graphics.uiFrames = darworms$1.graphics.uiFrames + 1;
          makeMoves();
          darworms$1.graphics.then = darworms$1.graphics.now -
            (darworms$1.graphics.elapsed % darworms$1.graphics.frameInterval);
        }

      } else {
        var startTime = Date.now();
        var nMoves = 0;
        var movesPerFrame = 80; // allows for approx 30 fps with drawing
        while ((nMoves < movesPerFrame) && (darworms$1.theGame.gameState != darworms$1.gameStates.over) &&
          (darworms$1.theGame.gameState !== darworms$1.gameStates.waiting)) {
          nMoves = nMoves + 1;          makeMoves();
        }
        console.log("Compute time: " + (Date.now() - startTime));

        var startTime = Date.now();
        updateScores(darworms$1.theGame.worms);
        drawDirtyCells();
        console.log("Draw time: " + (Date.now() - startTime));

        console.log(".");
      }

    }

    if (darworms$1.theGame.gameState === darworms$1.gameStates.waiting) {
      darworms$1.graphics.now = Date.now();
      darworms$1.graphics.uiElapsed = darworms$1.graphics.now - darworms$1.graphics.uiThen;
      if (darworms$1.graphics.uiElapsed > darworms$1.graphics.uiInterval) {
        drawPickCells();
        darworms$1.graphics.uiThen = darworms$1.graphics.now -
          (darworms$1.graphics.uiElapsed % darworms$1.graphics.uiInterval);
      }
    }

    // if ( darworms.graphics.rawFrameCount %  60 == 0) {
    //     console.log("Date.now() " + Date.now());
    // }
  };

  darworms$1.abortgame = function() {
    console.log("Abort Game called");
    $.mobile.changePage('#abortdialog', 'pop', true, true);
    // $("#lnkDialog").click();

  };
  darworms$1.emailDarwormButton = function(index) {
    console.log("emailDarwormButton called");
    gWorms[darworms$1.selectedIdx].emailDarworm();
  };

  darworms$1.playScale = function(index) {
    console.log("playScale called");
    gWorms[index].playScale();
  };
  darworms$1.yesabortgame = function() {
    console.log("Abort Game called");
    $.mobile.changePage('#playpage');
    darworms$1.theGame.gameState = darworms$1.gameStates.over;
    darworms$1.startgame(false);
    // $("#lnkDialog").click();

  };

  darworms$1.noabortgame = function() {
    console.log("Abort Game called");
    $.mobile.changePage('#settingspage');
    // $("#lnkDialog").click();

  };
  var initTheGame = function(startNow) {
    if (startNow) {
      darworms$1.theGame.gameState = darworms$1.gameStates.running;

    } else {
      darworms$1.theGame.gameState = darworms$1.gameStates.over;

    }
    // startgame(startNow);
    darworms$1.theGame.needsRedraw = true;

  };

  var initPlayPage = function() {
    var mainbody = $('#myPages');
    mainbody.css({
      overflow: 'hidden',
      height: '100%'
    });

    if (!darworms$1.playpageInitialized) {
      resizeCanvas();
      darworms$1.startgame(false);
      darworms$1.audioContext.resume();
      darworms$1.playpageInitialized = true;
    }
  };

  var leavePlayPage = function() {
    var mainbody = $('#myPages');
    mainbody.css({
      overflow: 'auto',
      height: 'auto'
    });

    if (!darworms$1.playpageInitialized) {
      resizeCanvas();
      darworms$1.startgame(false);
      darworms$1.audioContext.resume();
      darworms$1.playpageInitialized = true;
    }
    $("body").css("scroll", "on");
    $("body").css("overflow", "hidden");
  };
  var swapTheme = function(selector, newTheme) {
    //  needed because JQuery Mobile only adds additional themes
    // note we could add a hash table to keep tutorialCheckbox// previously added themes
    selector.removeClass('ui-page-theme-c');
    selector.removeClass('ui-page-theme-d');
    selector.removeClass('ui-page-theme-e');
    selector.removeClass('ui-page-theme-f');
    selector.page("option", "theme", newTheme);
  };
  var initEditPage = function(foo) {
    console.log(" initEditPage " + darworms$1.selectedIdx);
    swapTheme($('#edit-darworm-page'), darworms$1.themes[darworms$1.selectedIdx]);
    $('#edittextfield').val(gWorms[darworms$1.selectedIdx].wType == 0 ? "" : gWorms[darworms$1.selectedIdx].name);
    // $('#edit-darworm-page').page.refresh();

    $('[name=select-instrument]').val(gWorms[darworms$1.selectedIdx].instrument);
    $('[name=select-instrument]').selectmenu("refresh");

    $('[name=select-key]').val(gWorms[darworms$1.selectedIdx].musickeyName);
    $('[name=select-key]').selectmenu("refresh");
    // $('[name=select-instrument]').refresh();
    $('#edit-darworm-page').trigger("create");
  };

  var leaveEditPage = function(foo) {
    console.log(" leaveEditPage " + foo);
  };

  var loadSavedGames = function() {
    console.log(" loadSavedGames ");
    loadGames();
  };

  var freeSavedGames = function() {
    console.log(" freeSavedGames ");
    freeGames();
  };

  function unlockAudioContext(audioCtx) {
    if (audioCtx.state !== 'suspended') return;
    const b = document.body;
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    events.forEach(e => b.addEventListener(e, unlock, false));

    function unlock() {
      audioCtx.resume().then(clean);
    }

    function clean() {
      events.forEach(e => b.removeEventListener(e, unlock));
    }
  }

  var loadAudio = function() {
    // Create Smart Audio Container
    darworms$1.audioContext = new(window.AudioContext || window.webkitAudioContext)();

    if (darworms$1.audioContext == null) {
      darworms$1.dwsettings.doAudio = false;
      alert(" Could not load webAudio... muting game");
      $('#doAudio').hide();
    }
    unlockAudioContext(darworms$1.audioContext);
    console.log("audio is " + darworms$1.dwsettings.doAudio + "  Context state is " + darworms$1.audioContext.state);

    if (darworms$1.dwsettings.doAudio) {
      if (darworms$1.audioContext.createGain !== undefined) {
        darworms$1.masterGainNode = darworms$1.audioContext.createGain(0.5);
      }
      if (darworms$1.audioContext.createStereoPanner !== undefined) {
        darworms$1.audioPanner = darworms$1.audioContext.createStereoPanner();
      }

      //   loading AudioSample Files
      /*
      if (useKalimbaAudio) {
        new AudioSample("b3", "sounds/a_kalimba_b3.wav");
        new AudioSample("c4", "sounds/b_kalimba_c4.wav");
        new AudioSample("d4", "sounds/c_kalimba_d4.wav");
        new AudioSample("e4", "sounds/d_kalimba_e4.wav");
        new AudioSample("fsharp4", "sounds/e_kalimba_fsharp4.wav");
        new AudioSample("g4", "sounds/f_kalimba_g4.wav");
        new AudioSample("a4", "sounds/g_kalimba_a4.wav");
        new AudioSample("b4", "sounds/h_kalimba_b4.wav");
        new AudioSample("c5", "sounds/i_kalimba_c5.wav");
        new AudioSample("b3", "sounds/j_kalimba_d5.wav");
        new AudioSample("e5", "sounds/k_kalimba_e5.wav");
        new AudioSample("fsharp5", "sounds/l_kalimba_fsharp5.wav");
        new AudioSample("g5", "sounds/m_kalimba_g5.wav");
        new AudioSample("a5", "sounds/n_kalimba_a5.wav");
        new AudioSample("b5", "sounds/o_kalimba_b5.wav");
        new AudioSample("c6", "sounds/p_kalimba_c6.wav");

      }
      if (usePianoAudio) {
        new AudioSample("a1", "sounds/piano/a1.wav");
        new AudioSample("a1s", "sounds/piano/a1s.wav");
        new AudioSample("b1", "sounds/piano/b1.wav");
        new AudioSample("c1", "sounds/piano/c1.wav");
        new AudioSample("c1s", "sounds/piano/c1s.wav");
        new AudioSample("c2", "sounds/piano/c2.wav");
        new AudioSample("d1", "sounds/piano/d1.wav");
        new AudioSample("d1s", "sounds/piano/a1.wav");
        new AudioSample("e1", "sounds/piano/e1.wav");
        new AudioSample("f1", "sounds/piano/f1.wav");
        new AudioSample("f1s", "sounds/piano/f1s.wav");
        new AudioSample("g1", "sounds/piano/g1.wav");
        new AudioSample("g1s", "sounds/piano/g1s.wav");
      }
      if (useSitarAudio) {
        new AudioSample("sitar1", "sounds/sitar/sitar1.wav");
        new AudioSample("sitar2", "sounds/sitar/sitar2.wav");
        new AudioSample("sitar3", "sounds/sitar/sitar3.wav");
        new AudioSample("sitar4", "sounds/sitar/sitar4.wav");
        new AudioSample("sitar5", "sounds/sitar/sitar5.wav");
        new AudioSample("sitar6", "sounds/sitar/sitar6.wav");

      }
      */

      new AudioSample("piano", "sounds/piano-c2.wav");
      new AudioSample("guitar", "sounds/GuitarTrimmed.wav");
      new AudioSample("kalimba", "sounds/i_kalimba_c5.wav");
      new AudioSample("sitar", "sounds/Sitar-C5.wav");
      new AudioSample("flute", "sounds/FluteC3Trimmed.wav");
      new AudioSample("clarinet", "sounds/ClarinetTrimmed.wav");
      new AudioSample("death", "sounds/darworm-death.wav");

    }
    var twelfrootoftwo = 1.05946309436;
    var noteRate = 0.5; // lowest note  C3
    var noteFrequency = 261.626; // Middle C   (C4)
    do {
      darworms$1.audioPlaybackRates.push(noteRate);
      darworms$1.audioFrequencies.push(noteFrequency * noteRate);
      noteRate = noteRate * twelfrootoftwo;

    }
    while (darworms$1.audioPlaybackRates.length < 13);
    console.log("Final rate = " + darworms$1.audioPlaybackRates[12] + "  error: " +
      (1.0 - darworms$1.audioPlaybackRates[12]));

    darworms$1.audioPlaybackRates[12] = 1.0;



    // context state at this time is `undefined` in iOS8 Safari
    if (darworms$1.audioContext.state === 'suspended') {
      var resume = function() {
        darworms$1.audioContext.resume();

        setTimeout(function() {
          if (darworms$1.audioContext.state === 'running') {
            document.body.removeEventListener('touchend', resume, false);
          }
        }, 0);
      };

      document.body.addEventListener('touchend', resume, false);
    }

  };
  var typeFromName = function(name) {
    switch (name) {
      case "none":
        return 0;
        break;
      case "random":
        return 1;
        break;
      case "same":
        return 2;
        break;
      case "new":
        return 3;
        break

      default:
        alert("unknown type (not none, randowm, new or same)");
        return 0;
    }
  };
  var init = function() {
    // This may be needed when we actually build a phoneGap app
    // in this case delay initialization until we get the deviceready event
    document.addEventListener("deviceready", deviceInfo, true);

    $('#versionstring')[0].innerHTML = "Version " + darworms$1.version;
    // See if the url constains an encoded game
    const urlParams = new URLSearchParams(window.location.search);
    console.log(location.search);
    if (urlParams.has('darwormsgame')) {
      darworms$1.gameTxt = decodeURIComponent(urlParams.get('darwormsgame'));
      if (darworms$1.gameTxt) {
        injectSettings(darworms$1.gameTxt);
        //  go to Playpage here ?
        scoreCanvasInit();
        updateScores(gWorms);
        $.mobile.changePage('#playpage');

      }
    }


    graphicsInit();
    darworms$1.wCanvasPixelDim = new Point(wCanvas.clientWidth, wCanvas.clientHeight); // console.log ( " init wGraphics " + darworms.main.wGraphics);
    $('#wcanvas').bind('tap', wormEventHandler);
    // $('#wcanvas').on("tap", wormEventHandler);
    // $('#wcanvas').bind('vmousedown', wormEventHandler);

    // this should depend on scale factor.  On small screens
    // we should set pickDirectionUI to true
    $('#pickDirectionUI').slider().val(0);
    $('#pickDirectionUI').slider("refresh");

    darworms$1.wCanvasRef = $('#wcanvas');

    loadAudio();

    setButtonNames();

    // applySettings();



    gameInit(); // needed to init local data in the gameModule closure
    //  These values are needed by both mainModule and gameModule
    //  so for now we keep them as globals
    //  Perhaps the time routines should all be moved into the gameModule closure
    // and we can make some or all of these private to the gameModule closure
    // darworms.theGame = new Game ( darworms.dwsettings.forceInitialGridSize, darworms.dwsettings.forceInitialGridSize);
    // darworms.startgame(false);
    darworms$1.dwsettings.noWhere = new Point(-1, -1);


    //  The following code is designed to remove the toolbar on mobile Safari
    if (!window.location.hash && window.addEventListener) {
      window.addEventListener("load", function() {
        console.log("load event listener triggered");
        setTimeout(function() {
          window.scrollTo(0, 0);
        }, 100);
      });
      window.addEventListener("orientationchange", function() {
        setTimeout(function() {
          window.scrollTo(0, 0);
        }, 100);
      });
    }
    $(window).bind('throttledresize orientationchange', function(event) {
      window.scrollTo(1, 0);
      console.log("resize event triggered");
      if (darworms$1.theGame) {
        clearCanvas();
      }
      resizeCanvas();

      if (darworms$1.theGame) {
        reScale(darworms$1.theGame.grid.width, darworms$1.theGame.grid.height);
      }
    });

    gWorms.forEach(function(worm, i) {
      worm.setNotes(0);
    });
    resizeCanvas();
    $("#p1button").click(function() {
      darworms$1.selectedIdx = 0;
    });
    $("#p2button").click(function() {
      darworms$1.selectedIdx = 1;
    });
    $("#p3button").click(function() {
      darworms$1.selectedIdx = 2;
    });
    $("#p4button").click(function() {
      darworms$1.selectedIdx = 3;
    });
    $("#nextbutton").click(function() {
      console.log(" nextbutton clicked");
      $.mobile.changePage("#edit-darworm-page", {
        allowSamePageTransition: true
      });
      darworms$1.selectedIdx = ((darworms$1.selectedIdx + 1) % gWorms.length);
      initEditPage(darworms$1.selectedIdx);
      // $.mobile.changePage( "#edit-darworm-page", { allowSamePageTransition: true } );
    });
    $("input[name='edit-radio-choice']").on("change", function() {
      console.log(" edit-radio-choice on change function");
      var type = ($("input[name='edit-radio-choice']:checked").val());
      playerTypes[darworms$1.selectedIdx] = typeFromName(type);
      gWorms[darworms$1.selectedIdx].init(typeFromName(type));
      $('#edittextfield').val(typeFromName(type) == 0 ? "" : gWorms[darworms$1.selectedIdx].name);
    });

    $("input[name='edit-textname']").on("change", function() {
      console.log(" edit-textname");
      var dnastring = ($("input[name='edit-textname']").val());
      var regx = /^[ABCDEF\?]{63}X$/;
      if (regx.test(dnastring)) {
        if (gWorms[darworms$1.selectedIdx].fromText(dnastring)) {
          gWorms[darworms$1.selectedIdx].wType = 2; // Same
          playerTypes[darworms$1.selectedIdx] = 2;
          setupEditPage();


          $(darworms$1.buttonSelectors[darworms$1.selectedIdx]).text(typeNames[playerTypes[darworms$1.selectedIdx]]);
          $(darworms$1.buttonLSelectors[darworms$1.selectedIdx]).text(typeNames[playerTypes[darworms$1.selectedIdx]]);
          gWorms[darworms$1.selectedIdx].toText();
          $("input[name='edit-textname']").textinput({
            theme: darworms$1.themes[darworms$1.selectedIdx]
          });
        }      } else {
        $("input[name='edit-textname']").textinput({
          theme: "a"
        });
      }
    });
  };

  return {
    init: init,

    setSelectedDarwormType: setSelectedDarwormType,
    setupEditPage: setupEditPage,
    applySettings: applySettings,
    injectSettings: injectSettings,
    showSettings: showSettings,
    setupGridGeometry: setupGridGeometry,
    initPlayPage: initPlayPage,
    leavePlayPage: leavePlayPage,
    wormEventHandler: wormEventHandler,
    initEditPage: initEditPage,
    leaveEditPage: leaveEditPage,
    loadSavedGames: loadSavedGames,
    freeSavedGames: freeSavedGames


  };

})();
/* end of Game */
//# sourceMappingURL=bundle.js.map
