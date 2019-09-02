//  main.js
// Darworms   (c) 2018  David S, Maynard
import {
  darworms
} from "./loader.js";
import AudioSample from "./AudioSample.js";
import {
  Point
} from "./Point.js";
import "./Grid.js";
import {
  Worm,
  musicalkeys,
  dnaregx
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
  clearCanvas,
  setGrid,
  setScale,
  resizeCanvas,
  addSprite,
  clearSprites,
  animateSprites
} from "./graphics.js";
import {
  scoreCanvasInit
} from "./scorecanvas.js";
import {
  emailGame,
  saveGame,
  loadGames,
  freeGames
} from "./gameio.js"
import {
  log,
  logging
} from "./utils.js"
/*
  <script src="scripts/loader.js"></script>
  <script src="scripts/AudioSample.js"></script>
  <script src="scripts/Point.js"></script>
  <script src="scripts/Grid.js"></script>
  <script src="scripts/Worm.js"Games></script>
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
  var typeNames = [" None ", "Random", " Same ", " New  ", "Smart"];
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
      setTypeRadioButton();
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
    sendAnalytics();
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
  var sendAnalytics = function() {
    try {


      hash = location.hash;

      if (hash) {
        ga('send', 'pageview', hash);
      } else {
        ga('send', 'pageview');
      }
    } catch (err) {
      if (logging()) console.log(err.message);
    }
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

    $('#fps').val(darworms.graphics.fps).slider("refresh");

    $('#gridsize').val(darworms.dwsettings.gridSize).slider("refresh");
    $('#').val(darworms.dwsettings.backGroundTheme).slider("refresh");
    $('#scrnsvr').val(darworms.dwsettings.screenSaver ? "1" : "0").slider("refresh");
    $('#doanim').val(darworms.dwsettings.doAnimations).slider("refresh");
    $('#audioon').val(darworms.dwsettings.doAudio).slider("refresh");
    $('#fixedinitpos').val(darworms.dwsettings.fixedInitPos).slider("refresh");

    $('#pickDirectionUI').val(darworms.dwsettings.pickDirectionUI).slider("refresh");

    sendAnalytics();
    $('#myPages').css({
      overflow: 'scroll',
    });

  }

  var applySettings = function() {
    var newGridSize = parseInt($('#gridsize').val());
    if (newGridSize !== darworms.dwsettings.gridSize) {
      darworms.dwsettings.gridSize = newGridSize;
      try {
        ga('send', 'event', 'gridSize', newGridSize)
      } catch (err) {}
    }
    var newFps = parseInt($("#fps").val());
    if (newFps !== darworms.graphics.fps) {
      darworms.graphics.fps = newFps;
      try {
        ga('send', 'event', 'fps', newFps)
      } catch (err) {}
    }
    darworms.graphics.frameInterval = 1000 / darworms.graphics.fps;
    darworms.dwsettings.gridGeometry = $('input[name=geometry-radio-choice]:checked').val();
    if (darworms.dwsettings.backGroundTheme !== $('#backg').slider().val()) {
      darworms.dwsettings.backGroundTheme = $('#backg').slider().val();
      if (darworms.theGame) {
        clearCanvas();
        drawCells();
      }
      try {
        ga('send', 'event', 'background', darworms.dwsettings.backGroundTheme);
      } catch (err) {};
    }
    if (darworms.dwsettings.screenSaver !== parseInt($('#scrnsvr').slider().val())) {
      darworms.dwsettings.screenSaver = parseInt($('#scrnsvr').slider().val());

      if (darworms.dwsettings.screenSaver) {
        $("#startpause").text("Start Screen Saver");
      }

      try {
        ga('send', 'event', 'screensaver', darworms.dwsettings.screenSaver);
      } catch (err) {};
    }

    darworms.dwsettings.doAnimations = $('#doanim').slider().val() == "true" ? true : false;
    darworms.dwsettings.doAudio = $('#audioon').slider().val() == "1" ? 1 : 0;;
    darworms.dwsettings.fixedInitPos = $('#fixedinitpos').slider().val() == "1" ? 1 : 0;;
    darworms.dwsettings.pickDirectionUI = $('#pickDirectionUI').slider().val() == "1" ? 1 : 0;

    if (logging()) console.log(" darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);
    if (logging()) console.log(" darworms.dwsettings.doAudio " + darworms.dwsettings.doAudio);
    darworms.dwsettings.masterAudioVolume = $("#audiovol").val() / 100;

    if (logging()) console.log(" darworms.dwsettings.masterAudioVolume " + darworms.dwsettings.masterAudioVolume);
  }

  var injectSettings = function(gameTxt) {
    try {
      var gameObj = JSON.parse(gameTxt);
      var nPlayers = 0;
      darworms.dwsettings.gridGeometry = gameObj.gridGeometry;
      if (darworms.dwsettings.backGroundTheme !== gameObj.backGroundTheme) {
        darworms.dwsettings.backGroundTheme = gameObj.backGroundTheme;
        if (darworms.theGame) {
          clearCanvas();
          drawCells();
        }
      }
      darworms.dwsettings.doAnimations = gameObj.doAnimations;
      darworms.dwsettings.doAudio = gameObj.doAudio;
      darworms.dwsettings.fixedInitPos = gameObj.fixedInitPos;

      darworms.dwsettings.pickDirectionUI = gameObj.pickDirectionUI;
      darworms.dwsettings.masterAudioVolume = gameObj.masterAudioVolume
      darworms.graphics.fps = gameObj.fps;
      darworms.graphics.frameInterval = 1000 / darworms.graphics.fps;
      darworms.dwsettings.gridSize = gameObj.width;


      gameObj.players.forEach(function(aworm) {
        var i = aworm.index;
        gWorms[i].name = aworm.name;

        //  decode  tyename therefore

        if (dnaregx.test(gWorms[i].name)) {
          if (!gWorms[i].fromText(gWorms[i].name)) {
            alert("Invalid DNA for Daworm # " + (i + 1) + " ");
            gWorms[i].wType = 0;
          };

        }
        (gWorms[i].fromText(aworm.name))
        gWorms[i].wType = aworm.typeName == " None " ? 0 : 2;
        nPlayers += aworm.typeName == " None " ? 0 : 1;
        playerTypes[i] = gWorms[i].wType
        gWorms[i].score = aworm.score;
        gWorms[i].instrument = aworm.instrument;
        gWorms[i].setNotes(aworm.instrument);
        gWorms[i].musickeyName = aworm.musickeyName;
        gWorms[i].MusicScale = aworm.MusicScale;

      });
      try {
        ga('send', 'event', 'loadGame', ((nPlayers * 100) + gameObj.width));
      } catch (err) {}
      return gameObj;
    } catch (err) {
      alert(' Error parsing gameTxt:' + err.message);
      return null;
    };

  }

  var setupGridGeometry = function() {
    if (logging()) console.log(" pagebeforeshow setupGridGeometry ");
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


  /* The following code is called from the game timer */

  var updateGameState = function() {
    // This is the game loop
    // Called from timer (should be the requestAnimation timer)
    // We either make one round of moves
    // or if we are waiting for user input
    // and we draw the direction selection screen
    //
    // if(logging()) console.log(" updateGameState: gameState " +  gameStateNames[theGame.gameState]);
    // if(logging()) console.log("R");
    darworms.graphics.animFrame = darworms.graphics.animFrame + 1;
    if (darworms.theGame.gameState === darworms.gameStates.running) {
      // if(logging()) console.log("R");
      if (darworms.dwsettings.doAnimations) makeMoves();

    }
    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      // if(logging()) console.log("w");
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

    // if (logging()) console.log(" Tap Event at x: " + touchX + " y: " + touchY);
    // if(logging()) console.log(" wcanvas css   width " + $('#wcanvas').width() + " css   height " + $('#wcanvas').height());
    // log (" wcanvas coord width " + wCanvas.width + " coord height "  + wCanvas.height  );
    if (darworms.theGame.gameState === darworms.gameStates.waiting) {
      selectDirection(new Point(touchX, touchY));
    }
  };
  darworms.menuButton = function() {
    if (logging()) console.log(" menuButton");
    if (darworms.theGame.gameState && ((darworms.theGame.gameState == darworms.gameStates.running) ||
        (darworms.theGame.gameState == darworms.gameStates.paused))) {
      darworms.theGame.gameState = darworms.gameStates.paused;
      $.mobile.changePage("#settingspage");
      darworms.theGame.needsRedraw = true;
      drawCells();
      $("#startpause").text((darworms.dwsettings.screenSaver == 1) ? "Resume Screen Saver" : "Resume Game");
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
      try {
        ga('send', 'event', 'musickey', selectedKeyInput.val());
      } catch (err) {}

    }
  }
  darworms.setInstrumentVal = function(index) {
    var selectedInstrumentInput = $('#select-instrument-dropdown');
    if (selectedInstrumentInput.length == 1) {
      var instrument = parseInt(selectedInstrumentInput.val());
      gWorms[darworms.selectedIdx].setNotes(instrument);
      try {
        ga('send', 'event', 'instrument', darworms.audiosamplefiles[instrument][0]);
      } catch (err) {}

    }
  }
  darworms.sendemail = function() {
    if (logging()) console.log(" sendEMail " + darworms.gameTxt);
    emailGame(darworms.gameTxt);
    try {
      ga('send', 'event', 'emailGame');
    } catch (err) {}
  }

  darworms.saveGame = function() {
    if (logging()) console.log(" saveGame ");
    saveGame(darworms.gameTxt);
  }

  darworms.startgame = function(startNow) {
    if (startNow === undefined) {
      startNow = ( darworms.dwsettings.screenSaver == 1);
    }
    if (logging()) console.log(" Startgame start now = " + startNow);
    if (darworms.theGame) {
      if (logging()) console.log("GameState is " +
        darworms.theGame.gameState + (darworms.gameStateNames[darworms.theGame.gameState]));
    }
    // wCanvas.width = $('#wcanvas').width();
    // wCanvas.height = $('#wcanvas').height(); // make it square
    darworms.dwsettings.isLargeScreen = wCanvas.width >= darworms.dwsettings.minLargeScreenWidth;
    var curScreen = new Point(wCanvas.width, wCanvas.height);
    darworms.wCanvasPixelDim = curScreen;

    if (darworms.theGame === undefined || darworms.theGame === null || darworms.theGame.grid.height != darworms.dwsettings.gridSize ||
      !(darworms.wCanvasPixelDim.isEqualTo(curScreen))) {
      if (logging()) console.log(" theGame size has changed Screen is" + curScreen.format() + " grid = " + darworms.dwsettings.gridSize + " x " +
        darworms.dwsettings.gridSize);
      if ((darworms.dwsettings.gridSize & 1) !== 0) {
        // height must be an even number because of toroid shape
        darworms.dwsettings.gridSize = darworms.dwsettings.gridSize + 1;
      }

      if ($('#debug').slider().val() === 1) {
        alert(" wCanvas " + wCanvas.width + " x " + wCanvas.height +
          " css " + $('#wcanvas').width() + " x " + $('#wcanvas').height() +
          " window " + window.innerWidth + " x " + window.innerHeight);
      }
      darworms.theGame = new Game(darworms.dwsettings.gridSize, darworms.dwsettings.gridSize);
    }
    if (darworms.theGame.gameState === darworms.gameStates.over) {
      darworms.theGame.initGame();
      $("#startpause").text((darworms.dwsettings.screenSaver === 0) ? "Start Game" : "Start Screen Saver");

      darworms.theGame.needsRedraw = true;
      drawCells();
      darworms.theGame.worms = gWorms;
      if (logging()) console.log(" init gridsize: " + $("#gridsize").val() + " gHeight" + darworms.dwsettings.gridSize);

      gWorms.forEach(function(worm, i) {
        if (darworms.dwsettings.screenSaver) {
          if (playerTypes[i] == 2 || playerTypes[i] == 3) { // New or Same
            playerTypes[i] = 4; // make worms smart for screensave mode
          }
        }
        worm.init(playerTypes[i]);
        if (playerTypes[i] !== 0) { //  not None

          $(buttonNames[i]).addClass("ui-opaque");
        } else {
          $(buttonNames[i]).addClass("ui-grayed-out");
        }
        // $(textFields[i]).val(worm.toText());
        var startingPoint = ((darworms.dwsettings.fixedInitPos == 1) ? darworms.theGame.origin :
          (playerTypes[i] == 2) ? worm.startingPos : // Same
          new Point((Math.floor(Math.random() * darworms.theGame.grid.width)),
            (Math.floor(Math.random() * darworms.theGame.grid.height))));


        worm.place(darworms.initialWormStates[playerTypes[i]], darworms.theGame,
          startingPoint);
        if (playerTypes[i] !== 0) { //  not None
          darworms.theGame.grid.setSinkAt(startingPoint);
        }
      })
    }
    setButtonNames();
    if (startNow === false) return;
    updateScores(gWorms);
    if (logging()) console.log(" NEW in startgame darworms.dwsettings.doAnimations " + darworms.dwsettings.doAnimations);
    if (darworms.theGame.gameState === darworms.gameStates.running) {
      // This is now a pause game button
      $("#startpause").text((darworms.dwsettings.screenSaver == 1) ? "Resume Screen Saver" : "Resume Game");
      darworms.theGame.gameState = darworms.gameStates.paused;
      darworms.theGame.needsRedraw = true;
      drawCells();
      return;
    }
    if (darworms.theGame.gameState === darworms.gameStates.paused) {
      // This is now a start game button
      $("#startpause").text((darworms.dwsettings.screenSaver == 1) ? "Pause Screen Saver" : "Pause Game");
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
      var animFramesPerSec = darworms.dwsettings.doAnimations ? darworms.graphics.fps : 60;
      startGameLoop(animFramesPerSec);
      if (logging()) console.log(" setInterval: " + 1000 / $("#fps").val());
      // document.getElementById("startpause").innerHTML = "Pause Game";
      $("#startpause").text((darworms.dwsettings.screenSaver == 1) ? "Pause Screen Saver" : "Pause Game");      
      initTheGame(true);
      darworms.theGame.logGame();
    }
    if (!darworms.dwsettings.doAnimations) {
      // run game loop inline and draw after game is over
      //  No.  This locks the browser.  We must put it inside the the
      // animation request and do a set of moves each animframe and draw the
      // playfield
      if (logging()) console.log('darworms.dwsettings.doAnimations == "false"')
      darworms.theGame.gameState = darworms.gameStates.running;
      clearCanvas();
      drawCells();

      if (logging()) console.log(" Game Running");
      $("#startpause").text("Running");
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
        if ((worm.wType == 3) || (worm.wType == 4)) { //  new or smart
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
          clearSprites();
          makeMoves();
          darworms.graphics.then = darworms.graphics.now -
            (darworms.graphics.elapsed % darworms.graphics.frameInterval)
        } else {
          //   animations only no game state changedTouches
          animateSprites(darworms.graphics.now);
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
        if (logging()) console.log("Compute time: " + (Date.now() - startTime));
        updateScores(darworms.theGame.worms);
        clearSprites();
        if (logging()) console.log("Draw time: " + (Date.now() - startTime));

        if (logging()) console.log(".");
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
    //     if(logging()) console.log("Date.now() " + Date.now());
    // }
  }

  darworms.disableTutorialPopup = function() {
    darworms.theGame.focusWorm.showTutorial = false;
    // Analytics for how many times tutorial popup was shown
    try {
      ga('send', 'event', 'disableTutorial', darworms.theGame.focusWorm.tutorialCount);
    } catch (err) {}
    $("#tutorialpopup").popup("close");
  }

  darworms.abortgame = function() {
    if (logging()) console.log("Abort Game called");
    $.mobile.changePage('#abortdialog', 'pop', true, true);
    // $("#lnkDialog").click();

  }
  darworms.emailDarwormButton = function(index) {
    if (logging()) console.log("emailDarwormButton called");
    gWorms[darworms.selectedIdx].emailDarworm();
  }

  darworms.playScale = function(index) {
    if (logging()) console.log("playScale called");
    gWorms[darworms.selectedIdx].playScale();
  }

  darworms.completeTrainingAI = function(index) {
    if (logging()) console.log(" completeTrainingAI ");
    gWorms[darworms.selectedIdx].completeDarwormAI();
    gWorms[darworms.selectedIdx].toText();
    $('#edittextfield').val(gWorms[darworms.selectedIdx].wType == 0 ? "" : gWorms[darworms.selectedIdx].name);
    $('#completeButton').hide();
    $('#darwormdeflabel').text(wdescription(gWorms[darworms.selectedIdx]));
    gWorms[darworms.selectedIdx].wType = 2; //SAME
    playerTypes[darworms.selectedIdx] = 2; //same
  }
  darworms.completeTrainingRand = function(index) {
    if (logging()) console.log(" completeTrainingAI ");
    gWorms[darworms.selectedIdx].completeDarwormRand();
    gWorms[darworms.selectedIdx].toText();
    $('#edittextfield').val(gWorms[darworms.selectedIdx].wType == 0 ? "" : gWorms[darworms.selectedIdx].name);
    $('#completeButton').hide();
    $('#darwormdeflabel').text(wdescription(gWorms[darworms.selectedIdx]));
    gWorms[darworms.selectedIdx].wType = 2; //SAME
    playerTypes[darworms.selectedIdx] = 2; //same
  }
  darworms.yesabortgame = function() {
    if (logging()) console.log("Abort Game called");
    $.mobile.changePage('#playpage');
    darworms.theGame.gameState = darworms.gameStates.over;
    darworms.startgame(false);
    // $("#lnkDialog").click();

  }

  darworms.noabortgame = function() {
    if (logging()) console.log("Abort Game called");
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

  var initPlayPage = function() {
    var mainbody = $('#myPages');
    mainbody.css({
      overflow: 'hidden',
      //  height: '100%'
    });
    $('#wcanvasparagrap').css({

      background: darworms.dwsettings.cellBackground[darworms.dwsettings.backGroundTheme]

    });

    if (darworms.theGame === undefined || darworms.theGame === null || darworms.theGame.grid.height != darworms.dwsettings.gridSize) {
      darworms.theGame = new Game(darworms.dwsettings.gridSize, darworms.dwsettings.gridSize);
      setGrid(darworms.theGame.grid, darworms.theGame)
    }
    setButtonNames();
    drawCells();
    updateScores(darworms.main.gWorms);
    if (!darworms.playpageInitialized) {
      resizeCanvas();
      darworms.startgame(darworms.dwsettings.screenSaver == 1);
      darworms.audioContext.resume();
      darworms.playpageInitialized = true;
    }
    sendAnalytics();
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
    $("body").css("overflow", "scroll");
  }
  var swapTheme = function(selector, newTheme) {
    //  needed because JQuery Mobile only adds additional themes
    // note we could add a hash table to keep tutorialCheckbox// previously added themes
    selector.removeClass('ui-page-theme-c');
    selector.removeClass('ui-page-theme-d');
    selector.removeClass('ui-page-theme-e');
    selector.removeClass('ui-page-theme-f');
    selector.page("option", "theme", newTheme);
  }
  var setTypeRadioButton = function() {
    var darwormType = playerTypes[darworms.selectedIdx];
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
      case 4:
        $('#' + 'edit' + '-radio-choice-5').prop("checked", true).checkboxradio("refresh");
        break;
    }
  }
  var initEditPage = function(foo) {
    // $('#edit-darworm-page').hide();
    if (logging()) console.log(" initEditPage " + darworms.selectedIdx)
    swapTheme($('#edit-darworm-page'), darworms.themes[darworms.selectedIdx]);
    $("input[name='edit-textname']").textinput({
      theme: darworms.themes[darworms.selectedIdx]
    });
    setTypeRadioButton();
    $('#edittextfield').val(gWorms[darworms.selectedIdx].wType == 0 ? "" : gWorms[darworms.selectedIdx].name);
    // $('#edit-darworm-page').page.refresh();

    $('[name=select-instrument]').val(gWorms[darworms.selectedIdx].instrument);
    $('[name=select-instrument]').selectmenu("refresh");

    $('[name=select-key]').val(gWorms[darworms.selectedIdx].musickeyName);
    $('[name=select-key]').selectmenu("refresh");
    // $('[name=select-instrument]').refresh();
    $('#edit-darworm-page').trigger("create");
    if (gWorms[darworms.selectedIdx].wType == 0) {
      $('#darwormdeflabel').text('Darworm DNA');
    } else {
      var nGenes = gWorms[darworms.selectedIdx].getNumGenes(darworms.dwsettings.codons.unSet);
      $('#darwormdeflabel').text(wdescription(gWorms[darworms.selectedIdx]));
      if (nGenes > 0) {
        $('#completeButton').show();

      } else {
        $('#completeButton').hide();
      }
    }
    // $('#edit-darworm-page').show();

    sendAnalytics();
    // $('#edit-darworm-page').page.refresh();
    // $("#edit-darworm-page").show();
  }
  var mainbody = $('#myPages');
  mainbody.css({
    overflow: 'scroll',
  });

  var leaveEditPage = function(foo) {
    if (logging()) console.log(" leaveEditPage " + foo)
    // $("#edit-darworm-page").hide();
  }

  var revealEditPage = function(foo) {
    //$('#edit-darworm-page').hide();
    if (logging()) console.log(" leaveEditPage " + foo)
    // $("#edit-darworm-page").show();
  }


  var loadSavedGames = function() {
    if (logging()) console.log(" loadSavedGames ");
    loadGames();
    sendAnalytics();
  }

  var freeSavedGames = function() {
    if (logging()) console.log(" freeSavedGames ");
    freeGames();
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
    if (logging()) console.log("audio is " + darworms.dwsettings.doAudio + "  Context state is " + darworms.audioContext.state);

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


      new AudioSample("piano", "sounds/piano-c2.wav");
      new AudioSample("guitar", "sounds/GuitarTrimmed.wav");
      new AudioSample("kalimba", "sounds/i_kalimba_c5.wav");
      new AudioSample("sitar", "sounds/Sitar-C5.wav");
      new AudioSample("flute", "sounds/FluteC3Trimmed.wav");
      new AudioSample("clarinet", "sounds/Roland-SC-88-Kalimba-C5.wav");
      new AudioSample("death", "sounds/darworm-death.wav");
      */
      var selectdropdown = $('#select-instrument-dropdown');
      darworms.audiosamplefiles.forEach(function(file, index) {
        new AudioSample(file[0], file[1]);
        var optionTemplate = '<option value="' + index + '">' + file[0] + '</option>';
        selectdropdown.append(optionTemplate);
        selectdropdown.selectmenu();
        selectdropdown.selectmenu('refresh', true);
      });

      var keydropdown = $('#select-native-key');
      Object.keys(musicalkeys).forEach(key => {
        var optionTemplate = '<option value="' + key + '">' + key + '</option>';
        keydropdown.append(optionTemplate);
        keydropdown.selectmenu();
        keydropdown.selectmenu('refresh', true);

      })

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
    if (logging()) console.log("Final rate = " + darworms.audioPlaybackRates[12] + "  error: " +
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

  }

  var wdescription = function(worm) {
    var unSet = worm.getNumGenes(darworms.dwsettings.codons.unSet);
    var ai = worm.getNumGenes(darworms.dwsettings.codons.smart);
    var set = 64 - (unSet + ai);
    return ('Darworm DNA: ' +
      unSet + ' untrained ' +
      set + ' trained ' +
      ai + ' awaiting ai ');
  }

  var typeFromName = function(name) {
    switch (name) {
      case "none":
        return 0;
        break;
      case "smart":
        return 4;
        break
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
    if (logging()) console.log("development mode: " + darworms.dwsettings.dologging);
    if (logging()) console.log("width: " + $(window).width());
    $("#logging").slider().val(darworms.dwsettings.dologging ? "true" : "false");
    $('#versionstring')[0].innerHTML = "Version " + darworms.version;
    var when;
    try {
      when = new Date(darworms.builddate);
    } catch (err) {
      when = Date.now();
    }
    $('#builddate')[0].innerHTML = when.toString();
    // See if the url constains an encoded game
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (logging()) console.log(location.search);
      if (urlParams.has('darwormsgame')) {
        darworms.gameTxt = decodeURIComponent(urlParams.get('darwormsgame'));
        if (darworms.gameTxt) {
          injectSettings(darworms.gameTxt);
          //  go to Playpage here ?
          scoreCanvasInit();
          updateScores(gWorms);
          $.mobile.changePage('#playpage');
          darworms.dwsettings.forceInitialGridSize = false;
          try {
            ga('send', 'event', 'urlGame');
          } catch (err) {}
        }
      }
    } catch (err) {
      alert("Trouble parsing the url. Be sure to copy and paste the entire url starting with 'https' all way through to the lst '}' \n" + err.message);
    };
    graphicsInit();
    darworms.dwsettings.isLargeScreen = $(window).width() >= darworms.dwsettings.minLargeScreenWidth;
    darworms.dwsettings.isTinyScreen = $(window).width() < darworms.dwsettings.maxSmallSreenWidth;
    if (darworms.dwsettings.forceInitialGridSize) {
      darworms.dwsettings.gridSize = darworms.dwsettings.isLargeScreen ?
        darworms.dwsettings.largeGridSize :
        darworms.dwsettings.isTinyScreen ?
        darworms.dwsettings.tinyGridSize :
        darworms.dwsettings.smallGridSize;
    }

    darworms.wCanvasPixelDim = new Point(wCanvas.clientWidth, wCanvas.clientHeight); // log ( " init wGraphics " + darworms.main.wGraphics);
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

    // applySettings();



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
        if (logging()) console.log("load event listener triggered");
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
      if (logging()) console.log("resize event triggered");
      if (darworms.theGame) {
        clearCanvas();
      }
      resizeCanvas();

      if (darworms.theGame) {
        reScale(darworms.theGame.grid.width, darworms.theGame.grid.height);
      }
    });

    gWorms.forEach(function(worm, i) {
      worm.setNotes(worm.instrument || 0);
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
      if (logging()) console.log(" nextbutton clicked");
      //$.mobile.changePage("#edit-darworm-page", {
      //  allowSamePageTransition: true
      //  });
      darworms.selectedIdx = ((darworms.selectedIdx + 1) % gWorms.length);
      initEditPage(darworms.selectedIdx);
      // $.mobile.changePage( "#edit-darworm-page", { allowSamePageTransition: true } );
    });
    $("input[name='edit-radio-choice']").on("change", function() {
      if (logging()) console.log(" edit-radio-choice on change function");
      var type = ($("input[name='edit-radio-choice']:checked").val());
      playerTypes[darworms.selectedIdx] = typeFromName(type);
      gWorms[darworms.selectedIdx].wType = playerTypes[darworms.selectedIdx];
      gWorms[darworms.selectedIdx].init(typeFromName(type));
      $('#edittextfield').val(typeFromName(type) == 0 ? "" : gWorms[darworms.selectedIdx].name);
      if (gWorms[darworms.selectedIdx].wType == 0) {
        $('#darwormdeflabel').text('Darworm DNA');
        $('#completeButton').hide();
      } else {
        var nUntrained = gWorms[darworms.selectedIdx].getNumGenes(darworms.dwsettings.codons.unSet);
        $('#darwormdeflabel').text(gWorms[darworms.selectedIdx].wdescription);
        $('#darwormdeflabel').text(wdescription(gWorms[darworms.selectedIdx]));
        if (nUntrained > 0) {
          $('#completeButton').show()
        } else {
          $('#completeButton').hide()
        }
      }
      try {
        ga('send', 'event', 'wType', type, darworms.selectedIdx)
      } catch (err) {}
    });

    $("input[name='edit-textname']").on("change", function() {
      if (logging()) console.log(" edit-textname")
      var dnastring = ($("input[name='edit-textname']").val());
      if (dnaregx.test(dnastring)) {
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
    gWorms: gWorms,
    setSelectedDarwormType: setSelectedDarwormType,
    setupEditPage: setupEditPage,
    applySettings: applySettings,
    injectSettings: injectSettings,
    showSettings: showSettings,
    setupGridGeometry: setupGridGeometry,
    initPlayPage: initPlayPage,
    leavePlayPage: leavePlayPage,
    wormEventHandler: wormEventHandler,
    initEditPage: initEditPage,
    leaveEditPage: leaveEditPage,
    revealEditPage: revealEditPage,
    loadSavedGames: loadSavedGames,
    freeSavedGames: freeSavedGames,
    sendAnalytics: sendAnalytics


  };

})();
/* end of Game */
