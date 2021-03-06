// gameio.js
import {
  updateScores
} from "./scorecanvas.js";
import {
  log,
  logging
} from "./utils.js"



let jsongame = {

}

let dworm = {
  name: "",
  index: 0,
}

let gameObj = {};
let gameTxt = "";
let gameUrl = "";


function pick(o, ...fields) {
  return fields.reduce((a, x) => {
    if (o.hasOwnProperty(x)) a[x] = o[x];
    return a;
  }, {});
}

function addPick(a, o, ...fields) {
  return Object.assign(a, pick(o, ...fields))
}

function gameName(game) {
  const then = new Date(game.createdAt);
  var name = then.toString();
  let nplayers = 0;
  game.players.forEach(function(aworm, i) {
    if (aworm.typeName !== " None ") nplayers++;
  });
  name = name.substr(0, name.indexOf('GMT'));
  name += '[' + game.width + 'x' + game.width + ': ' + nplayers;
  name += (nplayers == 1) ? ' player]' : ' players]';
  return name;
}
export function emailGame(gameText) {
  var mailtourl = "mailto:?subject=" +
    encodeURIComponent("Darworms Game ") +
    "&body=" +
    encodeURIComponent("Darworms is a unique, free web strategy territoty capture game. Select everything below and paste it into a browser address bar \n\n") +
    // encodeURIComponent("Here is an example of a game I played: \n") +

    encodeURIComponent(darworms.host) +
    encodeURIComponent("?darwormsgame=") +
    encodeURIComponent(gameText);
  if(logging()) console.log("url: " + mailtourl);
  // document.location.href = mailtourl;
  window.open(mailtourl);

}
export function encodeGame(game, settings, graphics, version) {
  if(logging()) console.log(" encodeGame 0 ");
  now = new Date();
  gameObj = {
    version: version
  };
  gameObj.createdAt = now.valueOf();
  gameObj = addPick(gameObj, game, "numMoves", "numTurns");
  gameObj = addPick(gameObj, game.grid, "width");
  gameObj = addPick(gameObj, settings, "backGroundTheme", "doAnimations",
    "doAudio", "gridGeometry", "fixedInitPos", "pickDirectionUI", "masterAudioVolume");
  gameObj = addPick(gameObj, graphics, "fps");

  gameObj.players = [];
  game.worms.forEach(function(aworm, i) {
    var wrm = {
      index: i
    };
    // new dna may have been set in this game
    aworm.toText();
    wrm = addPick(wrm, aworm, "typeName", "startingPos", "name", "score", "instrument", "musickeyName", "MusicScale");
    gameObj.players.push(wrm);
  });

  gameTxt = JSON.stringify(gameObj);
  gameUrl = encodeURIComponent(gameTxt)
  let testOne = decodeURIComponent(gameUrl);
  let testTwo = JSON.parse(testOne);
  let testThree = JSON.stringify(testTwo);
  // if(logging()) console.log("before: " + gameTxt);
  // if(logging()) console.log("after:  " + testThree);
  return (gameTxt)

}

export function decodeGame(gameTxt) {
  if(logging()) console.log(" decodeGame ");
  let gameObj = JSON.parse(gameTxt);
  darworms.dwsettings.gridGeometry = gameObj.gridGeometry;
  darworms.main.setupGridGeometry();
}

export function loadGames() {

  const data = JSON.parse(localStorage.getItem('darwormgames'))
  darworms.savedgames = data || [];
  let gameindex = 0;

  darworms.savedgames.forEach(function(gameTxt, i) {
    const gameObj = JSON.parse(gameTxt);
    const then = new Date(gameObj.createdAt);
    /* const elementStr = '<li> <button data-role="button" data-inline="false"  data-theme="a" lass="ui-btn ui-shadow ui-corner-all"> ' +
    then.toTimeString() +
     '</button></li>';
    $('#savedgames')[0].appendChild(elementStr).trigger('create');
*/
    const liStr = '<li data-icon="delete" data-split-icon="delete-black"><a class="loadMe" value=' + i + '>' + gameName(gameObj) + '</a><a value=' +
      i + ' data-icon="star" data-split-icon="delete-black" class="deleteMe" ></a></li>'
    $('#savedgames').append(liStr).listview('refresh');

    //    $('#savedgames').append(liStr).trigger('create');
    //    $('#savedgames').append('<li id="l1"><a>5.00</a><a id="1" class="deleteMe"></a></li>').trigger('create');
    if(logging()) console.log(" liStr: " + liStr);


  })
  $('.deleteMe').on('click', function(event) {
    if(logging()) console.log(" deleteMe clicked");
    if(logging()) console.log($(this).attr("value"));
    let index = parseInt($(this).attr("value"))
    if ((index >= 0) && (index < darworms.savedgames.length)) {
      darworms.savedgames.splice(index, 1);
    }
    localStorage.setItem('darwormgames', JSON.stringify(darworms.savedgames));
    refreshSavedGames();
  });
  $('.loadMe').on('click', function(event) {
    if(logging()) console.log(" loadMe clicked");
    if(logging()) console.log($(this).attr("value"));
    let index = parseInt($(this).attr("value"))
    if ((index >= 0) && (index < darworms.savedgames.length)) {
      let gameObj = darworms.main.injectSettings(darworms.savedgames[index]);
      updateScores(darworms.main.gWorms);
      $.mobile.changePage('#playpage');
    }

  });
}

export function freeGames() {
  const svgamelist = $('#savedgames')[0];
  while (svgamelist.firstChild) {
    svgamelist.removeChild(svgamelist.firstChild)
  }
}

export function saveGame(gameTxt) {
  if(logging()) console.log(" saveGame ");
  darworms.savedgames.push(gameTxt);
  localStorage.setItem('darwormgames', JSON.stringify(darworms.savedgames));
  refreshSavedGames();

}

export function loadGame() {
  if(logging()) console.log(" loadGame ");
  const data = JSON.parse(localStorage.getItem('darwormgames'));
}

function refreshSavedGames() {
  const svgamelist = $('#savedgames')[0];
  while (svgamelist.firstChild) {
    svgamelist.removeChild(svgamelist.firstChild)
  }
  loadGames();
}
