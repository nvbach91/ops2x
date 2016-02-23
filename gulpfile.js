var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

gulp.task('scripts', function () {
    gulp.src([
        'src/js/App.js',
        'src/js/detectmobilebrowser.js',
        'src/js/scanner.js',
        'src/js/functions.js',
        'src/js/Item.js',
        'src/js/main.js'
    ]).pipe(plumber())
            .pipe(concat('build.js'))
            //.pipe(rename({suffix:'.min'}))
            //.pipe(uglify())
            .pipe(gulp.dest('public/js'))
            .pipe(reload({stream: true}));
});

gulp.task('jade', function () {
    gulp.src('views/*.jade')
            .pipe(reload({stream: true}));
});

gulp.task('css', function () {
    gulp.src('public/css/styles.css')
            .pipe(reload({stream: true}));
});

gulp.task('browser-sync', ['nodemon'], function () {
    /*browserSync({
     server: {
     baseDir: "./public/"
     }
     });*/
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000
    });

});

gulp.task('watch', function () {
    gulp.watch('src/js/*.js', ['scripts']);
    gulp.watch('views/*.jade', ['jade']);
    gulp.watch('public/css/styles.css', ['css']);
});

gulp.task('nodemon', function (cb) {
    var started = false;
    nodemon({
        script: 'bin/www',
        ignore: ['src/js/*.js', 'public/js/build.js']
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task('default', ['scripts', 'css', 'browser-sync', 'watch']);
