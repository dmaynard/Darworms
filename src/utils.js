// utils.js

export function log ( str )  {
  if ($('#logging').slider().val() == "true") {
    console.log( str );
  }
}
export function logging ( )   {
  return ($('#logging').slider().val() == "true");
}

export function numOneBits( val) {
  var nbits = 0;
  while (val > 0 ) {
    nbits += val & 1;
    val >>= 1;
  }
  return nbits;
}
