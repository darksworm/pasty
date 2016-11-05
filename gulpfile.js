var gulp = require('gulp');
var sass = require('gulp-sass');
var minifycss = require('gulp-clean-css');

gulp.task('sass', function (){
    gulp.src(['./scss/*.scss'])
        .pipe(sass({
            includePaths: ['./scss/*']
        }))
       // .pipe(minifycss())
        .pipe(gulp.dest('./static'));
});