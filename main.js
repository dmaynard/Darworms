/*  DarWorms
 Copyright BitBLT Studios inc
 Author: David S. Maynard
 Deployment:
 scp -r -P 12960 ~/projects/SumoWorms/www/*.* dmaynard@bitbltstudios.com:/var/www/darworms/
 git push bitbltstudios:~/repo/ master

 darworms.com
 */
darworms.main = (function () {

    var deviceInfo = function () {
        alert("This is a deviceInfo.");
        document.getElementById("width").innerHTML = screen.width;
        document.getElementById("height").innerHTML = screen.height;
        document.getElementById("colorDepth").innerHTML = screen.colorDepth;
    };
    /* Game Globals  Done   wrap these globals in a function  */


    var players = [1, 0, 0, 0];
    var typeNames = [" None ", "Random", " Same ", " New  " ];

    var wGraphics;
    var wCanvas;

    // var targetPts = [ new Point( 0.375,0), new Point( 0.25, 0.375), new Point( -0.25, 0.375),
    //    new Point(-0.375,0), new Point(-0.25,-0.375), new Point(  0.25,-0.375)];
    /* Worm  Constants */

    compassPts = [ "e", "ne", "nw", "w", "sw", "se", "unSet", "isTrapped"];
    wormStates = {"dead":0, "moving":1, "paused":2, "sleeping":3};
    wormStateNames = ["dead", "moving", "paused", "sleeping"];
    initialWormStates = [3, 2, 2, 2];


    var setTypes = function () {
        // document.getElementById("p1button").innerHTML = typeNames[players[0]];
        // document.getElementById("p1button").html(typeNames[players[0]]).button("refresh");
        $("#p1button .ui-btn-text").text(typeNames[players[0]]);
        $("#p2button .ui-btn-text").text(typeNames[players[1]]);
        $("#p3button .ui-btn-text").text(typeNames[players[2]]);
        $("#p4button .ui-btn-text").text(typeNames[players[3]]);
        $("#landp1button .ui-btn-text").text(typeNames[players[0]]);
        $("#landp2button .ui-btn-text").text(typeNames[players[1]]);
        $("#landp3button .ui-btn-text").text(typeNames[players[2]]);
        $("#landp4button .ui-btn-text").text(typeNames[players[3]]);

        // document.getElementById("p2button").innerHTML = typeNames[players[1]];
        // document.getElementById("p3button").innerHTML = typeNames[players[2]];
        // document.getElementById("p4button").innerHTML = typeNames[players[3]];
        for (var i = 0; i < gWorms.length; i = i + 1) {
            gWorms[i].wType = players[i];
        }
    };

    var player1 = function () {
        $.mobile.changePage("#red-darworm-page");
    };

    var player2 = function () {
        $.mobile.changePage("#green-darworm-page");
    };

    var player3 = function () {
        $.mobile.changePage("#blue-darworm-page");
    };

    var player4 = function () {
        $.mobile.changePage("#yellow-darworm-page");
    };

    var setupRadioButtons = function () {
        darworms.selectedDarworm = $.mobile.activePage.attr("data-selecteddarworm");
        var darwormType = players[darworms.selectedDarworm];
        var color = darworms.colorNames[darworms.selectedDarworm];
        switch (darwormType) {
            case 0:
                $('#' + color + '-radio-choice-1').prop("checked", true).checkboxradio("refresh");
                break;
            case 1:
                $('#' + color + '-radio-choice-2').prop("checked", true).checkboxradio("refresh");
                break;
            case 2:
                $('#' + color + '-radio-choice-3').prop("checked", true).checkboxradio("refresh");
                break;
            case 3:
                $('#' + color + '-radio-choice-4').prop("checked", true).checkboxradio("refresh");
                break;
        }
        var selectinput = 'input[name=' + color + '-radio-choice]';
        $(selectinput).checkboxradio("refresh");
        // $('input[name=green-radio-choice]').checkboxradio("refresh");
        var selectedType = $(selectinput + ':checked').val();
    }

    var setSelectedDarwormType = function () {
        var color = darworms.colorNames[darworms.selectedDarworm];
        var selectinput = 'input[name=' + color + '-radio-choice]';
        var selectedType = $(selectinput + ':checked').val();
        switch (selectedType) {
            case "none":
                players[darworms.selectedDarworm] = 0;
                break;
            case "random":
                players[darworms.selectedDarworm] = 1;
                break;
            case "same":
                players[darworms.selectedDarworm] = 2;
                break;
            case "new":
                players[darworms.selectedDarworm] = 3;
                break

            default:
                alert("unknown type");
        }
        setTypes();
    }

    var setupGridGeometry = function () {
        var gridGeometry = darworms.dwsettings.gridGeometry;

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
    }

    var setGridGeometry = function () {
        var selectedGeometry = $('input[name=geometry-radio-choice]:checked').val();
        darworms.dwsettings.gridGeometry = selectedGeometry;
        darworms.dwsettings.backGroundTheme = $('#backg').slider().val();
        darworms.dwsettings.doAnimations = $('#doanim').slider().val();
        console.log(" darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);
    }


    /* The following code is called from the game timer */

    /* This sh.right {
     float: right;
     width: 300px;
     background-color: #b0e0e6;
     }ould be wrapped in an anonymous function closure */


    var gWorms = [new Worm(1, wormStates.paused), new Worm(2, wormStates.paused), new Worm(3, wormStates.paused), new Worm(4, wormStates.paused)];
    // var localImage;

    var updateGameState = function () {
        // This is the game loop
        // Called from timer (should be the requestAnimation timer)
        // We either make one round of moves
        // or if we are waiting for user input
        // and we draw the direction selection screen
        //
        // console.log(" updateGameState: gameState " +  gameStateNames[theGame.gameState]);
        // console.log("R");
        darworms.graphics.animFrame = darworms.graphics.animFrame + 1;
        if (darworms.theGame.gameState === darworms.gameStates.running) {
            // console.log("R");
            if (darworms.dwsettings.doAnimations) darworms.gameModule.makeMoves();

        }
        if (darworms.theGame.gameState === darworms.gameStates.waiting) {
            // console.log("w");
            darworms.theGame.drawSelectCell();
        }

    };


    var wormEventHandler = function (event) {
        var touchX = event.pageX;
        var touchY = event.pageY;
        var cWidth = $('#wcanvas').width();
        var cHeight = $('#wcanvas').height();
        console.log(" Tap Event at x: " + touchX + " y: " + touchY);
        console.log(" wcanvas css   width " + $('#wcanvas').width() + " css   height " + $('#wcanvas').height());
        // console.log (" wcanvas coord width " + darworms.main.wCanvas.width + " coord height "  + darworms.main.wCanvas.height  );
        if (darworms.theGame.gameState === darworms.gameStates.waiting) {
            // TODO  - 50 is because canvas appears at y = 50 and touchY is screen relative
            // or is this because of the JetBrains Debug banner at the top ?
            if (darworms.gameModule.doZoomOut(new Point((touchX / cWidth) * 2.0 - 1.0, ((touchY) / cHeight) * 2.0 - 1.0))) {
                console.log(" do zoomout here");
            } else {
                darworms.gameModule.selectDirection(new Point((touchX / cWidth) * 2.0 - 1.0, ((touchY) / cHeight) * 2.0 - 1.0));
                // console.log ( new Point (
                //     (touchX/cWidth)*2.0 - 1.0,
                //     (touchY/cHeight)*2.0 - 1.0).format()
                // );
            }
        }
    };

    darworms.startgame = function (startNow) {
        var heightSlider = Math.floor($("#gridsize").val());
        var curScreen = new Point($('#wcanvas').width(), $('#wcanvas').height());
        if (darworms.theGame === undefined || darworms.theGame === null || darworms.theGame.grid.height != heightSlider
            || !( darworms.wCanvasPixelDim.isEqualTo(curScreen))) {
            console.log(" theGame size has changed Screen is" + curScreen.format() + " grid = " + heightSlider + " x "
                + heightSlider);
            if ((heightSlider & 1) !== 0) {
                // height must be an even number because of toroid shape
                heightSlider = heightSlider + 1;
            }
            darworms.main.wCanvas.width = $('#wcanvas').width();
            darworms.main.wCanvas.height = $('#wcanvas').height(); // make it square
            darworms.wCanvasPixelDim = curScreen;
            if ($('#debug').slider().val() === 1) {
                alert(" wCanvas " + darworms.main.wCanvas.width + " x " + darworms.main.wCanvas.height
                    + " css " + $('#wcanvas').width() + " x " + $('#wcanvas').height()
                    + " window " + window.innerWidth + " x " + window.innerHeight);
            }
            darworms.theGame = new darworms.gameModule.Game(heightSlider, heightSlider);
        }
        if (darworms.theGame.gameState === darworms.gameStates.over) {
            darworms.theGame.initGame();

            darworms.theGame.needsRedraw = true;
            darworms.theGame.drawCells();
            darworms.theGame.worms = gWorms;
            console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + heightSlider);
            for (var i = 0; i < gWorms.length; i = i + 1) {
                if (players[i] !== 0) { //  not None
                    gWorms[i].init(players[i]);
                }
                gWorms[i].place(initialWormStates[players[i]], darworms.theGame);
            }
        }

        if (startNow === false) return;
        console.log(" NEW in startgame darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);

        if (darworms.theGame.gameState === darworms.gameStates.running) {
            // This is now a pause game button
            // clearInterval(darworms.graphics.timer);
            // document.getElementById("startpause").innerHTML = "Resume Game";
            $("#startpause .ui-btn-text").text("Resume Game");
            darworms.theGame.gameState = darworms.gameStates.paused;
            return;
        }
        if (darworms.theGame.gameState === darworms.gameStates.paused) {
            // This is now a start game button
            // document.getElementById("startpause").innerHTML = "Pause Game";
            $("#startpause .ui-btn-text").text("Pause");
            darworms.theGame.gameState = darworms.gameStates.running;
            // darworms.graphics.timer = setInterval(updateGameState, 1000 / $("#fps").val());
            // startGameLoop( $("#fps").val());
            return;
        }
        if (darworms.theGame.gameState === darworms.gameStates.over) {
            // This is now a start game button
            // alert("About to Start Game.");
            darworms.theGame.gameState = darworms.gameStates.running;
            // darworms.graphics.timer = setInterval(updateGameState, 1000 / $("#fps").val());
            startGameLoop($("#fps").val());
            console.log(" setInterval: " + 1000 / $("#fps").val());
            // document.getElementById("startpause").innerHTML = "Pause Game";
            $("#startpause .ui-btn-text").text("Pause Game");
            initTheGame(true);
            darworms.theGame.log();
        }
        if (darworms.dwsettings.doAnimations == "false") {
            // run game loop inline and draw after game is over
            console.log('darworms.dwsettings.doAnimations == "false"')
            darworms.theGame.gameState = darworms.gameStates.running;
            darworms.theGame.clearCanvas();
            darworms.theGame.drawCells();

            console.log(" Game Running");
            $("#startpause .ui-btn-text").text("Running");
            while (darworms.theGame.gameState != darworms.gameStates.over) {
                if (darworms.theGame.gameState === darworms.gameStates.waiting){
                    break;
                }
                if (darworms.theGame.makeMove(false) === false) {
                    darworms.theGame.elapsedTime = darworms.theGame.elapsedTime + new Date().getTime();
                    console.log(" Game Over");
                    darworms.theGame.showTimes();
                    darworms.theGame.gameState = darworms.gameStates.over;
                    // theGame.clearCanvas();
                    // alert("Game Over ");
                    // wGraphics.restore();
                }
            }
            darworms.theGame.drawCells();
            darworms.gameModule.updateScores();
            $("#startpause .ui-btn-text").text("Start Game");

        }

    };

    var startGameLoop = function(frameRate) {
        darworms.graphics.fps = frameRate;
        darworms.graphics.frameInterval =  1000 / frameRate;
        darworms.graphics.iufps = 30;
        darworms.graphics.uiInterval =  1000 / frameRate;

        darworms.graphics.rawFrameCount = 0;
        darworms.graphics.drawFrameCount = 0;
        darworms.graphics.rawFrameCount = 0;
        darworms.graphics.uiFrameCount = 0;
        darworms.graphics.then = Date.now();

        darworms.graphics.uiThen = Date.now();
        darworms.graphics.startTime = darworms.graphics.then;
        darworms.graphics.uiInterval =  1000 / darworms.graphics.uifps;
        doGameLoop();
    };

    var doGameLoop = function() {
        // This is the game loop
        // Called from requestAnimationFrame
        // We either make one round of moves
        // or if we are waiting for user input
        // and we draw the direction selection screen
        //

        darworms.graphics.rawFrameCount++;
        if(darworms.theGame.gameState == darworms.gameStates.over) {
            return;
        }
        requestAnimationFrame(doGameLoop);
        //   makes game moves or select a new direction for a worm
        //  update graphics
        darworms.graphics.animFrame = darworms.graphics.animFrame + 1;
        if (darworms.theGame.gameState === darworms.gameStates.running) {
            darworms.graphics.now = Date.now();
            if (darworms.dwsettings.doAnimations) {
                darworms.graphics.elapsed = darworms.graphics.now - darworms.graphics.then;
                if (darworms.graphics.elapsed > darworms.graphics.frameInterval) {
                    darworms.gameModule.makeMoves();
                    darworms.graphics.then = darworms.graphics.now -
                                             (darworms.graphics.elapsed % darworms.graphics.frameInterval)
                }

            }

        }
        if (darworms.theGame.gameState === darworms.gameStates.animToUI
            ||  darworms.theGame.gameState === darworms.gameStates.animFromUI) {
            darworms.theGame.animIn(darworms.theGame.gameState);
        }

        if (darworms.theGame.gameState === darworms.gameStates.waiting) {
            darworms.graphics.now = Date.now();
            darworms.graphics.uiElapsed = darworms.graphics.now - darworms.graphics.uiThen;
            if (darworms.graphics.uiElapsed > darworms.graphics.uiInterval) {
                darworms.theGame.drawSelectCell();
                darworms.graphics.uiThen = darworms.graphics.now -
                (darworms.graphics.uiElapsed % darworms.graphics.uiInterval)
            }
        }

        // if ( darworms.graphics.rawFrameCount %  60 == 0) {
        //     console.log("Date.now() " + Date.now());
        // }
    }

    var preventBehavior = function (e) {
        e.preventDefault();
    };
    var fail = function (msg) {
        alert(msg);
    }
    var initTheGame = function (startNow) {


        if (startNow) {
            darworms.theGame.gameState = darworms.gameStates.running;

        } else {
            darworms.theGame.gameState = darworms.gameStates.over;

        }
        // startgame(startNow);
        darworms.theGame.needsRedraw = true;

    }
    var resizeCanvas = function () {
        var xc = $('#wcanvas');
        var sc = $('#scorecanvas');
        var nc = $('#navcontainer');
        var w = $(window).width();
        var h = $(window).height();

        if (h > 400) {
            xc.css({
                width:w - 20 + 'px',
                height:h - 130 + 'px'
            });
            sc.css({
                width:w - 20 + 'px',
                height:30 + 'px'

            });
        } else {
            var nw = Math.floor(w * .70);
            xc.css({
                width:nw + 'px',
                height:h - 110 + 'px'
            });
            sc.css({
                width:nw + 'px'

            });

        }
        if ($('#debug').slider().val() === "1") {
            alert(" Resize " + w + " x " + h + " debug " + $('#debug').slider().val() + "arg " + nw);
        }
    }
    var initPlayPage = function () {
        if (!darworms.playpageInitialized) {
            darworms.startgame(false);
            darworms.playpageInitialized = true;
            resizeCanvas();
        }
    }
    var init = function () {
        // This may be needed when we actually build a phoneGap app
        // in this case delay initialization until we get the deviceready event
        document.addEventListener("deviceready", deviceInfo, true);
        setTypes();

        darworms.wCanvasPixelDim = new Point(1, 1);
        // window.onresize = doReSize;
        // doReSize();

        darworms.main.wCanvas = document.getElementById("wcanvas");
        darworms.main.wGraphics = darworms.main.wCanvas.getContext("2d");
        // console.log ( " init wGraphics " + darworms.main.wGraphics);
        $('#wcanvas').bind('tap', wormEventHandler);


        darworms.wCanvasRef = $('#wcanvas');

        darworms.dwsettings.scoreCanvas = document.getElementById("scorecanvas");
        darworms.gameModule.init();  // needed to init local data in the gameModule closure
        //  These values are needed by both mainModule and gameModule
        //  so for now we keep them as globals
        //  Perhaps the time routines should all be moved into the gameModule closure
        // and we can make some or all of these private to the gameModule closure
        // darworms.theGame = new darworms.gameModule.Game ( darworms.dwsettings.initialGridSize, darworms.dwsettings.initialGridSize);
        // darworms.startgame(false);
        darworms.dwsettings.noWhere = new Point(-1, -1);

        //  The following code is designed to remove the toolbar on mobile Safari
        if (!window.location.hash && window.addEventListener) {
            window.addEventListener("load", function () {
                setTimeout(function () {
                    window.scrollTo(0, 0);
                }, 100);
            });
            window.addEventListener("orientationchange", function () {
                setTimeout(function () {
                    window.scrollTo(0, 0);
                }, 100);
            });
        }
        $(window).bind('resize orientationchange', function (event) {
            window.scrollTo(1, 0);
            resizeCanvas();
        });
    }

    return {
        init:init,
        setSelectedDarwormType:setSelectedDarwormType,
        setupRadioButtons:setupRadioButtons,
        setGridGeometry:setGridGeometry,
        setupGridGeometry:setupGridGeometry,
        initPlayPage:initPlayPage,
        wormEventHandler:wormEventHandler,
        player1:player1,
        player2:player2,
        player3:player3,
        player4:player4



    };

})();
/* end of Game */