// gameio.js

let jsongame = {

}

let dworm =  {
    name: "",
    index: 0,
}

let gameObj =  {};
let gameTxt = "";
let gameUrl = "";


function pick(o, ...fields) {
    return fields.reduce((a, x) => {
        if(o.hasOwnProperty(x)) a[x] = o[x];
        return a;
    }, {});
}

function addPick(a, o, ...fields) {
    return Object.assign(a,pick(o, ...fields))
}


export function emailGame( game, settings) {
  console.log (" emailGame ");
}

export function encodeGame( game, settings, graphics, version) {
    console.log (" encodeGame 0 ");
    now = new Date();
    gameObj = { version: version};
    gameObj.createdAt = now.toString();
    gameObj = addPick( gameObj, game,"numMoves", "numTurns");
    gameObj = addPick( gameObj, game.grid, "width");
    gameObj = addPick( gameObj, settings, "backGroundTheme", "doAnimations",
     "doAudio", "gridGeometry", "fixedInitPos", "pickDirectionUI", "masterAudioVolume");
    gameObj = addPick( gameObj, graphics, "fps");

    gameObj.players = [];
    game.worms.forEach ( function (aworm, i) {
      var wrm = { index: i};
     wrm = addPick(wrm, aworm, "typeName", "startingPos", "name", "score", "instrument", "musickeyName", "MusicScale");
      gameObj.players.push(wrm);
    });

    gameTxt = JSON.stringify(gameObj);
    gameUrl = encodeURIComponent(gameTxt)
    let testOne = decodeURIComponent(gameUrl);
    let testTwo = JSON.parse(testOne);
    let testThree = JSON.stringify(testTwo);
    console.log("before: " + gameTxt);
    console.log("after:  " + testThree);
    return (gameTxt)

}

export function decodeGame( gameTxt ) {
  console.log (" decodeGame ");
  let gameObj = JSON.parse(gameTxt);
  darworms.dwsettings.gridGeometry = gameObj.gridGeometry;
  darworms.main.setupGridGeometry();
}
