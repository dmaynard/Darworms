import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify-es';
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
		format: 'esm',
	  sourcemap: true
	},
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		// production && uglify({
    // compress: {
    //   toplevel: true
          //},
	   //	mangle: {}
      // }) // minify, but only in production
			production && uglify()
	]
};
