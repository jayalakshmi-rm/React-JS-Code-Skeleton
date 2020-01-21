'use strict';
const gulp = require('gulp');  // Base gulp package
const babelify = require('babelify'); // Used to convert ES6 & JSX to ES5
const browserify = require('browserify'); // Providers "require" support, CommonJS
const notify = require('gulp-notify'); // Provides notification to both the console and Growel
const rename = require('gulp-rename'); // Rename sources
const sourcemaps = require('gulp-sourcemaps'); // Provide external sourcemap files
const livereload = require('gulp-livereload'); // Livereload support for the browser
const gutil = require('gulp-util'); // Provides gulp utilities, including logging and beep
const chalk = require('chalk'); // Allows for coloring for logging
const source = require('vinyl-source-stream'); // Vinyl stream support
const buffer = require('vinyl-buffer'); // Vinyl stream support
const watchify = require('watchify'); // Watchify for source changes
const merge = require('utils-merge'); // Object merge tool
const duration = require('gulp-duration'); // Time aspects of your gulp process

// Configuration for Gulp
const config = {
  js: {
    src: './app/main.jsx',
    watch: './app/**/*',
    outputDir: './app/dist/',
    outputFile: 'main.js',
  },
};

// Error reporting function
function mapError(err) {
  if (err.fileName) {
    // Regular error
    gutil.log(chalk.red(err.name)
      + ': ' + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
      + ': ' + 'Line ' + chalk.magenta(err.lineNumber)
      + ' & ' + 'Column ' + chalk.magenta(err.columnNumber || err.column)
      + ': ' + chalk.blue(err.description));
  } else {
    // Browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message));
  }
}

// Completes the final file outputs
function bundle(bundler) {
  let bundleTimer = duration('Javascript bundle time');

  return bundler
    .bundle()
    .on('error', mapError) // Map error reporting
    .pipe(source('main.jsx')) // Set source name
    .pipe(buffer()) // Convert to gulp pipeline
    .pipe(rename(config.js.outputFile)) // Rename the output file
    .pipe(sourcemaps.init({loadMaps: true})) // Extract the inline sourcemaps
    .pipe(sourcemaps.write('./map')) // Set folder for sourcemaps to output to
    .pipe(gulp.dest(config.js.outputDir)) // Set the output folder
    .pipe(notify({
      message: 'Generated file: <%= file.relative %>',
    })) // Output the file being created
    .pipe(bundleTimer) // Output time timing of the file creation
    .pipe(livereload()); // Reload the view in the browser
}

gulp.task("copy", function() {
    return gulp.src(["app/index.html", "app/lib/bootstrap-css/css/bootstrap.min.css", "app/lib/font-awesome/css/font-awesome.min.css", "app/lib/static/**/*", "app/lib/font-awesome/**/*", "app/style.css"])
        .pipe(gulp.dest("app/dist"));
});
// Gulp task for build
gulp.task('default',  ["copy"],function() {
  //livereload.listen(); // Start livereload server
  let args = merge(watchify.args, { debug: true }); // Merge in default watchify args with browserify arguments

  let bundler = browserify(config.js.src, args) // Browserify
    //.plugin(watchify, {ignoreWatch: ['**/node_modules/**', '**/bower_components/**']}) // Watchify to watch source file changes
    .transform(babelify, {presets: ['es2015', 'react', 'stage-2']}); // Babel tranforms

  bundle(bundler); // Run the bundle the first time (required for Watchify to kick in)

  // bundler.on('update', function() {
  //   bundle(bundler); // Re-run bundle on source updates
  // });
});
