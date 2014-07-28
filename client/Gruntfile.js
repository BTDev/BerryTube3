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

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				mangle: false,
				banner: headerString
			},
			dist: {
				files: [{
					src: 'js/**/*.js', 
					expand: true,
					cwd: 'src',
					dest: 'dist',
					ext:".min.js",
				}],
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
					cwd: 'src',
					src: ['**/*.styl'],
					dest: 'dist',
					ext: '.css'
				}]
			}
		},
		watch: {
			scripts: {
				files: ['src/**/*.js','!**/node_modules/**'],
				tasks: ['uglify'],
			    options: {
			      livereload: true,
			    }
			},
			stylus: {
				files: ['src/**/*.styl','src/**/*.css','!**/node_modules/**'],
				tasks: ['stylus'],
			    options: {
			      livereload: true,
			    }
			},
			jade: {
				files: ['src/**/*.jade','!**/node_modules/**'],
				tasks: ['jade'],
			    options: {
			      livereload: true,
			    }
			},
			copy: {
				files: [ 'src/**', '!src/**/*.styl', '!src/**/*.css', '!src/**/*.jade' ,'!**/node_modules/**'],
				tasks: ['copy'],
				options: {
			      event: ['changed'],
			    },
			    options: {
			      livereload: true,
			    }
			},
			dist: {
				files: [ 'src/**', '!src/**/*.styl', '!src/**/*.css', '!src/**/*.jade' ,'!**/node_modules/**'],
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
				cwd: 'src',
				src: [ 
					'**',
					'!**/*.styl',
					//'!**/*.css',
					'!**/*.jade',
					'!**/*.js',
					//'**/*.min.js',
					'!**/elements/**'
				],
				dest: 'dist',
				expand: true
			},
		},
		clean: {
			dist: {
				src: [ 'dist' ]
			},
		},
		jade: {
			compile: {
				options: {
					data: function(dest,src){
						var data = [];

						var scripts = []
						var cwd = "src/js/";
						var jsFiles = fs.readdirSync(cwd);
						for(var i in jsFiles){
							if(fs.lstatSync(cwd+jsFiles[i]).isFile()){
								scripts.push({
									src:'js/' + path.basename(jsFiles[i],path.extname(jsFiles[i])) + '.min.js'
								})
							}
						}
						
						var stylesheets = []
						var cwd = "src/css/";
						var jsFiles = fs.readdirSync(cwd);
						for(var i in jsFiles){
							if(fs.lstatSync(cwd+jsFiles[i]).isFile()){
								stylesheets.push({
									href:'css/' + path.basename(jsFiles[i],path.extname(jsFiles[i])) + '.css'
								})
							}
						}
						
						data.scripts = scripts;
						data.stylesheets = stylesheets;
						return data;
					},
				},
				files: [{
					expand: true,
					cwd: 'src',
					src: [ '**/*.jade', '!**/elements/**' ],
					dest: 'dist',
					ext: '.html'
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
	grunt.loadNpmTasks('grunt-contrib-jade');
	
	// Default task(s).
	grunt.registerTask('default', "testing",function(){
		grunt.task.run('host');
		grunt.task.run('build');
		grunt.task.run('watch');
	});
	
	grunt.registerTask('host','starts an express server.', function(){
		var express = require('express');
		var app = express();
		app.use(express.static(__dirname + '/dist'));
		app.listen(process.env.PORT || 3000);
	});

	grunt.registerTask('build','Compiles all of the assets and copies the files to the dist directory.', [ 'clean', 'copy', 'uglify', 'stylus', 'jade' ]);

};