var darworms = {
    screens : {},
    graphics : {
        timer: undefined,
        scorectx: undefined,
        animFrame: 0,
        xPts: [ 0.5, 0.25, -0.25, -0.5, -0.25, 0.25],
        yPts: [ 0.0,  0.5,  0.5,  0.0,  -0.5, -0.5]
    },
    settings : {
        rows : 8,
        cols : 8,
        baseScore : 100,
        numJewelTypes : 7,
        baseLevelTimer : 60000,
        baseLevelScore : 1500,
        baseLevelExp : 1.05,
        controls : {
            KEY_UP : "moveUp",
            KEY_LEFT : "moveLeft",
            KEY_DOWN : "moveDown",
            KEY_RIGHT : "moveRight",
            KEY_ENTER : "selectJewel",
            KEY_SPACE : "selectJewel",
            CLICK : "selectJewel",
            TOUCH : "selectJewel"
        }
    },
    dwsettings : {
        rows : 8,
        cols : 8,
        gWidth: 16,
        gHeight: 16,
        vgridsize :  1.0,
        selectedDarworm: 0,
        scoreCanvas : undefined,
        controls : {
            KEY_UP : "moveUp",
            KEY_LEFT : "moveLeft",
            KEY_DOWN : "moveDown",
            KEY_RIGHT : "moveRight",
            KEY_ENTER : "selectJewel",
            KEY_SPACE : "selectJewel",
            CLICK : "selectJewel",
            TOUCH : "selectJewel"
        },
     codons : { "e": 0, "se": 1, "sw": 2, "w": 3, "nw": 4, "ne": 5, "unSet" : 6 , "isTrapped": 7},
     colorTable :["000000", "#881C0A", "#1C880A", "#1C0A88",
        "#AAAA00", "#448833", "#443388", "#338844",
        "#FF1C0A", "#1CFF0A", "#1C0AFF", "#0AFF1C",
        "#884433", "#448833", "#443388", "#338844"],
    alphaColorTable : ["rgba(  0,   0,   0, 0.2)",
    "rgba(  255,   0,   0, 0.8)", "rgba(    0, 255,   0, 0.8)", "rgba(    0,   0, 255, 0.8)", "rgba(  255, 200, 0, 0.8)",
    "#AAAA0080", "#44883380", "#44338880", "#33884480",
    "#FF1C0A80", "#1CFF0A80", "#1C0AFF80", "#0AFF1C80",
    "#88443380", "#44883380", "#44338880", "#33884480"]


},
    images : {}
};

window.addEventListener("load", function() {

// determine jewel size
   //  var jewelProto = document.getElementById("jewel-proto"),
     //   rect = jewelProto.getBoundingClientRect();

    // darworms.settings.jewelSize = rect.width;


    Modernizr.addTest("standalone", function() {
        return true;
        return (window.navigator.standalone != false);
    });

// extend yepnope with preloading
    yepnope.addPrefix("preload", function(resource) {
        resource.noexec = true;
        return resource;
    });

    var numPreload = 0,
        numLoaded = 0;

    yepnope.addPrefix("loader", function(resource) {
        console.log("Loading: " + resource.url)

        var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
        resource.noexec = isImage;

        numPreload++;
        resource.autoCallback = function(e) {
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
            load : [
                "scripts/Point.js",
                "scripts/Grid.js",
                "scripts/Worm.js",
                "scripts/WPane.js",
                "scripts/Game.js",
                "main.js"
            ]
        },{
            complete : function() {
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
                $('#selectdarwormpage').on('pagebeforeshow', darworms.main.setupRadioButtons);
                $('#selectdarwormpage').on('pagehide', darworms.main.setSelectedDarwormType);
                darworms.main.init();

            }
        }
    ]);

// loading stage 2



}, false);
