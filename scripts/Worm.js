/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/22/13
 * Time: 12:00 AM
 * To change this template use File | Settings | File Templates.
 */
/* Worm Object */
function Worm(colorIndex, state) {
    this.colorIndex = colorIndex;
    this.dna = new Array(64);
    this.state = state;
    this.nMoves = 0;
    this.score = 0;
    this.prevScore = 0;

    for (var i = 0; i < 64; i = i + 1) {
        this.dna[i] =darworms.dwsettings.codons.unSet;
    }
    this.dna[63] = darworms.dwsettings.codons.isTrapped;
    // set all the forced moves
    for (var j = 0; j < 6 ; j = j+ 1) {
        this.dna[ 0x3F ^ (1<<j)] = j;
    }
    this.randomize();
}
Worm.prototype.init = function( wType) {
    this.nMoves = 0;
    this.score = 0;
    this.prevScore = 0;
    if (wType === 0) { // none   asleep
        this.state = 3;  // sleeping
    }
    if (wType === 1) { // random
        for (var i = 0; i < 64; i = i + 1) {
            this.dna[i] = darworms.dwsettings.codons.unSet;
        }
        this.dna[63] = darworms.dwsettings.codons.isTrapped;
        // set all the forced moves
        for (var j = 0; j < 6 ; j = j+ 1) {
            this.dna[ 0x3F ^ (1<<j)] = j;
        }
        this.randomize();  // sleeping
    }
    if (wType === 2) { // same
        this.state = 2;  // paused
    }
    if (wType === 3) { // new
        for (var  k = 0; k < 64; k = k + 1) {
            this.dna[k] = darworms.dwsettings.codons.unSet;
        }
        this.dna[63] = darworms.dwsettings.codons.isTrapped;
        // set all the forced moves
        for (var n = 0; n < 6 ; n = n+ 1) {
            this.dna[ 0x3F ^ (1<<n)] = n;
        }
        this.state = 2;  // paused
    }
};
Worm.prototype.getMoveDir = function (value) {
    if (value === 0x3F)  {  // trapped
        this.state = wormStates.dead;
        return 6;
    }
    return this.dna[value & 0x3F];
};
Worm.prototype.shouldDrawScore = function () {
    if (this.score !== this.prevScore  || (this.nMoves < 2)) {
        this.prevScore = this.score;
        return true;
    }
    return false;
};
Worm.prototype.randomize = function() {
    var dir;
    for (var i = 0; i < 63; i = i + 1) {
        // console.log(" randomize loop start  i = " + i + " dna[i] = " + this.dna[i]);
        if (this.dna[i] === darworms.dwsettings.codons.unSet ) {
            for (var j = 0; j < 1000; j = j + 1) {
                dir = Math.floor(Math.random() * 6);
                //console.log( " dir = " + dir +  " i=" + i + " outMask[dir] = " + outMask[dir] + "& = " + (i & outMask[dir]));
                if ((i & darworms.outMask[dir]) === 0) {
                    this.dna[i] = dir;
                    // console.log(" Setting dir 0x" + i.toString(16) + " to " + compassPts[dir]);
                    break;
                }
            }
            if (this.dna[i] === darworms.dwsettings.codons.unSet) {
                console.log ("Error we rolled craps 10,000 times in a row");
            }
        }
        // console.log(" randomize loop end  i = " + i + " dna[i] = " + this.dna[i]);
    }
};
Worm.prototype.log = function() {
    var dir;
    console.log( " Worm State: " + wormStateNames[this.state] + " at " + (this.pos !== undefined ? this.pos.format() : "position Undefined"));
};
Worm.prototype.place = function(aState, aGame) {
    this.pos = aGame.origin;
    this.nMoves = 0;
    this.score = 0;
    this.state = aState;
    console.log(" placing worm   i = " + this.colorIndex + " state " + aState);
};
Worm.prototype.dump = function() {
    this.log();
    for (var i = 0; i < 64; i = i + 1) {
        console.log (" dna" + i + " = " + darworms.compassPts[this.dna[i]]);
        var spokes = [];
        for (var spoke = 0; spoke < 6; spoke = spoke + 1) {
            if ((i & darworms.outMask[spoke]) !== 0 ) {
                spokes.push(compassPts[spoke]);
            }
        }
        console.log (" dna" + i + " "+ spokes + " = " + compassPts[this.dna[i]]);
    }

};
/* end of Worm */
