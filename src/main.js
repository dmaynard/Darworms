import {
  darworms
} from "./loader.js";
import AudioSample from "./AudioSample.js";
import {
  Point
} from "./Point.js";
import "./Grid.js";
import {
  Worm
} from "./Worm.js";
import {
  Game,
  gameInit,
  makeMoves,
  selectDirection,
  updateScores
} from "./Game.js";
import {
  graphicsInit,
  reScale,
  wCanvas,
  wGraphics,
  drawPickCells,
  drawCells,
  drawDirtyCells,
  clearCanvas,
  setScale
} from "./graphics.js";
/*
  <script src="scripts/loader.js"></script>
  <script src="scripts/AudioSample.js"></script>
  <script src="scripts/Point.js"></script>
  <script src="scripts/Grid.js"></script>
  <script src="scripts/Worm.js"></script>
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

darworms.main = (function() {

  var deviceInfo = function() {
    alert("This is a deviceInfo.");
    document.getElementById("width").innerHTML = screen.width;
    document.getElementById("height").innerHTML = screen.height;
    document.getElementById("colorDepth").innerHTML = screen.colorDepth;
  };
  /* Game Globals  Done   wrap these globals in a function  */

  var useKalimbaAudio = false;
  var usePianoAudio = true;
  var useSitarAudio = false;

  var playerTypes = [3, 0, 1, 0];
  var buttonNames = ['#p1button', '#p2button', '#p3button', '#p4button',
    '#p1Lbutton', '#p2Lbutton', '#p3Lbutton', '#p4Lbutton'
  ];
  var typeNames = [" None ", "Random", " Same ", " New  "];
  var textFields = ['#p1textfield', '#p2textfield', '#p3textfield', '#p4textfield', '#edittextfield'];




  var gWorms = [new Worm(1, darworms.wormStates.paused), new Worm(2, darworms.wormStates.paused), new Worm(3, darworms.wormStates.paused), new Worm(4, darworms.wormStates.paused)];


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
    if (darworms.theGame && darworms.theGame.gameState !== darworms.gameStates.over) {
      $('.darwormTypeRadioButtons').hide();
      $('.playKeyNotes').hide();
    } else {
      $('.darwormTypeRadioButtons').show();
      $('.playKeyNotes').show();
      var darwormType = playerTypes[darworms.selectedIdx];
      var color = darworms.colorNames[darworms.selectedIdx];
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
        theme: darworms.themes[darworms.selectedIdx]
      });
      $(textFields[4]).val(playerTypes[darworms.selectedIdx] == 0 ? "" : gWorms[darworms.selectedIdx].name);
    //  })
    }
  }

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
  }

  var showSettings = function() {
    if (darworms.theGame && darworms.theGame.gameState !== darworms.gameStates.over) {
      $('#geometryradios').hide();
      $('#gridsizeslider').hide();
      $('#abortgame').show();
    } else {
      $('#geometryradios').show();
      $('#gridsizeslider').show();
      $('#abortgame').hide();
    }
    if (darworms.dwsettings.forceInitialGridSize) {
      $('#gridsize').val(
        darworms.dwsettings.isLargeScreen ? darworms.dwsettings.largeGridSize :
        darworms.dwsettings.smallGridSize).slider("refresh");
      darworms.dwsettings.forceInitialGridSize = false;
    }
  }


  var setupGridGeometry = function() {
    console.log(" pagebeforeshow setupGridGeometry ");
    if (darworms.theGame && darworms.theGame.gameState !== darworms.gameStates.over) {
      $('#geometryradios').hide();
    } else {
      $('#geometryradios').show();
    }

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

  var applySettings = function() {
    var selectedGeometry = $('input[name=geometry-radio-choice]:checked').val();
    darworms.dwsettings.gridGeometry = selectedGeometry;

    if (darworms.dwsettings.backGroundTheme !== $('#backg').slider().val()) {
      darworms.dwsettings.backGroundTheme = $('#backg').slider().val();
      if (darworms.theGame) {
        clearCanvas();
        drawCells();
      }
    }
    darworms.dwsettings.doAnimations = $('#doanim').slider().val() == "true" ? true : false;
    darworms.dwsettings.doAudio = $('#audioon').slider().val();
    darworms.dwsettings.fixedInitPos = $('#fixedinitpos').slider().val();

    darworms.dwsettings.pickDirectionUI = $('#pickDirectionUI').slider().val();

    console.log(" darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);
    console.log(" darworms.dwsettings.doAudio " + darworms.dwsettings.doAudio);
    darworms.masterAudioVolume = $("#audiovol").val() / 100;
    darworms.graphics.fps = $("#fps").val();
    darworms.graphics.frameInterval = 1000 / darworms.graphics.fps;

    console.log(" darworms.masterAudioVolume " + darworms.masterAudioVolume);
  }


  /* The following code is called from the game timer */

  /* This sh.right {
   float: right;
   width: 300px;
   background-color: #b0e0e6;
   }ould be wrapped in an anonymous function closure */


  // var localImage;

  var updateGameState = function() {
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
      if (darworms.dwsettings.doAnimations) makeMoves();

    }
    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      // console.log("w");
      darworms.theGame.drawPickCells();
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
    var loc = pointerEventToXY(event)
    var touchX = loc.x;
    var touchY = loc.y
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
    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      selectDirection(new Point(touchX, touchY));
    }
  };
  darworms.menuButton = function() {
    console.log(" menuButton");
    if (darworms.theGame.gameState && ((darworms.theGame.gameState == darworms.gameStates.running) ||
        (darworms.theGame.gameState == darworms.gameStates.paused))) {
      darworms.theGame.gameState = darworms.gameStates.paused;
      $.mobile.changePage("#settingspage");
      darworms.theGame.needsRedraw = true;
      drawCells();
      $("#startpause").text("Resume Game");
    } else {
      if (darworms.theGame.gameState == darworms.gameStates.waiting) {
        $.mobile.changePage("#settingspage");
      } else {
        $.mobile.changePage("#menupage");
      }
    }
  }
  darworms.setKeyVal = function(index) {
    var selectedKeyInput = $('#select-native-key');
    if (selectedKeyInput.length == 1) {
      gWorms[darworms.selectedIdx].setKey(selectedKeyInput.val());
    }
  }
  darworms.setInstrumentVal = function(index) {
    var selectedInstrumentInput = $('#select-native-edit');
    if (selectedInstrumentInput.length == 1) {
      var instrument = parseInt(selectedInstrumentInput.val());
      gWorms[darworms.selectedIdx].setNotes(instrument);

    }
  }
  darworms.startgame = function(startNow) {
    console.log(" Startgame start now = " + startNow);
    if (darworms.theGame) {
      console.log("GameState is " +
        darworms.theGame.gameState + (darworms.gameStateNames[darworms.theGame.gameState]));
    }
    // wCanvas.width = $('#wcanvas').width();
    // wCanvas.height = $('#wcanvas').height(); // make it square
    darworms.dwsettings.isLargeScreen = wCanvas.width >= darworms.dwsettings.minLargeWidth;
    var curScreen = new Point(wCanvas.width, wCanvas.height);
    darworms.wCanvasPixelDim = curScreen;
    var heightSlider = darworms.dwsettings.forceInitialGridSize ? (darworms.dwsettings.isLargeScreen ?
        darworms.dwsettings.largeGridSize : darworms.dwsettings.smallGridSize) :
      Math.floor($("#gridsize").val());
    var curScreen = new Point(wCanvas.width, wCanvas.height);
    if (darworms.theGame === undefined || darworms.theGame === null || darworms.theGame.grid.height != heightSlider ||
      !(darworms.wCanvasPixelDim.isEqualTo(curScreen))) {
      console.log(" theGame size has changed Screen is" + curScreen.format() + " grid = " + heightSlider + " x " +
        heightSlider);
      if ((heightSlider & 1) !== 0) {
        // height must be an even number because of toroid shape
        heightSlider = heightSlider + 1;
      }

      if ($('#debug').slider().val() === 1) {
        alert(" wCanvas " + wCanvas.width + " x " + wCanvas.height +
          " css " + $('#wcanvas').width() + " x " + $('#wcanvas').height() +
          " window " + window.innerWidth + " x " + window.innerHeight);
      }
      darworms.theGame = new Game(heightSlider, heightSlider);
    }
    if (darworms.theGame.gameState === darworms.gameStates.over) {
      darworms.theGame.initGame();
      $("#startpause").text("Start Game");
      darworms.theGame.needsRedraw = true;
      drawCells();
      darworms.theGame.worms = gWorms;
      console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + heightSlider);

      gWorms.forEach(function(worm, i) {
        worm.init(playerTypes[i]);
        if (playerTypes[i] !== 0) { //  not None

          $(buttonNames[i]).addClass("ui-opaque");
        } else {
          $(buttonNames[i]).addClass("ui-grayed-out");
        }
        // $(textFields[i]).val(worm.toText());
        var startingPoint = ((darworms.dwsettings.fixedInitPos == 1) ? darworms.theGame.origin :
          new Point((Math.floor(Math.random() * darworms.theGame.grid.width)),
            (Math.floor(Math.random() * darworms.theGame.grid.height))));


        worm.place(darworms.initialWormStates[playerTypes[i]], darworms.theGame,
          startingPoint);
        if (playerTypes[i] !== 0) { //  not None
          darworms.theGame.grid.setSinkAt(startingPoint);
        }
      })
    }
    updateScores();
    if (startNow === false) return;
    console.log(" NEW in startgame darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);
    if (darworms.theGame.gameState === darworms.gameStates.running) {
      // This is now a pause game button
      // clearInterval(darworms.graphics.timer);
      // document.getElementById("startpause").innerHTML = "Resume Game";
      $("#startpause").text("Resume Game");
      darworms.theGame.gameState = darworms.gameStates.paused;
      darworms.theGame.needsRedraw = true;
      drawCells();
      return;
    }
    if (darworms.theGame.gameState === darworms.gameStates.paused) {
      // This is now a start game button
      // document.getElementById("startpause").innerHTML = "Pause Game";
      $("#startpause").text("Pause");
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
      var animFramesPerSec = darworms.dwsettings.doAnimations ? $("#fps").val() : 60;
      startGameLoop(animFramesPerSec);
      console.log(" setInterval: " + 1000 / $("#fps").val());
      // document.getElementById("startpause").innerHTML = "Pause Game";
      $("#startpause").text("Pause Game");
      initTheGame(true);
      darworms.theGame.log();
    }
    if (!darworms.dwsettings.doAnimations) {
      // run game loop inline and draw after game is over
      //  No.  This locks the browser.  We must put it inside the the
      // animation request and do a set of moves each animframe and draw the
      // playfield
      console.log('darworms.dwsettings.doAnimations == "false"')
      darworms.theGame.gameState = darworms.gameStates.running;
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
    darworms.graphics.fps = frameRate;
    darworms.graphics.frameInterval = 1000 / frameRate;
    darworms.graphics.iufps = 30;
    darworms.graphics.uiInterval = 1000 / frameRate;
    darworms.graphics.animFrame = 0;
    darworms.graphics.uiFrames = 0;

    darworms.graphics.rawFrameCount = 0;
    darworms.graphics.drawFrameCount = 0;
    darworms.graphics.rawFrameCount = 0;
    darworms.graphics.uiFrameCount = 0;
    darworms.graphics.then = Date.now();

    darworms.graphics.uiThen = Date.now();
    darworms.graphics.startTime = darworms.graphics.then;
    darworms.graphics.uiInterval = 1000 / darworms.graphics.uifps;
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
    if (darworms.theGame.gameState == darworms.gameStates.over) {
      //  end of game cleanup
      gWorms.forEach(function(worm, i) {
        if (worm.wType == 3) { //  new
          worm.wType = 2; // Same

        }
        worm.toText(); //  update string version of dna
      })
      for (let ig = 0; ig < 4; ig++) {
        playerTypes[ig] = gWorms[ig].wType;
      }
      setButtonNames();
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
          darworms.graphics.uiFrames = darworms.graphics.uiFrames + 1;
          makeMoves();
          darworms.graphics.then = darworms.graphics.now -
            (darworms.graphics.elapsed % darworms.graphics.frameInterval)
        }

      } else {
        var startTime = Date.now();
        var nMoves = 0;
        var movesPerFrame = 80; // allows for approx 30 fps with drawing
        while ((nMoves < movesPerFrame) && (darworms.theGame.gameState != darworms.gameStates.over) &&
          (darworms.theGame.gameState !== darworms.gameStates.waiting)) {
          nMoves = nMoves + 1;;
          makeMoves();
        }
        console.log("Compute time: " + (Date.now() - startTime));

        var startTime = Date.now();
        updateScores();
        drawDirtyCells();
        console.log("Draw time: " + (Date.now() - startTime));

        console.log(".");
      }

    }

    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      darworms.graphics.now = Date.now();
      darworms.graphics.uiElapsed = darworms.graphics.now - darworms.graphics.uiThen;
      if (darworms.graphics.uiElapsed > darworms.graphics.uiInterval) {
        drawPickCells();
        darworms.graphics.uiThen = darworms.graphics.now -
          (darworms.graphics.uiElapsed % darworms.graphics.uiInterval)
      }
    }

    // if ( darworms.graphics.rawFrameCount %  60 == 0) {
    //     console.log("Date.now() " + Date.now());
    // }
  }

  darworms.abortgame = function() {
    console.log("Abort Game called");
    $.mobile.changePage('#abortdialog', 'pop', true, true);
    // $("#lnkDialog").click();

  }

  darworms.playScale = function(index) {
    console.log("playScale called");
    gWorms[index].playScale();


  }
  darworms.yesabortgame = function() {
    console.log("Abort Game called");
    $.mobile.changePage('#playpage');
    darworms.theGame.gameState = darworms.gameStates.over;
    darworms.startgame(false);
    // $("#lnkDialog").click();

  }

  darworms.noabortgame = function() {
    console.log("Abort Game called");
    $.mobile.changePage('#settingspage');
    // $("#lnkDialog").click();

  }

  var preventBehavior = function(e) {
    e.preventDefault();
  };
  var fail = function(msg) {
    alert(msg);
  }
  var initTheGame = function(startNow) {

    gWorms.forEach(function(worm, i) {
      // $(textFields[i]).val(worm.toText());
      // worm.setNotes(i);
    })
    if (startNow) {
      darworms.theGame.gameState = darworms.gameStates.running;

    } else {
      darworms.theGame.gameState = darworms.gameStates.over;

    }
    // startgame(startNow);
    darworms.theGame.needsRedraw = true;

  }
  var resizeCanvas = function() {
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

    if (darworms.theGame) {
      setScale(this.grid.width, this.grid.height);
      darworms.theGame.needsRedraw = true;
      clearCanvas();
      drawCells();
    }
  }
  var initPlayPage = function() {
    var mainbody = $('#myPages');
    mainbody.css({
      overflow: 'hidden',
      height: '100%'
    });

    if (!darworms.playpageInitialized) {
      resizeCanvas();
      darworms.startgame(false);
      darworms.audioContext.resume();
      darworms.playpageInitialized = true;
    }
  }

  var leavePlayPage = function() {
    var mainbody = $('#myPages');
    mainbody.css({
      overflow: 'auto',
      height: 'auto'
    });

    if (!darworms.playpageInitialized) {
      resizeCanvas();
      darworms.startgame(false);
      darworms.audioContext.resume();
      darworms.playpageInitialized = true;
    }
    $("body").css("scroll", "on");
    $("body").css("overflow", "hidden");
  }
  var swapTheme = function (selector, newTheme) {
    //  needed because JQuery Mobile only adds additional themes
    // note we could add a hash table to keep tutorialCheckbox// previously added themes
    selector.removeClass('ui-page-theme-c');
    selector.removeClass('ui-page-theme-d');
    selector.removeClass('ui-page-theme-e');
    selector.removeClass('ui-page-theme-f');
    selector.page("option", "theme", newTheme);
  }
  var initEditPage = function(foo) {
    console.log(" initEditPage " + darworms.selectedIdx)
    swapTheme($('#edit-darworm-page'), darworms.themes[darworms.selectedIdx]);
    $('#edittextfield').val(gWorms[darworms.selectedIdx].wType == 0 ? "" : gWorms[darworms.selectedIdx].name);
    // $('#edit-darworm-page').page.refresh();

    $('[name=select-instrument]').val(gWorms[darworms.selectedIdx].instrument);
    $('[name=select-instrument]').selectmenu("refresh");

    $('[name=select-key]').val(gWorms[darworms.selectedIdx].musickeyName);
    $('[name=select-key]').selectmenu("refresh");
    // $('[name=select-instrument]').refresh();
    $('#edit-darworm-page').trigger("create");
  }

  var leaveEditPage = function(foo) {
    console.log(" leaveEditPage " + foo)
  }

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
    darworms.audioContext = new(window.AudioContext || window.webkitAudioContext)();

    if (darworms.audioContext == null) {
      darworms.dwsettings.doAudio = false;
      alert(" Could not load webAudio... muting game");
      $('#doAudio').hide();
    }
    unlockAudioContext(darworms.audioContext);
    console.log("audio is " + darworms.dwsettings.doAudio + "  Context state is " + darworms.audioContext.state);

    if (darworms.dwsettings.doAudio) {
      if (darworms.audioContext.createGain !== undefined) {
        darworms.masterGainNode = darworms.audioContext.createGain(0.5);
      }
      if (darworms.audioContext.createStereoPanner !== undefined) {
        darworms.audioPanner = darworms.audioContext.createStereoPanner();
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
      darworms.audioPlaybackRates.push(noteRate);
      darworms.audioFrequencies.push(noteFrequency * noteRate);
      noteRate = noteRate * twelfrootoftwo;

    }
    while (darworms.audioPlaybackRates.length < 13);
    console.log("Final rate = " + darworms.audioPlaybackRates[12] + "  error: " +
      (1.0 - darworms.audioPlaybackRates[12]));

    darworms.audioPlaybackRates[12] = 1.0;



    // context state at this time is `undefined` in iOS8 Safari
    if (darworms.audioContext.state === 'suspended') {
      var resume = function() {
        darworms.audioContext.resume();

        setTimeout(function() {
          if (darworms.audioContext.state === 'running') {
            document.body.removeEventListener('touchend', resume, false);
          }
        }, 0);
      };

      document.body.addEventListener('touchend', resume, false);
    }

  }

  var initGlobals = function() {
    // precompute some useful coordinates for hexgon grids
    // for a hex grid set inside of a square grid of w=h=1.0 the length
    // of every edge of the hex is sqrt (3)

  }
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
  }
  var init = function() {
    // This may be needed when we actually build a phoneGap app
    // in this case delay initialization until we get the deviceready event
    document.addEventListener("deviceready", deviceInfo, true);
    // window.onresize = doReSize;
    // doReSize();
    $('#versionstring')[0].innerHTML = "Version " + darworms.version;
    // wCanvas = document.getElementById("wcanvas");
    // darworms.main.wGraphics = wCanvas.getContext("2d");
    graphicsInit();
    darworms.wCanvasPixelDim = new Point(wCanvas.clientWidth, wCanvas.clientHeight); // console.log ( " init wGraphics " + darworms.main.wGraphics);
    $('#wcanvas').bind('tap', wormEventHandler);
    // $('#wcanvas').on("tap", wormEventHandler);
    // $('#wcanvas').bind('vmousedown', wormEventHandler);

    // this should depend on scale factor.  On small screens
    // we should set pickDirectionUI to true
    $('#pickDirectionUI').slider().val(0);
    $('#pickDirectionUI').slider("refresh");

    darworms.wCanvasRef = $('#wcanvas');

    initGlobals();

    loadAudio();

    setButtonNames();

    applySettings();


    darworms.dwsettings.scoreCanvas = document.getElementById("scorecanvas");
    gameInit(); // needed to init local data in the gameModule closure
    //  These values are needed by both mainModule and gameModule
    //  so for now we keep them as globals
    //  Perhaps the time routines should all be moved into the gameModule closure
    // and we can make some or all of these private to the gameModule closure
    // darworms.theGame = new Game ( darworms.dwsettings.forceInitialGridSize, darworms.dwsettings.forceInitialGridSize);
    // darworms.startgame(false);
    darworms.dwsettings.noWhere = new Point(-1, -1);


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
      if (darworms.theGame) {
        clearCanvas();
      }
      resizeCanvas();
      var heightSlider = Math.floor($("#gridsize").val());
      if ((heightSlider & 1) !== 0) {
        // height must be an even number because of toroid shape
        heightSlider = heightSlider + 1;
      }
      if (darworms.theGame) {
        reScale(darworms.theGame.grid.width, darworms.theGame.grid.height);
      }
    });

    gWorms.forEach(function(worm, i) {
      worm.setNotes(0);
    })
    resizeCanvas();
    $("#p1button").click(function() {
      darworms.selectedIdx = 0;
    });
    $("#p2button").click(function() {
      darworms.selectedIdx = 1;
    });
    $("#p3button").click(function() {
      darworms.selectedIdx = 2;
    });
    $("#p4button").click(function() {
      darworms.selectedIdx = 3;
    });
    $("#nextbutton").click(function() {
      console.log(" nextbutton clicked");
      $.mobile.changePage( "#edit-darworm-page", { allowSamePageTransition: true } );
      darworms.selectedIdx = ((darworms.selectedIdx + 1) % gWorms.length);
      initEditPage(darworms.selectedIdx);
      // $.mobile.changePage( "#edit-darworm-page", { allowSamePageTransition: true } );
    });
    $("input[name='edit-radio-choice']").on("change", function() {
      console.log(" edit-radio-choice on change function");
      var type = ($("input[name='edit-radio-choice']:checked").val());
      playerTypes[darworms.selectedIdx] = typeFromName(type);
      gWorms[darworms.selectedIdx].init(typeFromName(type));
      $('#edittextfield').val(typeFromName(type) == 0 ? "" : gWorms[darworms.selectedIdx].name);
    });

    //  These four handlers should be combined into one parameterized one or
    //  generated closures for each one
    $("input[name='edit-textname']").on("change", function() {
      console.log(" edit-textname")
      var dnastring = ($("input[name='edit-textname']").val());
      var regx = /^[ABCDEF\?]{63}X$/;
      if (regx.test(dnastring)) {
        if (gWorms[darworms.selectedIdx].fromText(dnastring)) {
          gWorms[darworms.selectedIdx].wType = 2; // Same
          playerTypes[darworms.selectedIdx] = 2;
          setupEditPage();


          $(darworms.buttonSelectors[darworms.selectedIdx]).text(typeNames[playerTypes[darworms.selectedIdx]]);
          $(darworms.buttonLSelectors[darworms.selectedIdx]).text(typeNames[playerTypes[darworms.selectedIdx]]);
          gWorms[darworms.selectedIdx].toText();
          $("input[name='edit-textname']").textinput({
            theme: darworms.themes[darworms.selectedIdx]
          });
        };
      } else {
        $("input[name='edit-textname']").textinput({
          theme: "a"
        });
      }
    });
  }

  return {
    init: init,

    setSelectedDarwormType: setSelectedDarwormType,
    setupEditPage: setupEditPage,
    applySettings: applySettings,
    showSettings: showSettings,
    setupGridGeometry: setupGridGeometry,
    initPlayPage: initPlayPage,
    leavePlayPage: leavePlayPage,
    wormEventHandler: wormEventHandler,
    initEditPage: initEditPage,
    leaveEditPage: leaveEditPage

  };

})();
/* end of Game */
