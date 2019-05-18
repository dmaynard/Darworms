/**
 * Created with JetBrains WebStorm.
 * User: dmaynard
 * Date: 9/21/13
 * Time: 11:37 PM
 */

 import {
   log
 } from "./utils.js"
 
export class  Point {
  constructor(x,y) {
    const privateString = "(" + x + "," + y + ")";
    this.x = x;
    this.y = y;
  }
  isEqualTo (other) {
      return this.x == other.x && this.y == other.y;
  };
  add (other) {
  //    log (" adding (" + other.x + "," + other.y + " to (" + this.x + "," + this.y );
      this.x = this.x + other.x;
      this.y = this.y + other.y;
    }
  dist(other) {
        //  log (" dist from (" + other.x + "," + other.y + ") to (" + this.x + "," + this.y );
        return Math.sqrt((this.x - other.x ) * (this.x - other.x) +  (this.y - other.y) * (this.y - other.y));
    }
  absDiff (other) {
        //  log (" dist from (" + other.x + "," + other.y + ") to (" + this.x + "," + this.y );
        return new Point( Math.abs(this.x-other.x) , Math.abs(this.y-other.y));
    }
  wrap (wg, hg) {
        if (this.x >= wg) this.x = this.x - wg;
        if (this.x < 0) this.x = this.x + wg;
        if (this.y >= hg) this.y = this.y - hg;
        if (this.y < 0) {
            this.y = this.y + hg;
        }
    };

    format ( ) {
        return "(" + this.x + "," + this.y + ")";
    };

    print ( ) {
      log ( " Private class variable " + privateString);
    }
}
