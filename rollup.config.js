import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify-es';
import replace from 'rollup-plugin-replace';
// import gzipPlugin from 'rollup-plugin-gzip';
// import {eslint} from 'rollup-plugin-eslint';

// import globals from 'rollup-plugin-node-globals';
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
		// eslint({
	  //    /* your options */
	  //  }),
		resolve(), // tells Rollup how to find date-fns in node_modules
		replace({
					exclude: ['node_modules/**', 'public/**'],
					include: 'src/loader.js',
					ENV: (production ? false : true),
					DATE: Date.now(),
				}),

			production && uglify(),
			// netlify gzips in post processing
			// production && gzipPlugin(),

	]
};
