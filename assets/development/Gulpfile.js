const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const scssFiles = 'scss/**/*.scss';
const minify = require('gulp-minify-css');

var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed'
};

var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%', 'Firefox ESR', 'safari > 5', 'IE > 7']
};

var onError = function (err) {
    console.log(err);
};

gulp.task('scss', function() {
    return gulp.src([scssFiles, 'css/**/*'])
        .pipe(sass(sassOptions))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(concat('main.css'))
        .pipe(minify())
        .pipe(gulp.dest('../css'));

});

gulp.task('js', function(){
    gulp.src(['js/**/*.js']).pipe(gulp.dest('../js'));
});

gulp.task('default', ['scss', 'js'], function() {
    gulp.watch('scss/**/*.scss',['scss', 'js']);
});
