/*  DarWorms
    Copyright BitBLT Studios inc
    Author: David S. Maynard
    Deployment:
    scp -r -P 12960 ~/projects/SumoWorms/www/*.* dmaynard@bitbltstudios.com:/var/www/darworms/
    git push bitbltstudios:~/repo/ master

    darworms.com
*/
var deviceInfo = function() {
    alert("This is a deviceInfo.");
    document.getElementById("width").innerHTML = screen.width;
    document.getElementById("height").innerHTML = screen.height;
    document.getElementById("colorDepth").innerHTML = screen.colorDepth;
};
/* Game Globals  TODO   wrap these globals in a function  */
var scoreCanvas;
var scorectx;
var theGameOver = true;
var focusPoint;
var focusWorm;
var focusValue;
var nextToMove = 0;
var animFrame = 0;
var players = [1, 0, 0, 0];
var typeNames = [" None ", "Random", " Same ", " New  " ];
var theGame;
var canvas;
var wGraphics;

var timer;
var xPts = [ 0.5, 0.25, -0.25, -0.5, -0.25, 0.25];
var yPts = [ 0.0,  0.5,  0.5,  0.0,  -0.5, -0.5];
 // var targetPts = [ new Point( 0.375,0), new Point( 0.25, 0.375), new Point( -0.25, 0.375),
 //    new Point(-0.375,0), new Point(-0.25,-0.375), new Point(  0.25,-0.375)];
var evenRowVec = [ new Point( 1, 0), new Point(  0,  1), new Point(-1,  1),
    new Point(-1, 0), new Point( -1, -1),  new Point(0,-1) ];

var oddRowVec = [ new Point( 1, 0), new Point( 1,  1), new Point( 0,  1),
    new Point( -1,0), new Point( 0, -1), new Point( 1, -1) ];

/* Worm  Constants */
codons = { "e": 0, "se": 1, "sw": 2, "w": 3, "nw": 4, "ne": 5, "unSet" : 6 , "isTrapped": 7};
compassPts = [ "e", "se", "sw", "w", "nw", "ne", "unSet", "isTrapped"];
wormStates = {"dead": 0, "moving" : 1, "paused": 2, "sleeping": 3};
wormStateNames = ["dead", "moving", "paused", "sleeping"];
initialWormStates = [3, 2, 2, 2];

gameStates = {"over": 0, "running" : 1, "waiting": 2, "paused": 3};
gameStateNames = ["over", "running", "waiting", "paused"];

var outMask = [1, 2, 4, 8, 16, 32];
var inMask =  [8, 16, 32, 1, 2, 4];

var inDir =   [3, 4, 5, 0, 1, 2];

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

var clearScore = function(segmentIndex, totalSegments)  {
    var segWidth = scoreCanvas.width / totalSegments;
    scorectx.fillStyle =  "rgba(222,222,222, 1.0)";
    scorectx.shadowOffsetX = 0;
    scorectx.shadowOffsetY = 0;

    scorectx.fillRect(segWidth * segmentIndex,  0, segWidth, scoreCanvas.height);
}
var scoreStartx = function( segmentIndex, totalSegments, text) {
    var segWidth = scoreCanvas.width / totalSegments;
    var twidth = scorectx.measureText(text).width;
    return  ((segWidth * segmentIndex) + (segWidth/2) - (twidth/2));

}
var updateScores = function () {
    var i;
    for (i = 0; i < 4; i++ ) {
        if (theGame.worms[i] !== undefined  &&  theGame.worms[i].shouldDrawScore()) {
            clearScore(i,4);
            scorectx.fillStyle = theGame.colorTable[i+1];
            scorectx.shadowOffsetX = 3;
            scorectx.shadowOffsetY = 3;
            scorectx.fillText(theGame.worms[i].score, scoreStartx(i,4,theGame.worms[i].score.toString()), 25);
        }
    }
};
var makeMoves = function () {
      // console.log(" makeMoves theGameOver " + theGameOver +  "  gameState " + gameStateNames[theGame.gameState] );
      var startTime = new Date().getTime();
      theGame.startFrameTimes.push(startTime);
      if (theGame.needsRedraw) {
        theGame.drawCells();
        theGame.needsRedraw = false;
        // wGraphics.drawImage(localImage, 10, 10);
        
      }
      if (theGameOver === false) {
          if (theGame.makeMove() === false) {
            theGameOver = true;
            theGame.elapsedTime = theGame.elapsedTime  + new Date().getTime();
            console.log(" Game Over");
            clearInterval(timer);
            document.getElementById("startpause").innerHTML = "Start Game";
            theGame.showTimes();
            theGame.gameState = gameStates.over;
            // theGame.clearCanvas();
            // alert("Game Over ");
            wGraphics.restore();
          }
      }
      theGame.drawDirtyCells();
      theGame.getAvePos();
      updateScores();
      var elapsed = new Date().getTime() - startTime;
      theGame.frameTimes.push(elapsed);
};
var updateGameState = function () {
    // This is the game loop
    // We either make one round of moves
    // or if we are waiting for user input
    // we draw the direction selection screen
    //
    // console.log(" updateGameState: gameState " +  gameStateNames[theGame.gameState]);   
    animFrame = animFrame + 1;    
    if (theGame.gameState === gameStates.running) {
        makeMoves();
    }
    if (theGame.gameState === gameStates.waiting) {
        theGame.drawSelectCell(focusPoint);
    }
    
};
var doZoomOut = function ( tapPoint ) {
    if (tapPoint.dist(new Point(0, 1.0)) < 0.2 ) {
        if (theGame.cellsInZoomPane.x >= 3) {
            theGame.cellsInZoomPane.x = theGame.cellsInZoomPane.x  - 2;
            theGame.cellsInZoomPane.y = theGame.cellsInZoomPane.y - 2;
        }
        console.log( "doZoomIN: returning true  wPane size ="  +  theGame.cellsInZoomPane.x );
        theGame.zoomPane.canvasIsDirty = true;
        theGame.zoomPane.setSize(new Point(theGame.cellsInZoomPane.x,theGame.cellsInZoomPane.y))
        return true;
    }
    if (tapPoint.dist(new Point(0, -1.0)) < 0.2 ) {
        if (theGame.cellsInZoomPane.x < theGame.grid.width - 2) {
            theGame.cellsInZoomPane.x = theGame.cellsInZoomPane.x + 2;
            theGame.cellsInZoomPane.y = theGame.cellsInZoomPane.y + 2;
            console.log( "doZoomOut: returning true  wPane size ="  +  theGame.cellsInZoomPane.x );
            theGame.zoomPane.canvasIsDirty = true;
            theGame.zoomPane.setSize(new Point(theGame.cellsInZoomPane.x,theGame.cellsInZoomPane.y))
            // theGame.drawZoom(theGame.zoomPane.focus, theGame.cellsInZoomPane);

        return true;
        }
    }
    return false;

}
var selectDirection = function ( point ) {
    // console.log( "selectDirection: " + point.format());
    var outvec = theGame.grid.stateAt(focusPoint);
    var minDist = 100000;
    var dist;
    var select = -1;
    for (var i = 0; i < 6 ; i = i + 1) {
        if ((outvec & outMask[i]) === 0) {
          dist = point.dist(new Point(theGame.xPts[i], theGame.yPts[i]));
          if (dist < minDist) {
             minDist = dist; 
             select = i;
          }
         // console.log( "selectDirection i: " + i + "  dist: " + dist + " Min Dist:" + minDist);
        } 
    }
    if ((minDist < 0.5)  && (select >= 0)) {
        focusWorm.dna[focusValue & 0x3F] = select;
        theGame.gameState = gameStates.running;
        theGame.clearCanvas();
        theGame.drawCells();
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
  if (theGame.gameState === gameStates.waiting) {
    // TODO  - 50 is because canvas appears at y = 50 and touchY is screen relative
    // or is this because of the JetBrains Debug banner at the top ?
    if ( doZoomOut(new Point((touchX/theGame.canvas.width)*2.0 - 1.0, ((touchY-50)/theGame.canvas.height)*2.0 - 1.0) )) {
        console.log(" do zoomout here");
    } else {
        selectDirection( new Point((touchX/theGame.canvas.width)*2.0 - 1.0, ((touchY-50)/theGame.canvas.height)*2.0 - 1.0));
    }
  }
};
var startgame = function() {

    if (theGame === undefined) {
        console.log(" theGame is undefined ");
        return;
    }
    if (theGame.gameState === gameStates.running) {
        // This is now a pause game button 
        clearInterval(timer);
        document.getElementById("startpause").innerHTML = "Resume Game";
        theGame.gameState = gameStates.paused;
        return;
    }
    if (theGame.gameState === gameStates.paused) {
        // This is now a pause game button 
        document.getElementById("startpause").innerHTML = "Pause Game";
        theGame.gameState = gameStates.running;        
        timer = setInterval(updateGameState,1000/$("#fps").val());
        return;
    }
    if (theGame.gameState === gameStates.over) {
        // This is now a start game button 
        // alert("About to Start Game.");

        document.getElementById("startpause").innerHTML = "<b>Pause Game</b>";        theGame.gameState = gameStates.running;
        console.log(" setInterval: " +  1000/$("#fps").val());   
        document.getElementById("startpause").innerHTML = "Pause Game";
        initTheGame(true);
        theGame.log();
        timer = setInterval(updateGameState,1000/$("#fps").val());
    }
 
};
var preventBehavior = function(e) {
    e.preventDefault();
};
var fail = function (msg) {
    alert(msg);
}
var initTheGame = function(startNow) {
    console.log(" initTheGame: startnow  " + startNow);
    console.log ( " initTheGame wGraphics " + wGraphics);
    
    var gWidth = 16;
    var gHeight = 16;
    gHeight = $("#gridsize").val();
    if ((gHeight & 1) !== 0) {
        // height must be an even number because of toroid shape
        gHeight = gHeight*1 + 1;       
    }
    gWidth = gHeight; 
    
    var game = new Game(gWidth, gHeight, canvas, wGraphics);
    game.clear();
    game.drawCells();
    game.worms = gWorms;
    console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + gHeight);
    for (var i = 0; i < gWorms.length; i = i + 1) {
        if (players[i] !== 0) { //  not None
            gWorms[i].init(players[i]);
        }
        gWorms[i].place( initialWormStates[players[i]] , game);
    }    
 
    theGame = game;
    if (startNow) {
        theGameOver = false;
        theGame.gameState = gameStates.running;
        
    } else {
        theGameOver = true;
        theGame.gameState = gameStates.over;
       
    }
    theGame.needsRedraw = true;
    
}
var init = function () {
    // This may be needed when we actually build a phoneGap app
    // in this case delay initialization untill we get the deviceready event
    document.addEventListener("deviceready", deviceInfo, true);
    setTypes();
    canvas = document.getElementById("wcanvas");
    wGraphics = canvas.getContext("2d");
    console.log ( " init wGraphics " + wGraphics);
    $('#wcanvas').bind('tap', wormEventHandler);
    initTheGame(false);
    scoreCanvas = document.getElementById("scorecanvas");
    scorectx =  scoreCanvas.getContext("2d");
    scorectx.font = "bold 18px sans-serif";
    scorectx.shadowColor = "rgb(190, 190, 190)";
    scorectx.shadowOffsetX = 3;
    scorectx.shadowOffsetY = 3;

}
