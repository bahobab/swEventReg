//gulp file
'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var watch = require('gulp-watch');
var eslint = require('gulp-eslint');
// var jasmine = require('gulp-jasmine-phantom');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');


	///////// sub-task to kick off browserSync in dev /////////////
gulp.task('bs', function () {
	browserSync.init({
		server: 'dist/'
	});
	browserSync.stream();
});

	///////// taks for dev ///////////////////////
gulp.task('default', ['bs'], function(){
	gulp.watch('app/sass/**/*.scss', ['styles']);
	gulp.watch('app/js/**/*.js', ['script']);
	// gulp.watch('app/js/**/*.js', ['lint']);
	gulp.watch('app/index.html').on('change', browserSync.reload);
});

	////////// run the 2 major dev tasks  /////////
gulp.task('dev',
	[
		'script',
		'styles'
	]);

	//////////// sub-tasks for dev /////////////
gulp.task('script', function(){
	gulp.src('app/js/**/*.js')
	// .pipe(babel())
	// .pipe(sourcemaps.init())
	.pipe(concat('all.js')) 
	.pipe(gulp.dest('app/'));
});

	////////// sub-task for dev ///////////////////
gulp.task('styles', function(){
	gulp.src('app/sass/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browser: ['last 2 versions']
	}))
	.pipe(concat('all.css'))
	.pipe(gulp.dest('app/css/'));
});

	//////////// run tasks for final deployment
gulp.task('dist',
	[
		'dist-html',
		'dist-styles',
		'dist-img',
//		'lint',
		'dist-script'
	]);

	////////// sub-task for deployment /////////////
gulp.task('dist-styles', function(){
	gulp.src('app/sass/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browser: ['last 2 versions']
	}))
	.pipe(concat('all.css'))
	.pipe(gulp.dest('dist/css/'));
});

	//////////// sub-task for deployment ////////
gulp.task('dist-script', function(){
	gulp.src('app/js/**/*.js')
	// .pipe(babel())
	// .pipe(sourcemaps.init())
	.pipe(concat('all.js')) 
	.pipe(uglify())
	.pipe(gulp.dest('dist/'));
});

	//////////// sub-task for deployment ///////
gulp.task('dist-html', function(){
	gulp.src('app/**/*.html')
	.pipe(gulp.dest('dist/'));
});

	//////////// sub-task for deployment ///////
gulp.task('dist-img', function() {
	gulp.src('app/img/*')
	.pipe(gulp.dest('dist/img/'));
});


	//////////// sub-task for dev - did not run task for this project. Lint active in editor//////////
// gulp.task('lint', function(){
// 	gulp.src('app/js/eventApp.js')
// 	.pipe(eslint())
// //	.pipe(eslint.format());
// 	 .pipe(eslint.failOnError()); // errors on $, says undefined!!!!
// });


