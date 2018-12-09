var maxImageWidth = 1024;

var jsLibFiles = [ 
	'./assets/lib/**/*.js' 
];

var jsAssetFiles = [ 
	'./assets/js/*.js' 
];

var jsFiles = [
	'./build/js/lib.min.js',
	'./build/js/asset.min.js' 
];

var jsFilesNoMin = [
	'./build/js/lib.js',
	'./build/js/asset.js' 
];

var scssFiles = [ 
	'./assets/scss/*.scss'
];

var outputFiles = [ 
	'./dist/js/*.js', 
	'./dist/css/*.css' 
];

var allowableImages = [ 
	'./assets/images/*.jpg', 
	'./assets/images/*.png'
];

const gulp = require( 'gulp' );
const image = require( 'gulp-imagemin' );
const sass = require( 'gulp-sass' );
const sourcemaps = require( 'gulp-sourcemaps' );
const concat = require( 'gulp-concat' );
const rename = require( 'gulp-rename' );
const uglify = require( 'gulp-uglify' );
const debug = require( 'gulp-debug' );
const replace = require( 'gulp-replace' );
const timestamp = require( 'unix-timestamp' );
const hash = require( 'gulp-hash-creator' );
const eslint = require( 'gulp-eslint' );
const resize = require( 'gulp-image-resize' );
 
gulp.task( 'image', function() {
	var result =  
		gulp.src( allowableImages )
		.pipe( resize( { width: maxImageWidth } ) )
   		.pipe( image( [
			image.jpegtran({progressive: true}),
		]
		) )
		.pipe( gulp.dest( './dist/images' ) );

	result = result ||  
		gulp.src( [ './assets/images/*.svg' ] )
		.pipe( gulp.dest( './dist/images' ) );

	return result;
});

gulp.task( 'lint', function() {
	return gulp.src( './assets/js/*.js' )
		.pipe( eslint() )
		.pipe( eslint.format() )		
});

gulp.task( 'jsasset', function() {
	return gulp.src( jsAssetFiles )
		.pipe( debug() )
		.pipe( concat( 'asset.js' ) )
		.pipe( gulp.dest( './build/js' ) )
		.pipe( rename( 'asset.min.js' ) )
		.pipe( uglify() )			
		.pipe( gulp.dest( './build/js' ) )
});

gulp.task( 'jslib', function() {
	return gulp.src( jsLibFiles )
		.pipe( debug() )
		.pipe( concat( 'lib.js' ) )
		.pipe( gulp.dest( './build/js' ) )
		.pipe( rename( 'lib.min.js' ) )
		.pipe( uglify() )		
		.pipe( gulp.dest( './build/js' ) )
});

gulp.task( 'jsconcat', function() {
	return gulp.src( jsFiles, { allowEmpty: true } )
		.pipe( debug() )
		.pipe( concat( 'bundle.min.js' ) )
		.pipe( gulp.dest( './dist/js' ) )
});

gulp.task( 'jsconcatnonmin', function() {
	return gulp.src( jsFilesNoMin )
		.pipe( debug() )
		.pipe( concat( 'bundle.js' ) )
		.pipe( gulp.dest( './dist/js' ) )
});

gulp.task( 'js', gulp.series( 'jsasset', 'jslib', 'jsconcat'  ) );

gulp.task( 'cache', function() {
	return gulp.src( './assets/php/*.php' )
		.pipe( replace( '{cache_version}', hash( { length: 12, content: timestamp.now() } ) ) )
		.pipe( gulp.dest( './dist/php' ) )
});

gulp.task( 'scss', function () {
  return gulp.src( scssFiles )
 	.pipe( debug() ) 
	.pipe( sourcemaps.init() )
	.pipe( sass( { outputStyle: 'nested' } ).on( 'error', sass.logError ) )
	.pipe( sourcemaps.write( './' ) )
	.pipe( gulp.dest( './dist/css' ) );
});

gulp.task( 'image:watch', function() {
	var watcher = gulp.watch( allowableImages );
	watcher.on( 'all', function( e, p, s ) {
		 gulp.series( 'image', 'cache' );
	});	
});

gulp.task( 'js:watch', function() {	
	gulp.series( 'js:assetwatch', 'js:libwatch' );
});

gulp.task( 'fonts', function() {
  return gulp.src( './assets/fonts/*' )
	.pipe( sourcemaps.write( './' ) )
	.pipe( gulp.dest( './dist/fonts' ) );	
})

function allWatch() {
	// SCSS
	gulp.watch( scssFiles, gulp.series( 'scss', 'cache' ) );

	// JS Libraries
	gulp.watch( jsLibFiles, gulp.series( 'jslib', 'jsconcat', 'jsconcatnonmin', 'cache' ) );

	// Our JS
	gulp.watch( jsAssetFiles, gulp.series( 'jsasset', 'jsconcat', 'jsconcatnonmin', 'cache' ) );

	// Images
	gulp.watch( allowableImages, gulp.series( 'image', 'cache' ) );

	// Fonts
	gulp.watch( './assets/fonts/*', gulp.series( 'fonts' ) );	
}

gulp.task( 'default', gulp.series( gulp.parallel( 'scss', 'image', 'js', 'fonts', 'lint' ), 'cache' ) );
gulp.task( 'watch', gulp.series( allWatch ) );
