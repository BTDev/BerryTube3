// Core
var gulp = require('gulp');
// Lib
var gutil = require('gulp-util');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
// Tools
var pkg = require('./package.json');
var path = require('path');

function sourcePath(){
	var args = Array.prototype.slice.call(arguments);
	args.unshift('.','www','src');
	return path.join.apply(null,args);
}

function buildPath(){
	var args = Array.prototype.slice.call(arguments);
	args.unshift('.','www','dist');
	return path.join.apply(null,args);
}

gulp.task('javascript', function (done) {
	return gulp.src([
		sourcePath('js','vendor','**','*.js'), 
		sourcePath('js','main.js'),
		sourcePath('js','**','*.js'),
	])
		.pipe(concat('main.js'))
		.pipe(gulp.dest(buildPath('js')));
});

gulp.task('stylus', function (done) {
	return gulp.src(sourcePath('css','*.styl'))
		.pipe(concat('main.styl'))
		.pipe(stylus({ compress: true }))
		.pipe(gulp.dest(buildPath('css')));
});

gulp.task('copy:images', function () {
	return gulp.src(sourcePath('img','**','*.*'))
		.pipe(gulp.dest(buildPath('img')));
});

gulp.task('copy:theme', function (done) {
	// Copy all but...
	var stylSrc = sourcePath('css','themes','**','*.styl');
	var stylDist = buildPath('css','themes');
	var jsSrc = sourcePath('css','themes','**','*.js');
	var jsDist = buildPath('css','themes');
	
	gulp.src([
			sourcePath('css','themes','**','*.*'),
			'!'+stylSrc,
			'!'+jsSrc,
		])
		.pipe(gulp.dest(buildPath('css','themes')));
	
	// Render stylus
	gulp.src(stylSrc)
		.pipe(stylus({ compress: true }))
		.pipe(gulp.dest(stylDist));
		
	// Uglify JS
	gulp.src(jsSrc)
		.pipe(gulp.dest(jsDist));
	
	done();
});

gulp.task('watch', function () {
    watch(sourcePath("**"), function() { gulp.start('build'); });
});

gulp.task('build', ['stylus','javascript','copy:images','copy:theme']);

gulp.task('default', ['build','watch'],function(){
	gutil.log("\n\nReady to go! Now watching.\n");
});