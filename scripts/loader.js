var darworms = {
  version: "0.9.0",
  compassPts: ["e", "se", "sw", "w", "nw", "ne", "unSet", "isTrapped"],
  gameStates: {
    "over": 0,
    "running": 1,
    "waiting": 2,
    "paused": 3,
    "animToUI": 4,
    "animFromUI": 5
  },
  gameStateNames: ["over", "running", "waiting", "paused", "to_ui", "from_ui"],

  outMask: [1, 2, 4, 8, 16, 32],
  inMask: [8, 16, 32, 1, 2, 4],
  colorNames: ['red', 'green', 'blue', 'yellow'],
  inDir: [3, 4, 5, 0, 1, 2],
  wCanvasPixelDim: [0, 0],
  playPageIitialized: false,
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
    fps: 30,
    frameInterval: 33.33333,
    uifps: 30,
    uiInterval: 33.33333,
    startTime: 0,
    now: 0,
    then: 0,
    uiThen: 0,
    elapsed: 0,
    uiElapsed: 0,
    enableTransitionStates: false,
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

  dwsettings: {
    vgridsize: 1.0,
    initialGridSize: 10,
    doAudio: true,
    fixedInitPos: true,
    panToSelectionUI: 0,
    pickDirectionUI: 0,
    noWhere: undefined,

    scoreCanvas: undefined,
    gridGeometry: "torus",
    compassPts: ["e", "ne", "nw", "w", "sw", "se", "unSet", "isTrapped"],

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
      "rgba(  238,   0,   0, 0.4)", "rgba(    0, 238,   0, 0.4)", "rgba(    0,   0, 238, 0.4)", "rgba(  200, 200, 0, 0.4)",
      "#FFD70080", "#44883380", "#44338880", "#33884480",
      "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
      "#88443380", "#44883380", "#44338880", "#33884480"
    ],
    backGroundTheme: 0,
    doAnimations: true,
    gridBackground: ["#F5F5F5", "#404040"],
    cellBackground: ["#F5F5F5", "#404040"]

  },
  images: {},
  audioContext: undefined,
  masterGainNode: undefined,
  masterAudioVolume: 0.3,
  audioPanner: undefined,
  audioSamples: [],
  // an array of 12 playback rates ranging from 0.5 to 1.0
  // this gives 12 notes from an octave in an equal tempered scale.
  audioPlaybackRates: [],
  audioFrequencies: []

};

window.addEventListener("load", function() {


    console.log(" stage 1 loading finished");

    window.onerror = function(msg, url, line) {
      alert(msg + " " + url + " " + line);
    }
    $("[data-darworm='selector']").on('pageshow', darworms.main.setupRadioButtons);
    $("[data-darworm='selector']").on('pagehide', darworms.main.setSelectedDarwormType);
    $("#settingspage").on('pageshow', darworms.main.showSettings);
    $("#settingspage").on('pagebeforeshow', darworms.main.setupGridGeometry);
    $("#settingspage").on('pagehide', darworms.main.applySettings);
    $("#playpage").on('pageshow', darworms.main.initPlayPage);
    darworms.wCanvasPixelDim = new Point();
    console.log("Initial Screen Size " + darworms.wCanvasPixelDim.format());
    darworms.main.init();

  }

);
