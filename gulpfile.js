/*
 * gulpfile for project frontend-development
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var autoprefixer = require('gulp-autoprefixer'),
  changed = require('gulp-changed'),
  fs = require('fs'),
  glob = require('glob'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  iconfont = require('gulp-iconfont'),
  iconfontCss = require('gulp-iconfont-css'),
  iconfontTemplate = require('gulp-iconfont-template'),
  gulpIgnore = require('gulp-ignore'),
  imagemin = require('gulp-imagemin'),
  jshint = require('gulp-jshint'),
  lessChanged = require('gulp-less-changed'),
  lesshint = require('gulp-lesshint'),
  less = require('gulp-less'),
  gulpLivereload = require('gulp-livereload'),
  notify = require('gulp-notify'),
  gulpPhplint = require('gulp-phplint'),
  path = require('path'),
  os = require('os'),
  rename = require('rename'),
  runSequence = require('run-sequence'),
  shell = require('gulp-shell'),
  uglify = require('gulp-uglify')
  ;

var gulpDir = __dirname;
var srcDir = path.join(__dirname, 'src');
var bowerDir = path.join(__dirname, 'bower_components');
var destDir = path.join(__dirname, 'htdocs');
var watchFilesFor = {};
var lifereloadPort = process.env.GULP_LIVERELOAD || 5081;

/*
 * include test-forms gulpfile.js
 */
var gulpTestForms = require('./tests/test-forms/gulpfile.js');
gulp.tasks = gulpTestForms.gulp.tasks;
watchFilesFor = gulpTestForms.watchFilesFor;

/*
 * include compare-layouts gulpfile.js
 */
var gulpCompareLayouts = require('./tests/compare-layouts/gulpfile.js');
Object.keys(gulpCompareLayouts.gulp.tasks).forEach(function(key) {
  gulp.tasks[key] = gulpCompareLayouts.gulp.tasks[key];
});
Object.keys(gulpCompareLayouts.watchFilesFor).forEach(function(key) {
  watchFilesFor[key] = gulpCompareLayouts.watchFilesFor[key];
});

/*
 * include responsive-check gulpfile.js
 */
var gulpResponsiveCheck = require('./tests/responsive-check/gulpfile.js');
Object.keys(gulpResponsiveCheck.gulp.tasks).forEach(function(key) {
  gulp.tasks[key] = gulpResponsiveCheck.gulp.tasks[key];
});
Object.keys(gulpResponsiveCheck.watchFilesFor).forEach(function(key) {
  watchFilesFor[key] = gulpResponsiveCheck.watchFilesFor[key];
});

/*
 * log only to console, not GUI
 */
var log = notify.withReporter(function (options, callback) {
  callback();
});

/*
 * php files lint
 */
watchFilesFor.phpLint = [
  path.join(destDir, '**', '*.php')
];
gulp.task('phpLint', function () {
  var opts = { skipPassedFiles: true };
  return gulp.src( watchFilesFor.phpLint )
    .pipe(gulpPhplint('', opts))
    .pipe(gulpPhplint.reporter('fail'))
    ;
});

/*
 * less files lint and style check
 */
watchFilesFor.lesshint = [
  path.join(srcDir, 'less', '*.less'),
  path.join(srcDir, 'less', 'login', '*.less')
];
gulp.task('lesshint', function () {
  return gulp.src( watchFilesFor.lesshint )
    .pipe(lesshint())  // enforce style guide
    .on('error', function (err) {})
    .pipe(lesshint.reporter())
    ;
});

/*
 * less task watching all less files, only writing sources without **,
 * includes (path with **) filtered, change check by gulp-less-changed
 */
watchFilesFor.less = [
  path.join(srcDir, 'less', '*.less'),
  path.join(srcDir, 'less', 'login', '*.less')
];
gulp.task('less', function () {
  var dest = function(filename) {
    var srcBase = path.join(srcDir, 'less');
    return path.join(path.dirname(filename).replace(srcBase, destDir), 'css');
  };
  var src = watchFilesFor.less.filter(function(el){return el.indexOf('/**/') == -1; });
  return gulp.src( src )
    .pipe(lessChanged({
      getOutputFileName: function(file) {
        return rename( file, { dirname: dest(file), extname: '.css' } );
      }
    }))
    .pipe(less())
    .on('error', log.onError({ message:  'Error: <%= error.message %>' , title: 'LESS Error'}))
    .pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'))
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
//    .pipe(gulpif(options.env === 'production', uglify()))
    .pipe(gulp.dest(function(file) { return dest(file.path); }))
    .pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp less' }))
    ;
});

/*
 * compiling bootstrap less
 */
watchFilesFor.lessBootstrap = [
  path.join(bowerDir, 'bootstrap', 'less', '**', '*.less')
];
gulp.task('lessBootstrap', function () {
  return gulp.src( [ path.join(bowerDir, 'bootstrap', 'less', 'bootstrap.less') ] )
    .pipe(changed(path.join(destDir, 'css'), {extension: '.css'}))
    .pipe(less())
    .on('error', log.onError({ message:  'Error: <%= error.message %>' , title: 'LESS Error'}))
    .pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4'))
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(gulp.dest(path.join(destDir, 'css')))
    .pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp lessBootstrap' }))
    ;
});

/*
 * Copy the basic js files to js/vendor
 */
watchFilesFor.jsBootstrap = [
  path.join(bowerDir, 'jquery', 'dist', 'jquery.min.js'),
  path.join(bowerDir, 'bootstrap', 'dist', 'js', 'bootstrap.min.js')
];
gulp.task('jsBootstrap', function () {
  return gulp.src( watchFilesFor.jsBootstrap )
    .pipe(changed(path.join(destDir, 'js', 'vendor')))
    .pipe(gulp.dest(path.join(destDir, 'js', 'vendor')))
    .pipe(log({ message: 'written: <%= file.path %>', title: 'Gulp jsBootstrap' }))
    ;
});

/*
 * graphviz image generation
 */
watchFilesFor.graphviz = [
  path.join(srcDir, 'Graphviz', '*.gv')
];
gulp.task('graphviz', function () {
  var destPng = path.join(srcDir, 'img', 'gv');
  var destMap = path.join(destDir, 'img', 'gv');
  if (!fs.existsSync(path.join(srcDir, 'img'))) {
    fs.mkdirSync(path.join(srcDir, 'img'));
  }
  if (!fs.existsSync(path.join(srcDir, 'img', 'gv'))) {
    fs.mkdirSync(path.join(srcDir, 'img', 'gv'));
  }
  if (!fs.existsSync(path.join(destDir, 'img'))) {
    fs.mkdirSync(path.join(destDir, 'img'));
  }
  if (!fs.existsSync(path.join(destDir, 'img', 'gv'))) {
    fs.mkdirSync(path.join(destDir, 'img', 'gv'));
  }
  return gulp.src(watchFilesFor.graphviz, {read: false})
    .pipe(changed(destPng, {extension: '.png'}))
    .pipe(shell('dot <%= params(file.path) %> "<%= file.path %>"', {
      templateData: {
        params: (s) => {
          let m = '';
          if (s.indexOf('docker') >= 0) {
            m = '-Tcmapx -o "' + s.replace(/^.+\/([^\/]+)\.gv$/, destMap + '/$1.map') + '" ' +
                '-Tsvg -o "' + s.replace(/^.+\/([^\/]+)\.gv$/, destMap + '/$1.svg') + '" ';
          }
          return m + '-Tpng -o "' + s.replace(/^.+\/([^\/]+)\.gv$/, destPng + '/$1.png') + '"';
        }
      }
    }))
    .on('error', log.onError({ message:  'Error: <%= error.message %>', title: 'Graphviz Error'}))
    .pipe(log({ message: 'processed: <%= file.path %>', title: 'Gulp graphviz' }))
    ;
});

/*
 * prepare images
 */
watchFilesFor.imagemin = [
  path.join(srcDir, 'img', '**', '*.png')
];
gulp.task('imagemin', () => {
  const IMAGE_OPTION = [
    imagemin.gifsicle({ interlaced: true }),
    imagemin.jpegtran({ progressive: true }),
    imagemin.optipng({ optimizationLevel: 5 }),
    imagemin.svgo({ plugins: [{ removeViewBox: true }] }),
  ];
  if (!fs.existsSync(path.join(destDir, 'img'))) {
    fs.mkdirSync(path.join(destDir, 'img'));
  }
  gulp.src(watchFilesFor.imagemin)
    .pipe(changed(path.join(destDir, 'img')))
    .pipe(imagemin(IMAGE_OPTION))
    .pipe(gulp.dest(path.join(destDir, 'img')))
    .pipe(log({ message: 'saved: <%= file.path %>', title: 'Gulp images' }))
  ;
});

/*
 * make iconfont
 */
watchFilesFor.iconfont = [
  path.join(srcDir, 'iconfont', 'template.*')
];
gulp.task('iconfont', function(callback) {
  runSequence('iconfont-build',
    'iconfont-preview',
    callback);
});
watchFilesFor['iconfont-build'] = [
  path.join(srcDir, 'iconfont', '*.svg')
];
gulp.task('iconfont-build', function(){
  var fontName = 'iconfont';
  var destDirFont = path.join(destDir, 'css', 'fonts');
  gulp.src(watchFilesFor['iconfont-build'])
    .pipe(iconfontCss({
      fontName: fontName,
      path: path.join(srcDir, 'iconfont', 'template.less'),
      targetPath: path.join('..', '..', '..', 'src', 'less', 'iconfont.less'), // must be relative to the path used in gulp.dest()
      fontPath: 'fonts/'
    }))
    .pipe(iconfont({
      fontName: fontName,
      fontHeight: 1001,
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
      log: function(){},
      normalize: true,
      prependUnicode: true,
      timestamp: Date.now(),
    }))
    .on('glyphs', function(glyphs, options) {
      // CSS templating, e.g.
      // console.log(glyphs, options);
    })
    .pipe(gulp.dest(destDirFont))
    .pipe(log({ message: 'saved: <%= file.path %>', title: 'Gulp iconfont' }))
    ;
});

/*
 * make iconfont preview
 */
watchFilesFor['iconfont-preview'] = [
  path.join(srcDir, 'iconfont', '*.svg')
];
gulp.task('iconfont-preview', function(){
  var fontName = 'iconfont';
  var destDirFont = path.join(destDir, 'css', 'fonts');
  gulp.src(watchFilesFor['iconfont-preview'])
    .pipe(iconfontTemplate({
      fontName: fontName,
      path: path.join(srcDir, 'iconfont', 'template.html'),
      targetPath: fontName + '.html',
    }))
    .pipe(gulpIgnore.exclude('*.svg'))
    .pipe(gulp.dest(destDirFont))
    .pipe(log({ message: 'saved: <%= file.path %>', title: 'Gulp iconfont-preview' }))
    ;
});

/*
 * lint javascript files
 */
watchFilesFor.jshint = [
  path.join(gulpDir, 'gulpfile.js'),
  path.join(gulpDir, 'package.json')
];
gulp.task('jshint', function(callback) {
  return gulp.src(watchFilesFor.jshint)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    ;
});

/*
 * run all build tasks
 */
gulp.task('build', function(callback) {
  runSequence('phpLint',
    'lesshint',
    'less',
    'lessBootstrap',
    'jsBootstrap',
    'graphviz',
    'imagemin',
//    'iconfont', // not generated by default
    'jshint',
    callback);
});

/*
 * watch task
 */
gulp.task('watch', function() {
  Object.keys(watchFilesFor).forEach(function(task) {
    watchFilesFor[task].forEach(function(filename) {
      glob(filename, function(err, files) {
        if (err) {
          console.log(filename + ' error: ' + JSON.stringify(err, null, 4));
        }
        if (files.length === 0) {
          console.log(filename + ' not found');
        }
      });
    });
    gulp.watch( watchFilesFor[task], [ task ] );
  });
  gulpLivereload.listen( { port: lifereloadPort, delay: 2000 } );
  console.log('gulp livereload listening on http://' + ipv4adresses()[0] + ':' + lifereloadPort);
});

/*
 * init with build and watch
 */
gulp.task('init', function(callback) {
  runSequence('build',
    'watch',
    callback);
});

/*
 * default task: init all build tasks and watch
 */
gulp.task('default', ['compare-layouts-init', 'responsive-check-init', 'init'] );

function ipv4adresses() {
  var addresses = [];
  var interfaces = os.networkInterfaces();
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses;
}
