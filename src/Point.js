/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/21/13
 * Time: 11:37 PM
 * To change this template use File | Settings | File Templates.
 */

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.isEqualTo = function(other) {
    return this.x == other.x && this.y == other.y;
};

Point.prototype.add = function( other) {
//    console.log (" adding (" + other.x + "," + other.y + " to (" + this.x + "," + this.y );
    this.x = this.x + other.x;
    this.y = this.y + other.y;
  }

Point.prototype.dist = function( other) {
    //  console.log (" dist from (" + other.x + "," + other.y + ") to (" + this.x + "," + this.y );
    return Math.sqrt((this.x - other.x ) * (this.x - other.x) +  (this.y - other.y) * (this.y - other.y));
}

Point.prototype.absDiff = function( other) {
    //  console.log (" dist from (" + other.x + "," + other.y + ") to (" + this.x + "," + this.y );
    return new Point( Math.abs(this.x-other.x) , Math.abs(this.y-other.y));

}

Point.prototype.wrap = function (wg, hg) {
    if (this.x >= wg) this.x = this.x - wg;
    if (this.x < 0) this.x = this.x + wg;
    if (this.y >= hg) this.y = this.y - hg;
    if (this.y < 0) {
        this.y = this.y + hg;
    }
};
Point.prototype.format = function( ) {
    return "(" + this.x + "," + this.y + ")";
};

export default Point;
