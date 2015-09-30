var fs = require("fs");
var path = require('path')

module.exports = function(grunt) {

	// Project configuration.
	var fileHeaders = {
		"Project":'<%= pkg.name %> <%= pkg.version %> ',
		"Last dist":'<%= grunt.template.today("isoDateTime") %>',
		"ATTENTION MODDERS":'Do not bother trying to de-minify this code! The project is hosted on https://github.com/BTDev/BerryTube and contains the source files. Use those!',
	};
	var headerString = '';
	var hs = [];
	for(var header in fileHeaders){
		hs.push(header+": "+fileHeaders[header]);
	}
	headerString = '/*\r\n\t'+hs.join('\r\n\t')+'\r\n*/\n';

	var srcdir = 'www/src';
	var distdir = 'www/dist';

	var buildDate = new Date().getTime();

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			js: {
				src: [
					'www/src/js/main.js',
					'www/src/js/**/*.js',
					'!www/src/js/vendor/**/*.js',
				],
				dest: 'www/dist/js/main.js'
			},
		},
		uglify: {
			options: {
				mangle: false,
				banner: headerString
			},
			dist: {
				files: {
					'www/dist/js/main.min.js': ['www/dist/js/main.js'],
				},
				mangle: false,
				banner: headerString
			}
		},
		stylus: {
			compile: {
				options: { 
					banner: headerString
				},
				files: [{
					expand: true,
					cwd: srcdir,
					src: ['**/*.styl'],
					dest: distdir,
					ext: '.css'
				}]
			}
		},
		watch: {
			scripts: {
				files: [srcdir+'/**/*.js','!**/node_modules/**'],
				tasks: ['uglify'],
				options: {
				  livereload: true,
				}
			},
			stylus: {
				files: [srcdir+'/**/*.styl','src/**/*.css','!**/node_modules/**'],
				tasks: ['stylus'],
				options: {
				  livereload: true,
				}
			},
			jade: {
				files: [srcdir+'/**/*.jade','!**/node_modules/**'],
				tasks: ['jade'],
				options: {
				  livereload: true,
				}
			},
			copy: {
				files: [ srcdir+'/**', '!'+srcdir+'/**/*.styl', '!'+srcdir+'/**/*.css', '!'+srcdir+'/**/*.jade' ,'!**/node_modules/**'],
				tasks: ['copy'],
				options: {
				  event: ['changed'],
				},
				options: {
				  livereload: true,
				}
			},
			dist: {
				files: [ srcdir+'/**', '!'+srcdir+'/**/*.styl', '!'+srcdir+'/**/*.css', '!'+srcdir+'/**/*.jade' ,'!**/node_modules/**'],
				tasks: ['build'],
				options: {
				  event: ['added', 'deleted'],
				},
				options: {
				  livereload: true,
				}
			},
		},
		copy: {
			dist: {
				cwd: srcdir,
				src: [ 
					'**',
					'!**/*.styl',
					//'!**/*.css',
					'!**/*.jade',
					'!**/*.js',
					//'**/*.min.js',
					'!**/elements/**',
					'js/vendor/**/*.js',
					
				],
				dest: distdir,
				expand: true
			},
		},
		clean: {
			dist: {
				src: [ distdir ]
			},
		},
		svgmin: {                       // Task
			options: {                  // Configuration that will be passed directly to SVGO
				plugins: [{
					removeViewBox: false
				}, {
					removeUselessStrokeAndFill: false
				}, {
					cleanupIDs: false
				}, {
					convertPathData: { 
						straightCurves: false // advanced SVGO plugin option
					}
				}]
			},
			dist: {                     // Target
				files: [{               // Dictionary of files
					expand: true,       // Enable dynamic expansion.
					cwd: srcdir,     // Src matches are relative to this path.
					src: ['**/*.svg'],  // Actual pattern(s) to match.
					dest: distdir,       // Destination path prefix.
					ext: '.svg'     // Dest filepaths will have this extension.
					// ie: optimise img/src/branding/logo.svg and store it in img/branding/logo.min.svg
				}]
			}
		}
	});

	// Load the plugins.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-svgmin');
	
	// Default task(s).
	grunt.registerTask('default', "testing", function(){
		grunt.task.run('build');
		grunt.task.run('watch');
	});
	
	grunt.registerTask('build','Compiles all of the assets and copies the files to the dist directory.',function(){
		grunt.task.run('clean');
		grunt.task.run('concat');
		grunt.task.run('copy');
		grunt.task.run('uglify');
		grunt.task.run('stylus');
		grunt.task.run('svgmin');
	});

};