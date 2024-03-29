const gulp = require('gulp'),
  path = require('path'),
  watch = require('gulp-watch'),
  rename = require('gulp-rename'),
  del = require('del'),
  rigger = require('gulp-rigger'),
  concat = require('gulp-concat'),
  streamqueue = require('streamqueue'),
  sourcemaps = require('gulp-sourcemaps'),
  less = require('gulp-less'),
  lessReporter = require('gulp-less-reporter'),
  autoprefixer = require('gulp-autoprefixer'),
  csscomb = require('gulp-csscomb'),
  minifycss = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  runSequence = require('run-sequence').use(gulp);

/* Настройка деррикторий */
let projectPath = {
  build: {
    html: 'build/',
    js: 'build/js/',
    jsMainFile: 'script.js',
    css: 'build/css/',
    img: 'build/images/',
    fonts: 'build/fonts/'
  },
  src: {
    html: 'src/*.html',
    jsVendor: 'src/js/vendor.js',
    jsCustom: 'src/js/main.js',
    style: 'src/less/**/*.less',
    formats: ['src/images/*.png', 'src/images/*.jpg', 'src/images/*.svg'],
    fonts: 'src/fonts/*.*'
  },
  watch: {
    html: 'src/*.html',
    js: 'src/js/**/*.js',
    style: 'src/less/**/*.less',
    formats: 'src/images/*.*',
    fonts: 'src/fonts/*.*'
  },
  clean: ['build/**/*']
};

/* Конфигурация BrowserSync */
let config = {
  server: {
    baseDir: './build'
  },
  tunnel: true,
  host: 'localhost',
  port: 9000,
  injectChanges: true,
  logPrefix: 'gulp template'
};

/* BrowserSync*/
gulp.task('webserver', function() {
  browserSync(config);
});

gulp.task('js', function() {
  return streamqueue(
    { objectMode: true },
    gulp.src(projectPath.src.jsVendor).pipe(rigger()),
    gulp
      .src(projectPath.src.jsCustom)
      .pipe(rigger())
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
  )
    .pipe(concat(projectPath.build.jsMainFile))
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(projectPath.build.js))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(projectPath.build.js))
    .pipe(reload({ stream: true }));
});

gulp.task('html', function() {
  return gulp
    .src(projectPath.src.html)
    .pipe(gulp.dest(projectPath.build.html))
    .pipe(reload({ stream: true }));
});

gulp.task('less', function() {
  return gulp
    .src(projectPath.src.style)
    .pipe(sourcemaps.init())
    .pipe(concat('style.css'))
    .pipe(
      less({
        paths: [path.join(__dirname, 'less', 'includes')]
      })
    )
    .on('error', lessReporter)
    .pipe(autoprefixer('last 10 version'))
    .pipe(csscomb())
    .pipe(gulp.dest(projectPath.build.css))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(projectPath.build.css))
    .pipe(reload({ stream: true }));
});

gulp.task('images', function() {
  return gulp
    .src(projectPath.src.formats)
    .pipe(gulp.dest(projectPath.build.img))
    .pipe(reload({ stream: true }));
});

gulp.task('fonts', function() {
  return gulp
    .src(projectPath.src.fonts)
    .pipe(gulp.dest(projectPath.build.fonts))
    .pipe(reload({ stream: true }));
});

gulp.task('clean', function(cb) {
  del(projectPath.clean, cb);
});

gulp.task('build', function(callback) {
  runSequence('clean', 'html', 'fonts', 'less', 'images', 'js', callback);
});

gulp.task('watch', ['webserver'], function() {
  watch([projectPath.watch.js], function(event, cb) {
    gulp.start('js');
  });
  watch([projectPath.watch.style], function(event, cb) {
    gulp.start('less');
  });
  watch([projectPath.watch.html], function(event, cb) {
    gulp.start('html');
  });
  watch([projectPath.watch.fonts], function(event, cb) {
    gulp.start('fonts');
  });
  watch([projectPath.watch.formats], function(event, cb) {
    gulp.start('images');
  });
});

/* Базовый таск */
gulp.task('default', ['watch'], function() {});
