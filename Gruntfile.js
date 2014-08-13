var fs = require("fs");
var path = require('path')

module.exports = function(grunt) {

	// Project configuration.
	var fileHeaders = {
		"Project":'<%= pkg.name %> <%= pkg.version %> ',
		"Last dist":'<%= grunt.template.today("isoDateTime") %>',
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
					'www/src/js/vendor/jquery.js',
					'www/src/js/vendor/jquery-ui.js',
					'www/src/js/*.js',
				],
				dest: 'www/dist/js/site.js'
			},
		},
		uglify: {
			options: {
				mangle: false,
				banner: headerString
			},
			dist: {
				files: {
					'www/dist/js/site.min.js': ['www/dist/js/site.js']
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
					
				],
				dest: distdir,
				expand: true
			},
		},
		clean: {
			dist: {
				src: [ distdir ]
			},
		}
	});

	// Load the plugins.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
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
	});

};