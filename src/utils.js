// utils.js
export function log ( str )  {
  if ($('#logging').slider().val() == "true") {
    console.log( str );
  }
}
