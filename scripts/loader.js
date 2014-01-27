var darworms = {
    compassPts: [ "e", "se", "sw", "w", "nw", "ne", "unSet", "isTrapped"],
    gameStates: {"over": 0, "running" : 1, "waiting": 2, "paused": 3},
    gameStateNames: ["over", "running", "waiting", "paused"],

    outMask: [1, 2, 4, 8, 16, 32],
    inMask:  [8, 16, 32, 1, 2, 4],
    colorNames: ['red', 'green', 'blue', 'yellow'],
    inDir:   [3, 4, 5, 0, 1, 2],
    screens:{},
    graphics:{
        timer:undefined,
        scorectx:undefined,
        animFrame:0,
        xPts:[ 0.5, 0.25, -0.25, -0.5, -0.25, 0.25],
        yPts:[ 0.0, 0.5, 0.5, 0.0, -0.5, -0.5]
    },
    selectedDarworm:0,
    dwsettings:{
        vgridsize:1.0,

        noWhere: undefined,

        scoreCanvas:undefined,
        gridGeometry: "torus",
        compassPts: [ "e", "ne", "nw", "w", "sw", "se", "unSet", "isTrapped"],

        codons:{ "e":0, "ne":1, "nw":2, "w":3, "sw":4, "se":5, "unSet":6, "isTrapped":7},
        colorTable:["000000", "#881C0A", "#1C880A", "#1C0A88",
            "#AAAA00", "#448833", "#443388", "#338844",
            "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
            "#884433", "#448833", "#443388", "#338844"],
        alphaColorTable:["rgba(  0,   0,   0, 0.2)",
            "rgba(  255,   0,   0, 0.8)", "rgba(    0, 255,   0, 0.8)", "rgba(    0,   0, 255, 0.8)", "rgba(  255, 200, 0, 0.8)",
            "#AAAA0080", "#44883380", "#44338880", "#33884480",
            "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
            "#88443380", "#44883380", "#44338880", "#33884480"]


    },
    images:{}
};

window.addEventListener("load", function () {

// determine jewel size
    //  var jewelProto = document.getElementById("jewel-proto"),
    //   rect = jewelProto.getBoundingClientRect();

    // darworms.settings.jewelSize = rect.width;


    Modernizr.addTest("standalone", function () {
        return true;
        return (window.navigator.standalone != false);
    });

// extend yepnope with preloading
    yepnope.addPrefix("preload", function (resource) {
        resource.noexec = true;
        return resource;
    });

    var numPreload = 0,
        numLoaded = 0;

    yepnope.addPrefix("loader", function (resource) {
        console.log("Loading: " + resource.url)

        var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
        resource.noexec = isImage;

        numPreload++;
        resource.autoCallback = function (e) {
            console.log("Finished loading: " + resource.url)
            numLoaded++;
            if (isImage) {
                var image = new Image();
                image.src = resource.url;
                darworms.images[resource.url] = image;
            }
        };
        return resource;
    });

    function getLoadProgress() {
        if (numPreload > 0) {
            return numLoaded / numPreload;
        } else {
            return 0;
        }
    }

// loading stage 1
    Modernizr.load([
        {
            load:[
                "scripts/Point.js",
                "scripts/Grid.js",
                "scripts/Worm.js",
                "scripts/WPane.js",
                "scripts/Game.js",
                "main.js"
            ]
        },
        {
            complete:function () {
                console.log(" stage 1 loading finished");
                // This is where the game is initialized
                //$(document).on('pageinit', function() {
                //    console.log("pageinit");
                //     alert("pageinit");

                //});
                // $(document).on('pagebeforeshow', function() {
                //    console.log("pagebeforeshow");
                //   alert("pagebeforeshow");
                // });
                $("[data-darworm='selector']").on('pagebeforeshow', darworms.main.setupRadioButtons);
                $("[data-darworm='selector']").on('pagehide', darworms.main.setSelectedDarwormType);
                $("#settingspage").on('pagebeforeshow', darworms.main.setupGridGeometry);
                $("#settingspage").on('pagehide', darworms.main.setGridGeometry);
                darworms.main.init();

            }
        }
    ]);

// loading stage 2


}, false);
