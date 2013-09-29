var darworms = {
    screens : {},
    graphics : {
        timer: undefined,
        scorectx: undefined,
        animFrame: 0,
        xPts: [ 0.5, 0.25, -0.25, -0.5, -0.25, 0.25],
        yPts: [ 0.0,  0.5,  0.5,  0.0,  -0.5, -0.5],
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
                init();
            }
        }
    ]);

// loading stage 2



}, false);
