import "./loader.js";
import AudioSample from "./AudioSample.js";
import Point from "./Point.js";
import "./Grid.js";
import Worm from "./Worm.js";
import "./WPane.js";
import "./Game.js";

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
 Deployment:
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
  var textFields = ['#p1textfield', '#p2textfield', '#p3textfield', '#p4textfield'];
  var wGraphics;
  var wCanvas;

  // var targetPts = [ new Point( 0.375,0), new Point( 0.25, 0.375), new Point( -0.25, 0.375),
  //    new Point(-0.375,0), new Point(-0.25,-0.375), new Point(  0.25,-0.375)];
  /* Worm  Constants */

  window.compassPts = ["e", "ne", "nw", "w", "sw", "se", "unSet", "isTrapped"];
  window.wormStates = {
    "dead": 0,
    "moving": 1,
    "paused": 2,
    "sleeping": 3,
    "dying": 4   //  dead but let the game keep going for a few frames to animate
  };
  window.wormStateNames = ["dead", "moving", "paused", "sleeping", "dying"];
  window.initialWormStates = [3, 2, 2, 2];
  var gWorms = [new Worm(1, wormStates.paused), new Worm(2, wormStates.paused), new Worm(3, wormStates.paused), new Worm(4, wormStates.paused)];


  var setTypes = function() {
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
      // worm.setNotes(i);
      $(buttonNames[i]).removeClass(
        playerTypes[i] === 0 ? "ui-opaque" : "ui-grayed-out");
      $(buttonNames[i]).addClass(
        playerTypes[i] === 0 ? "ui-grayed-out" : "ui-opaque");
    });
  };


  var setupRadioButtons = function() {
    darworms.selectedDarworm = $.mobile.activePage.attr("data-selecteddarworm");
    if (darworms.theGame && darworms.theGame.gameState !== darworms.gameStates.over) {
      $('.darwormTypeRadioButtons').hide();
      $('.playKeyNotes').hide();
    } else {
      $('.darwormTypeRadioButtons').show();
      $('.playKeyNotes').show();
      var darwormType = playerTypes[darworms.selectedDarworm];
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
      gWorms.forEach(function(worm, i) {
        worm.toText();
        $(textFields[i]).val(playerTypes[i] == 0 ? "" : worm.name);
      })
    }
  }

  var setSelectedDarwormType = function() {
    // This may no longer be needed since each properties page now
    // directly sets the wTypes.
    if (darworms.theGame && darworms.theGame.gameState !== darworms.gameStates.over) {
      return;
    }
    var color = darworms.colorNames[darworms.selectedDarworm];
    var selectinput = 'input[name=' + color + '-radio-choice]';
    var selectedType = $(selectinput + ':checked').val();
    switch (selectedType) {
      case "none":
        playerTypes[darworms.selectedDarworm] = 0;
        break;
      case "random":
        playerTypes[darworms.selectedDarworm] = 1;
        break;
      case "same":
        playerTypes[darworms.selectedDarworm] = 2;
        break;
      case "new":
        playerTypes[darworms.selectedDarworm] = 3;
        break

      default:
        alert("unknown type");
    }
    setTypes();
  }

  var showSettings = function() {
    if (darworms.theGame && darworms.theGame.gameState !== darworms.gameStates.over) {
      $('#geometryradios').hide();
      $('#abortgame').show();
    } else {
      $('#geometryradios').show();
      $('#abortgame').hide();
    }
    if (darworms.dwsettings.initialGridSize  > 0 ) {
        $('#gridsize').val(darworms.dwsettings.initialGridSize).slider("refresh");
          darworms.dwsettings.initialGridSize = 0;
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
        darworms.theGame.clearCanvas();
        darworms.theGame.drawCells();
      }
    }
    darworms.dwsettings.doAnimations = $('#doanim').slider().val() == "true" ? true : false;
    darworms.dwsettings.doAudio = $('#audioon').slider().val();
    darworms.dwsettings.fixedInitPos = $('#fixedinitpos').slider().val();
    darworms.dwsettings.panToSelectionUI = $('#panToSelectionUI').slider().val();
    darworms.dwsettings.pickDirectionUI = $('#pickDirectionUI').slider().val();

    console.log(" darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);
    console.log(" darworms.dwsettings.doAudio " + darworms.doAudio);
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
      if (darworms.dwsettings.doAnimations) darworms.gameModule.makeMoves();

    }
    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      // console.log("w");
      (darworms.dwsettings.panToSelectionUI == 1) ?
      darworms.theGame.drawSelectCell(): darworms.theGame.drawPickCells();
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

    var cWidth = $('#wcanvas').width();
    var cHeight = $('#wcanvas').height();
    console.log(" Tap Event at x: " + touchX + " y: " + touchY);
    // console.log(" wcanvas css   width " + $('#wcanvas').width() + " css   height " + $('#wcanvas').height());
    // console.log (" wcanvas coord width " + darworms.main.wCanvas.width + " coord height "  + darworms.main.wCanvas.height  );
    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      if (darworms.dwsettings.panToSelectionUI == 0) { //main screen small ui
        darworms.gameModule.selectDirection(new Point(touchX, touchY));
      } else {
        if (darworms.gameModule.doZoomOut(new Point((touchX / cWidth) * 2.0 - 1.0, ((touchY) / cHeight) * 2.0 - 1.0))) {
          console.log(" do zoomout here");
        } else {
          // console.log(" touch event at " + new Point(touchX, touchY).format);
          darworms.gameModule.selectDirection(new Point(touchX, touchY));

        }
      }
    }
  };
  darworms.menuButton = function() {
    console.log(" menuButton");
    if ( darworms.theGame.gameState &&  ((darworms.theGame.gameState == darworms.gameStates.running) ||
      (darworms.theGame.gameState == darworms.gameStates.paused))) {
      darworms.theGame.gameState = darworms.gameStates.paused;
      $.mobile.changePage("#settingspage");
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
    var selectedKeyInput = $('#select-native-key-' + darworms.colorNames[index]);
    if (selectedKeyInput.length == 1) {
      gWorms[index].setKey(selectedKeyInput.val());
    }
  }
  darworms.setInstrumentVal = function(index) {
    var selectedInstrumentInput = $('#select-native-' + darworms.colorNames[index]);
    if (selectedInstrumentInput.length == 1) {
      gWorms[darworms.selectedDarworm].setNotes(parseInt(selectedInstrumentInput.val()));
    }
  }
  darworms.startgame = function(startNow) {
    var heightSlider = darworms.dwsettings.initialGridSize > 0 ?  darworms.dwsettings.initialGridSize:
           Math.floor($("#gridsize").val());
    var curScreen = new Point($('#wcanvas').width(), $('#wcanvas').height());
    if (darworms.theGame === undefined || darworms.theGame === null || darworms.theGame.grid.height != heightSlider ||
      !(darworms.wCanvasPixelDim.isEqualTo(curScreen))) {
      console.log(" theGame size has changed Screen is" + curScreen.format() + " grid = " + heightSlider + " x " +
        heightSlider);
      if ((heightSlider & 1) !== 0) {
        // height must be an even number because of toroid shape
        heightSlider = heightSlider + 1;
      }
      darworms.main.wCanvas.width = $('#wcanvas').width();
      darworms.main.wCanvas.height = $('#wcanvas').height(); // make it square
      darworms.wCanvasPixelDim = curScreen;
      if ($('#debug').slider().val() === 1) {
        alert(" wCanvas " + darworms.main.wCanvas.width + " x " + darworms.main.wCanvas.height +
          " css " + $('#wcanvas').width() + " x " + $('#wcanvas').height() +
          " window " + window.innerWidth + " x " + window.innerHeight);
      }
      darworms.theGame = new darworms.gameModule.Game(heightSlider, heightSlider);
    }
    if (darworms.theGame.gameState === darworms.gameStates.over) {
      darworms.theGame.initGame();
      $("#startpause").text("Start Game");
      darworms.theGame.needsRedraw = true;
      darworms.theGame.drawCells();
      darworms.theGame.worms = gWorms;
      console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + heightSlider);

      gWorms.forEach(function(worm, i) {
        worm.init(playerTypes[i]);
        if (playerTypes[i] !== 0) { //  not None

          $(buttonNames[i]).addClass("ui-opaque");
        } else {
          $(buttonNames[i]).addClass("ui-grayed-out");
        }
        $(textFields[i]).val(worm.toText());
        var startingPoint = ((darworms.dwsettings.fixedInitPos == 1) ? darworms.theGame.origin :
           new Point ((Math.floor(Math.random() * darworms.theGame.grid.width)),
         (Math.floor(Math.random() * darworms.theGame.grid.height))));


        worm.place(initialWormStates[playerTypes[i]], darworms.theGame,
          startingPoint);
          if (playerTypes[i] !== 0) { //  not None
              darworms.theGame.grid.setSinkAt(startingPoint);
          }
      })
    }
    darworms.gameModule.updateScores();
    if (startNow === false) return;
    console.log(" NEW in startgame darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);
    if (darworms.theGame.gameState === darworms.gameStates.running) {
      // This is now a pause game button
      // clearInterval(darworms.graphics.timer);
      // document.getElementById("startpause").innerHTML = "Resume Game";
      $("#startpause").text("Resume Game");
      darworms.theGame.gameState = darworms.gameStates.paused;
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
      darworms.theGame.clearCanvas();
      darworms.theGame.drawCells();

      console.log(" Game Running");
      $("#startpause").text("Running");
     /*  busy loop maling moves.  Freezes the javascript engine
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
      darworms.theGame.drawCells();
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
      setTypes();
      setupRadioButtons();
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
          darworms.gameModule.makeMoves();
          darworms.graphics.then = darworms.graphics.now -
            (darworms.graphics.elapsed % darworms.graphics.frameInterval)
        }

      }  else {
          var nMoves = 0;
          while ((nMoves < 50)  &&  (darworms.theGame.gameState != darworms.gameStates.over) &&
        (darworms.theGame.gameState !== darworms.gameStates.waiting)) {
            nMoves = nMoves + 1;;
            darworms.gameModule.makeMoves();
          }
          darworms.gameModule.updateScores();
          darworms.theGame.drawDirtyCells();
          console.log(".");
      }

    }
    if (darworms.theGame.gameState === darworms.gameStates.animToUI ||
      darworms.theGame.gameState === darworms.gameStates.animFromUI) {
      darworms.theGame.animIn(darworms.theGame.gameState);
    }

    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      darworms.graphics.now = Date.now();
      darworms.graphics.uiElapsed = darworms.graphics.now - darworms.graphics.uiThen;
      if (darworms.graphics.uiElapsed > darworms.graphics.uiInterval) {
        if (darworms.dwsettings.panToSelectionUI == 1) {
          darworms.theGame.drawSelectCell(true)
        } else {
          darworms.theGame.drawPickCells();
          // darworms.theGame.drawSelectCell(false);
        }
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
      $(textFields[i]).val(worm.toText());
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
    var sc = $('#scorecanvas');
    var nc = $('#navcontainer');
    var w = $(window).width();
    var h = $(window).height();

    if (h > 400) {
      xc.css({
        width: w - 20 + 'px',
        height: h - 130 + 'px'
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
    if ($('#debug').slider().val() === "1") {
      alert(" Resize " + w + " x " + h + " debug " + $('#debug').slider().val() + "arg " + nw);
    }
    if (darworms.theGame) {
      darworms.theGame.reScale();
    }
  }
  var initPlayPage = function() {
    if (!darworms.playpageInitialized) {
      darworms.startgame(false);
      darworms.audioContext.resume();
      darworms.playpageInitialized = true;
      resizeCanvas();
    }
    $("body").css("scroll", "on");
    $("body").css("overflow", "hidden");
  }

  var leavePlayPage = function() {
      $("body").css("scroll", "auto");
      $("body").css("overflow", "auto");
  }

  var loadAudio = function() {
    darworms.audioContext;

    // Create Smart Audio Container
    if (typeof AudioContext !== "undefined") {
      darworms.audioContext = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
      darworms.audioContext = new webkitAudioContext();
    } else {
      darworms.dwsettings.doAudio = false;
      alert(" Could not load webAudio... muting game");
      $('#doAudio').hide();
    }

    if (darworms.dwsettings.doAudio) {
      if (darworms.audioContext.createGain !== undefined) {
        darworms.masterGainNode = darworms.audioContext.createGain(0.5);
      }
      if (darworms.audioContext.createStereoPanner  !== undefined) {
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
      new AudioSample("death", "sounds/death.wav");

    }
    var twelfrootoftwo = 1.05946309436;
    var noteRate = 0.5; // lowest note
    var noteFrequency = 261.626;
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
    darworms.wCanvasPixelDim = new Point(1, 1);
    // window.onresize = doReSize;
    // doReSize();

    darworms.main.wCanvas = document.getElementById("wcanvas");
    darworms.main.wGraphics = darworms.main.wCanvas.getContext("2d");
    // console.log ( " init wGraphics " + darworms.main.wGraphics);
    $('#wcanvas').bind('tap', wormEventHandler);
    // $('#wcanvas').on("tap", wormEventHandler);
    // $('#wcanvas').bind('vmousedown', wormEventHandler);
    $('#panToSelectionUI').slider().val(0);
    $('#panToSelectionUI').slider("refresh");

    // this should depend on scale factor.  On small screens
    // we cshould set pickDirectionUI to true
    $('#pickDirectionUI').slider().val(0);
    $('#pickDirectionUI').slider("refresh");


    darworms.wCanvasRef = $('#wcanvas');

    initGlobals();

    loadAudio();

    setTypes();

    applySettings();


    darworms.dwsettings.scoreCanvas = document.getElementById("scorecanvas");
    darworms.gameModule.init(); // needed to init local data in the gameModule closure
    //  These values are needed by both mainModule and gameModule
    //  so for now we keep them as globals
    //  Perhaps the time routines should all be moved into the gameModule closure
    // and we can make some or all of these private to the gameModule closure
    // darworms.theGame = new darworms.gameModule.Game ( darworms.dwsettings.initialGridSize, darworms.dwsettings.initialGridSize);
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
    $(window).bind('resize orientationchange', function(event) {
      window.scrollTo(1, 0);
      resizeCanvas();
      var heightSlider = Math.floor($("#gridsize").val());
      if ((heightSlider & 1) !== 0) {
        // height must be an even number because of toroid shape
        heightSlider = heightSlider + 1;
      }
      darworms.gameModule.reScale(heightSlider, heightSlider);
    });

    gWorms.forEach(function(worm, i) {
      worm.setNotes(0);
    })
    resizeCanvas();
    $("input[name='red-radio-choice']").on("change", function() {
      console.log(" red-radio-choice on change function")
      var type = ($("input[name='red-radio-choice']:checked").val());
      gWorms[0].init(typeFromName(type));
      $(textFields[0]).val(typeFromName(type) == 0 ? "" : gWorms[0].name);

    });
    $("input[name='green-radio-choice']").on("change", function() {
      console.log(" green-radio-choice on change function")
      var type = ($("input[name='green-radio-choice']:checked").val());
      gWorms[1].init(typeFromName(type));
      $(textFields[1]).val(typeFromName(type) == 0 ? "" : gWorms[1].name);

    });
    $("input[name='blue-radio-choice']").on("change", function() {
      console.log(" blue-radio-choice on change function")
      var type = ($("input[name='blue-radio-choice']:checked").val());
      gWorms[2].init(typeFromName(type));
      $(textFields[2]).val(typeFromName(type) == 0 ? "" : gWorms[2].name);

    });
    $("input[name='yellow-radio-choice']").on("change", function() {
      console.log(" yellow-radio-choice on change function")
      var type = ($("input[name='yellow-radio-choice']:checked").val());
      gWorms[3].init(typeFromName(type));
      $(textFields[3]).val(typeFromName(type) == 0 ? "" : gWorms[3].name);

    });
    //  These four handlers should be combined into one parameterized one or
    //  generated closures for each one
    $("input[name='red-textname']").on("change", function() {
      console.log(" red-textname")
      var dnastring = ($("input[name='red-textname']").val());
      var regx = /^[ABCDEF\?]{63}X$/;
      if (regx.test(dnastring)) {
        if (gWorms[0].fromText(dnastring)) {
          gWorms[0].wType = 2; // Same
          playerTypes[0] = 2;
          setupRadioButtons();


          $("#p1button").text(typeNames[playerTypes[0]]);
          $("#p1Lbutton").text(typeNames[playerTypes[0]]);
          gWorms[0].toText();
          $("input[name='red-textname']").textinput({
            theme: "c"
          });
        };
      } else {
        $("input[name='red-textname']").textinput({
          theme: "a"
        });
      }
    });
    $("input[name='green-textname']").on("change", function() {
      console.log(" green-textname")
      var dnastring = ($("input[name='green-textname']").val());
      var regx = /^[ABCDEF\?]{63}X$/;
      if (regx.test(dnastring)) {
        if (gWorms[1].fromText(dnastring)) {
          gWorms[1].wType = 2; // Same
          playerTypes[1] = 2;
          setupRadioButtons();


          $("#p2button").text(typeNames[playerTypes[1]]);
          $("#p2Lbutton").text(typeNames[playerTypes[1]]);
          gWorms[1].toText();
          $("input[name='green-textname']").textinput({
            theme: "d"
          });
        };
      } else {
        $("input[name='green-textname']").textinput({
          theme: "a"
        });
      }
    });
    $("input[name='blue-textname']").on("change", function() {
      console.log(" blue-textname")
      var dnastring = ($("input[name='blue-textname']").val());
      var regx = /^[ABCDEF\?]{63}X$/;
      if (regx.test(dnastring)) {
        if (gWorms[2].fromText(dnastring)) {
          gWorms[2].wType = 2; // Same
          playerTypes[2] = 2;
          setupRadioButtons();


          $("#p3button").text(typeNames[playerTypes[2]]);
          $("#p3Lbutton").text(typeNames[playerTypes[2]]);
          gWorms[2].toText();
          $("input[name='blue-textname']").textinput({
            theme: "e"
          });
        };
      } else {
        $("input[name='green-textname']").textinput({
          theme: "a"
        });
      }
    });
    $("input[name='yellow-textname']").on("change", function() {
      console.log(" yellow-textname")
      var dnastring = ($("input[name='yellow-textname']").val());
      var regx = /^[ABCDEF\?]{63}X$/;
      if (regx.test(dnastring)) {
        if (gWorms[3].fromText(dnastring)) {
          gWorms[3].wType = 2; // Same
          playerTypes[3] = 2;
          setupRadioButtons();


          $("#p4button").text(typeNames[playerTypes[2]]);
          $("#p4Lbutton").text(typeNames[playerTypes[2]]);
          gWorms[2].toText();
          $("input[name='yellow-textname']").textinput({
            theme: "f"
          });
        };
      } else {
        $("input[name='green-textname']").textinput({
          theme: "a"
        });
      }
    });
    $("input[name='select-native-key-red']").on("change", function() {
      console.log(" select-key-red")

    });
  }

  return {
    init: init,

    setSelectedDarwormType: setSelectedDarwormType,
    setupRadioButtons: setupRadioButtons,
    applySettings: applySettings,
    showSettings: showSettings,
    setupGridGeometry: setupGridGeometry,
    initPlayPage: initPlayPage,
    leavePlayPage: leavePlayPage,
    wormEventHandler: wormEventHandler

  };

})();
/* end of Game */
