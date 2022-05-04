const gulp = require('gulp'),
      sass = require('gulp-sass')(require('sass')),
      sourcemaps = require('gulp-sourcemaps'),
      watch = require('gulp-watch');

var source = './pages/scss/style.scss',
    target = './pages/css/_';

gulp.task('sass-compiler', function () {
    return gulp.src(source)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(target))
});

gulp.task('watch', function(){
    gulp.watch(source, gulp.series('sass-compiler'))
});
