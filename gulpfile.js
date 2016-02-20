var gulp = require('gulp'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	uglify = require('gulp-uglify'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),    
    nodemon = require('gulp-nodemon');

gulp.task('scripts', function(){
	gulp.src([
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

gulp.task('jade', function(){
	gulp.src('views/*.jade')
	.pipe(reload({stream: true}));
});

gulp.task('css', function(){
	gulp.src('public/css/styles.css')
	.pipe(reload({stream: true}));
});

gulp.task('browser-sync', ['nodemon'], function(){
	/*browserSync({
		server: {
			baseDir: "./public/"
		}
	});*/
    browserSync.init(null, {
		proxy: "http://localhost:3000",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000,
	});
   
});

gulp.task('watch', function(){
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