import { Point } from "./Point.js";
import {
  log,
  logging
} from "./utils.js"
import 'autotrack/lib/plugins/url-change-tracker';


window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', 'UA-141491749-1', 'auto');

// Replace the following lines with the plugins you want to use.
ga('require', 'urlChangeTracker');
// ...

ga('send', 'pageview');

export var darworms = {
  version: "1.0.1",
  // rollup.config  plugin replaces this by current date/time milliseconds
  builddate: DATE,
  // host: "localhost:5000",
  host: "https://darworms.com",
  compassPts: ["e", "se", "sw", "w", "nw", "ne", "unSet", "isTrapped", "ai"],
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
    dyningAnimationFrames: 8,
    spriteWidth: 14

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
    hugeGridSize: 18, // The original Atari 800 Character mode
    largeGridSize: 10,
    smallGridSize: 10, // so cells can be selected with touch
    tinyGridSize: 8,
    initInstrument: [1,0,0,1],
    minLargeScreenWidth: 800, //
    maxSmallSreenWidth: 500,
    isLargeScreen: true,
    screenSaver: 0,
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
      "isTrapped": 7,
      "smart": 8   //  ai at run time will decide direction
    },
    colorTable: ["#000000", "#D00000", "#00E000", "#0080FF",
      "#E0D000", "#448833", "#443388", "#338844",
      "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
      "#884433", "#448833", "#443388", "#338844"
    ],
    alphaColorTable: ["rgba(  0,   0,   0, 0.2)",
      "rgba(  176,   0,   0, 0.6)", "rgba(    0, 128,   0, 0.6)",
       "rgba(    0,   125, 255, 0.6)", "rgba(  250, 224, 0, 0.6)",
      "#FFD70080", "#5fa40480", "#44338880", "#33884480",
      "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
      "#88443380", "#44883380", "#44338880", "#33884480"
    ],
    spriteColorTable: ["#000000", "#CC0000", "#00CC00", "#0080FF",
      "#F0E000", "#448833", "#443388", "#338844",
      "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
      "#884433", "#448833", "#443388", "#338844"
    ],
    backGroundTheme: 1,
    doAnimations: true,
    gridBackground: ["#F5F5F5", "#404040"],
    cellBackground: ["#F5F5F5", "#404040"],
    scoreBackground: ["#F5F5F5", "#404040"],
    popupBackground: ["#F5F5F5", "#808080"],

    masterAudioVolume: 0.3,
    // Note  env is set by the rollup-plugin-replace at build time
    dologging: ENV,
    gridSize: 18,
    screenSaverDelay: 5000,
    maxTutotialPopups: 3
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
  audiosamplefiles: [
    [ 'kalimba' , "sounds/Roland-SC-88-Kalimba-C5.wav" ],
    [ 'piano' ,   "sounds/piano-c2.wav" ],
    [ 'guitar' , "sounds/Alesis-Fusion-Nylon-String-Guitar-C4.wav"],
    [ 'bass'   ,  "sounds/Alesis-Fusion-Acoustic-Bass-C2.wav"],
    [ 'violin' , "sounds/Casio-VZ-10M-Pizzicato-Bell-C4.wav"],
    [ 'flute' ,   "sounds/1980s-Casio-Flute-C5.wav" ],
    [ 'flute2' ,   "sounds/E-Mu-Proteus-2-Flute-C5.wav" ],
    [ 'koto'   , "sounds/Ensoniq-ESQ-1-Koto-C5.wav"],
    [ 'sitar' ,   "sounds/Sitar-C5.wav" ],
    [ 'alto piano', 'sounds/Ensoniq-SD-1-Electric-Piano-C6.wav'],
    [ 'bongo', 'sounds/Hi-Bongo.wav'],
    [ 'muted ' ,   "sounds/darworm-death.wav"]
  ],
  gameTxt: null
  // gameTxt: '{"version":"0.9.1","createdAt":"Fri May 10 2019 21:33:43 GMT-0700 (Pacific Daylight Time)","numMoves":263,"numTurns":83,"width":10,"backGroundTheme":"1","doAnimations":true,"doAudio":"1","gridGeometry":"torus","fixedInitPos":"1","pickDirectionUI":"0","masterAudioVolume":0.3,"fps":"30","players":[{"index":0,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"FBFEBEEDCBFFEFFFDDDCFDADBFFFABFFBBDCBBAECEAEAEAEDCADBDADACACBBAX","score":14,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]},{"index":1,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"DCEEADEEEBCFEFFEFBCDBFFFFBFFAFFFBDADAEADBEAEABAECDDDADDDBBACABAX","score":13,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]},{"index":2,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"BCFDEDEECBACFBAFCCDCDFADCCCFABAFDEDEEDADBECCEEEEABDDBBADCBCCABAX","score":22,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]},{"index":3,"typeName":"Random","startingPos":{"x":5,"y":5},"name":"AEDCFDFDECAEEBEFCFFDFFDDFBFFBFAFDBEEAEADEEACAEAEADADBBADBCACABAX","score":17,"instrument":0,"musickeyName":"CMajor","MusicScale":[0,2,4,5,7,9,11]}]}'
};

window.addEventListener("load", function() {
    // if(logging()) console.log(" stage 1 loading finished");
    window.onerror = function(msg, url, line) {
      alert(msg + " " + url + " " + line);
    }
    $("[data-darworm='selector']").on('pageshow', darworms.main.setupEditPage);
    $("[data-darworm='selector']").on('pagehide', darworms.main.setSelectedDarwormType);
    $("#settingspage").on('pageshow', darworms.main.showSettings);
    $("#settingspage").on('pagebeforeshow', darworms.main.setupGridGeometry);
    $("#settingspage").on('pagehide', darworms.main.applySettings);
    $("#playpage").on('pageshow', darworms.main.initPlayPage);
    $("#playpage").on('pagehide', darworms.main.leavePlayPage);
    $("#edit-darworm-page").on( "pagebeforeshow", darworms.main.initEditPage);
    $("#edit-darworm-page").on('pageshow', darworms.main.revealEditPage);
    $("#edit-darworm-page").on('pagehide', darworms.main.leavEditPage);
    $("#loadsavepage").on('pageshow', darworms.main.loadSavedGames);
    $("#loadsavepage").on('pagehide', darworms.main.freeSavedGames);
    $("#aboutpage").on('pageshow', darworms.main.sendAnalytics);
    $("#debugpage").on('pageshow', darworms.main.sendAnalytics);
    $("#emailpage").on('pageshow', darworms.main.sendAnalytics);
    $( "#tutorialpopup" ).popup({
        afterclose: function( event, ui ) {
          if(logging()) console.log(" popup's afterclose event fired" );
          darworms.theGame.focusWorm.tutorialCount++;
          if (darworms.theGame.focusWorm.tutorialCount > darworms.dwsettings.maxTutotialPopups) {
              darworms.theGame.focusWorm.showTutorial = false;
          }
        }
    });
    if(logging()) console.log("About to call darworms.main.init()");
    window.darworms = darworms;  // So index.html onclick can find handlers
    darworms.main.init();

  }

);
