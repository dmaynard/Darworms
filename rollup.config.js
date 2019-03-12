import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
		format: 'es6', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: false
	},
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		production && uglify() // minify, but only in production
	]
};
