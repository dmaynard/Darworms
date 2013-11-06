/*  DarWorms
    Copyright BitBLT Studios inc
    Author: David S. Maynard
    Deployment:
    scp -r -P 12960 ~/projects/SumoWorms/www/*.* dmaynard@bitbltstudios.com:/var/www/darworms/
    git push bitbltstudios:~/repo/ master

    darworms.com
*/
darworms.main = (function() {

   var deviceInfo = function() {
        alert("This is a deviceInfo.");
        document.getElementById("width").innerHTML = screen.width;
        document.getElementById("height").innerHTML = screen.height;
        document.getElementById("colorDepth").innerHTML = screen.colorDepth;
    };
    /* Game Globals  Done   wrap these globals in a function  */


    var players = [1, 0, 0, 0];
    var typeNames = [" None ", "Random", " Same ", " New  " ];
    var canvas;
    var wGraphics;

     // var targetPts = [ new Point( 0.375,0), new Point( 0.25, 0.375), new Point( -0.25, 0.375),
     //    new Point(-0.375,0), new Point(-0.25,-0.375), new Point(  0.25,-0.375)];
    /* Worm  Constants */

    compassPts = [ "e", "se", "sw", "w", "nw", "ne", "unSet", "isTrapped"];
    wormStates = {"dead": 0, "moving" : 1, "paused": 2, "sleeping": 3};
    wormStateNames = ["dead", "moving", "paused", "sleeping"];
    initialWormStates = [3, 2, 2, 2];

    darworms.gameStates = {"over": 0, "running" : 1, "waiting": 2, "paused": 3};
    darworms.gameStateNames = ["over", "running", "waiting", "paused"];

    darworms.outMask = [1, 2, 4, 8, 16, 32];
    darworms.inMask =  [8, 16, 32, 1, 2, 4];

    darworms.inDir =   [3, 4, 5, 0, 1, 2];

    var setTypes = function () {
        document.getElementById("p1button").innerHTML = typeNames[players[0]];
        document.getElementById("p2button").innerHTML = typeNames[players[1]];
        document.getElementById("p3button").innerHTML = typeNames[players[2]];
        document.getElementById("p4button").innerHTML = typeNames[players[3]];
        for (var i = 0; i < gWorms.length; i = i + 1) {
            gWorms[i].wType = players[i];
        }
    };

    var player1 = function() {
        players[0] = players[0] + 1;
        if (players[0] >= typeNames.length) {
            players[0] = 0;
        }
        setTypes();
    };

    var player2 = function() {
        players[1] = players[1] + 1;
        if (players[1] >= typeNames.length) {
            players[1] = 0;
        }
        setTypes();
    };

    var player3 = function() {
        players[2] = players[2] + 1;
        if (players[2] >= typeNames.length) {
            players[2] = 0;
        }
        setTypes();
    };

    var player4 = function() {
        players[3] = players[3] + 1;
        if (players[3] >= typeNames.length) {
            players[3] = 0;
        }
        setTypes();
    };







    /* The following code is called from the game timer */

    /* This should be wrapped in an anonymous function closure */


    var gWorms = [new Worm(1, wormStates.paused), new Worm(2, wormStates.paused),  new Worm(3, wormStates.paused), new Worm(4, wormStates.paused)];
     // var localImage;

    var updateGameState = function () {
        // This is the game loop
        // We either make one round of moves
        // or if we are waiting for user input
        // and we draw the direction selection screen
        //
        // console.log(" updateGameState: gameState " +  gameStateNames[theGame.gameState]);
        darworms.graphics.animFrame = darworms.graphics.animFrame + 1;
        if (darworms.theGame.gameState === darworms.gameStates.running) {
            darworms.gameModule.makeMoves();

        }
        if (darworms.theGame.gameState === darworms.gameStates.waiting) {
            darworms.theGame.drawSelectCell();
        }

    };


    var wormEventHandler = function(event){
      touchX = event.pageX;
      touchY = event.pageY;
                           //  wGraphics.fillStyle="#0f0";
                            // wGraphics.fillRect(touchX - 75, touchY - 50, 50, 50);

                            // wGraphics.font = "20pt Arial";
                            // wGraphics.fillText("X: " + touchX + " Y: " + touchY, touchX, touchY);
      // console.log ( " Tap Event at x: " + touchX + " y: " + touchY);
      if (darworms.theGame.gameState === darworms.gameStates.waiting) {
        // TODO  - 50 is because canvas appears at y = 50 and touchY is screen relative
        // or is this because of the JetBrains Debug banner at the top ?
        if ( darworms.gameModule.doZoomOut(new Point((touchX/darworms.theGame.canvas.width)*2.0 - 1.0, ((touchY-50)/darworms.theGame.canvas.height)*2.0 - 1.0) )) {
            console.log(" do zoomout here");
        } else {
            darworms.gameModule.selectDirection( new Point((touchX/darworms.theGame.canvas.width)*2.0 - 1.0, ((touchY-50)/darworms.theGame.canvas.height)*2.0 - 1.0));
        }
      }
    };
    darworms.startgame = function(startNow) {
        var  heightSlider = Math.floor($("#gridsize").val());
        if (darworms.theGame === undefined || darworms.theGame === null || darworms.theGame.grid.height != heightSlider ) {
            console.log(" theGame size has changed ");
            if ((heightSlider & 1) !== 0) {
                // height must be an even number because of toroid shape
                heightSlider = heightSlider*1 + 1;
            }
            darworms.theGame = new darworms.gameModule.Game(heightSlider, heightSlider, canvas, darworms.main.wGraphics);
        }
        if (darworms.theGame.gameState === darworms.gameStates.over) {
            darworms.theGame.clear();

            darworms.theGame.needsRedraw = true;
            darworms.theGame.drawCells();
            darworms.theGame.worms = gWorms;
            console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + heightSlider);
            for (var i = 0; i < gWorms.length; i = i + 1) {
                if (players[i] !== 0) { //  not None
                    gWorms[i].init(players[i]);
                }
                gWorms[i].place( initialWormStates[players[i]] , darworms.theGame);
            }
        }

        if (startNow === false) return;
        if (darworms.theGame.gameState === darworms.gameStates.running) {
            // This is now a pause game button
            clearInterval(darworms.graphics.timer);
            document.getElementById("startpause").innerHTML = "Resume Game";
            darworms.theGame.gameState = darworms.gameStates.paused;
            return;
        }
        if (darworms.theGame.gameState === darworms.gameStates.paused) {
            // This is now a pause game button
            document.getElementById("startpause").innerHTML = "Pause Game";
            darworms.theGame.gameState = darworms.gameStates.running;
            darworms.graphics.timer = setInterval(updateGameState,1000/$("#fps").val());
            return;
        }
        if (darworms.theGame.gameState === darworms.gameStates.over) {
            // This is now a start game button
            // alert("About to Start Game.");

            document.getElementById("startpause").innerHTML = "<b>Pause Game</b>";
            darworms.theGame.gameState = darworms.gameStates.running;
            console.log(" setInterval: " +  1000/$("#fps").val());
            document.getElementById("startpause").innerHTML = "Pause Game";
            initTheGame(true);
            darworms.theGame.log();
            darworms.graphics.timer = setInterval(updateGameState,1000/$("#fps").val());
        }

    };
    var preventBehavior = function(e) {
        e.preventDefault();
    };
    var fail = function (msg) {
        alert(msg);
    }
    var initTheGame = function(startNow) {


        if (startNow) {
            darworms.theGame.gameState = darworms.gameStates.running;

        } else {
            darworms.theGame.gameState = darworms.gameStates.over;

        }
        // startgame(startNow);
        darworms.theGame.needsRedraw = true;

    }
    var init = function () {
        // This may be needed when we actually build a phoneGap app
        // in this case delay initialization untill we get the deviceready event
        document.addEventListener("deviceready", deviceInfo, true);
        setTypes();
        canvas = document.getElementById("wcanvas");
        darworms.main.wGraphics = canvas.getContext("2d");
        console.log ( " init wGraphics " + darworms.main.wGraphics);
        $('#wcanvas').bind('tap', wormEventHandler);
        var xxxslider =  $('.ui-slider-handle');

        $('.ui-slider-handle').height(20);
        $('.ui-slider-handle').width(10);
        // initTheGame(false);
        darworms.dwsettings.scoreCanvas = document.getElementById("scorecanvas");
        darworms.gameModule.init();  // needed to init local data the gameModule closure
        //  These values are needed by both mainModule and gameModule
        //  so for now we keep them as globals
        //  Perhaps the time routins sould all be moved into the gameModule closure
        // and we can make some or all of these private to the gameModule closure
        darworms.theGame = null;
        darworms.startgame(false);

    }

    return {
        init : init,
        player1 : player1,
        player2 : player2,
        player3 : player3,
        player4 : player4



    };

})();/* end of Game */