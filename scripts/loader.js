var darworms = {
    screens : {},
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
        vgridsize :  1.0,
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
                "jquery.mobile/jquery-1.6.4.min.js",
                "jquery.mobile/jquery.mobile-1.0rc1.js",
                "main.js"
            ]
        },{
            complete : function() {
                init();
            }
        }
    ]);

// loading stage 2
    if (Modernizr.standalone) {
        console.log("Loading finds Modenizr.standalone true: ")
        Modernizr.load([
            {
                test : Modernizr.canvas,
                yep : ["loader!scripts/display.canvas.js","loader!scripts/wdisplay.canvas.js"],
                nope : "loader!scripts/display.dom.js"
            },{
                test : Modernizr.webworkers,
                yep : [
                    "loader!scripts/board.js"
                    //    "loader!scripts/board.worker-interface.js",
                    //    "preload!scripts/board.worker.js"
                ],
                nope : "loader!scripts/board.js"
            },{
                load : [
                    "loader!scripts/dwboard.js",
                    "loader!scripts/audio.js",
                    "loader!scripts/input.js",
                    "loader!scripts/screen.main-menu.js",
                    "loader!scripts/screen.game.js",
                    "loader!scripts/screen.wormgame.js",
                    "loader!images/jewels"
                        + darworms.settings.jewelSize + ".png"
                ]
            }
        ]);
    }



}, false);
