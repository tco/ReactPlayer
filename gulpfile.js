var gulp            = require('gulp'),

    inject          = require('gulp-inject'),
    rename          = require('gulp-rename'),
    plumber         = require('gulp-plumber'),
    watch           = require('gulp-watch'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    uglify          = require('gulp-uglify'),
    concat          = require('gulp-concat'),
    sourcemaps      = require('gulp-sourcemaps'),
    gutil           = require('gulp-util'),
    karma           = require('gulp-karma'),
    gulpif          = require('gulp-if'),
    notify          = require('gulp-notify'),
    livereload      = require('gulp-livereload'),

    del             = require('del'),
    sequencer       = require('run-sequence'),
    notifier        = require('node-notifier'),


    source          = require('vinyl-source-stream');
    buffer          = require('vinyl-buffer');
    browserify      = require('browserify'),
    babelify        = require('babelify'),
    reactify        = require('reactify'),

    fs              = require('fs'),

    argv            = require('yargs').argv,
    hash            = argv.hash ? argv.hash : 'local',

    paths = {
        scssFeatures: ['app/features/**/*.scss', '!app/css/features.scss'],
        jsFeatures: 'app/features/**/*.js',
        cssFeatures: 'dist/styles/features.css',
        tests: 'test/unit/**/*.js',
        clean: ['dist', 'app/css/features.scss']
    },
    standardErrorHandler = { errorHandler: notify.onError("<%= error.message %>")};


gulp.task('clean', function(cb) {
    del(paths.clean, cb);
});

gulp.task('scss-features', function(done) {
    return gulp.src('app/css/featureTemplate.scss')
        .pipe(plumber(standardErrorHandler))
        .pipe(inject(gulp.src(paths.scssFeatures, { read: false }), {
            starttag: '/* inject:{{ext}} */',
            endtag: '/* endinject */',
            ignorePath: '/app/',
            addRootSlash: false,
            transform: function(filepath) {
                return '@import "../' + filepath + '";';
            }
        }))
        .pipe(rename('features.scss'))
        .pipe(gulp.dest('app/css/'));
});

gulp.task('sass', ['scss-features'], function(done) {
    return gulp.src('app/css/features.scss')
        .pipe(plumber(standardErrorHandler))
        // Source maps don't work at the moment with watcher
        // Never goes to onError handler, seg faults instead.
        // Can maybe be used later, so leaving this as a reference:
        // .pipe(sass({ onError: onError, sourceComments: 'map', sourceMap: 'scss' }))
        .pipe(sass({ onError: notify.onError("<%= error.message %>") }))
        .pipe(autoprefixer())
        .pipe(gulp.dest('dist/styles/'))
        .pipe(livereload());

});

gulp.task('build-styles', ['clean', 'scss-features', 'sass']);

gulp.task('build-js', ['clean'], function() {

    var b = browserify({
        entries: './app/features/app.js',
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: [babelify, reactify]
    });

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(plumber(standardErrorHandler))
        .pipe(gulpif(!argv.production, sourcemaps.init({ loadMaps: true })))
            .pipe(gulpif(argv.production, uglify()))
        .pipe(gulpif(!argv.production, sourcemaps.write()))
        .pipe(gulp.dest('dist/scripts/'))
        .pipe(livereload());
});

gulp.task('build-index', ['clean', 'build-styles', 'build-js'], function() {
    return gulp.src('app/index.html')
        .pipe(inject(gulp.src('dist/styles/features.css', { read: false }), {
            ignorePath: '/dist/',
            addRootSlash: false,
            transform: function(filepath) {
                return '<link rel="stylesheet" href="' + filepath + '?v=' + hash + '" />';
            }
        }))
        .pipe(inject(gulp.src('dist/scripts/app.js', { read: false }), {
            starttag: '<!-- inject:features:{{ext}} -->',
            ignorePath: '/dist/',
            transform: function(filepath) {
                return '<script type="text/javascript" src="/dist' + filepath + '?v=' + hash + '"></script>';
            }
        }))
        .pipe(gulpif(!argv.production, inject(gulp.src('dist/scripts/app.js', { read: false }), {
            starttag: '<!-- inject:addon:{{ext}} -->',
            ignorePath: '/dist/',
            transform: function(filepath) {
                return '<script type="text/javascript" src="http://127.0.0.1:9050/livereload.js"></script>';
            }
        })))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['clean', 'build-styles', 'build-js', 'build-index'], function(done) {
    notifier.notify({
        title: 'Project Built',
        message: 'Project assets built to dist/'
    });
    done();
});

gulp.task('watch', function() {
    livereload.listen({
        port: 9050
    });
    gulp.watch(paths.jsFeatures, ['features-js', 'test']);
    gulp.watch(paths.tests, ['features-js', 'test']);
    gulp.watch(paths.scssFeatures, ['build-styles']);
});

gulp.task('test', function() {
  return setupKarmaTask();
});

gulp.task('test-browser', function() {
  return setupKarmaTask({
    browsers: ['Chrome'],
    action: 'watch'
  });
});

gulp.task('default', function() {
  return sequencer('build', 'watch', function() {
    notifier.notify({
      title: 'Server Started',
      message: 'Remember to start nginx'
    });
  });
});

function setupKarmaTask(karmaOptions){
  var files = [].concat(paths.bowerComponents);
  files.push(paths.jsFeatures);
  files.push(paths.tests);

  var options = karmaOptions || {};
  options.configFile = 'test/config/karma.conf.js';
  return gulp.src(files)
    .pipe(plumber())
    .pipe(karma(options));
}
