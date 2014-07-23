var fs = require("fs");
var path = require('path')

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				mangle: false,
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> get fucking r3kt */\n'
			},
			build: {
				src: 'src/js/<%= pkg.name %>.js',
				dest: 'build/js/<%= pkg.name %>.min.js'
			}
		},
		stylus: {
			compile: {
				options: {
				
				},
				files: [{
					expand: true,
					cwd: 'src',
					src: ['**/*.styl'],
					dest: 'build',
					ext: '.css'
				}]
			}
		},
		watch: {
			scripts: {
				files: '**/*.js',
				tasks: ['uglify']
			},
			stylus: {
				files: '**/*.styl',
				tasks: ['stylus']
			},
			jade: {
				files: '**/*.jade',
				tasks: ['jade']
			},
			copy: {
				files: [ 'src/**', '!src/**/*.styl', '!src/**/*.css', '!src/**/*.jade' ],
				tasks: ['copy']
			},
		},
		copy: {
			build: {
				cwd: 'src',
				src: [ 
					'**',
					'!**/*.styl',
					'!**/*.css',
					'!**/*.jade' 
				],
				dest: 'build',
				expand: true
			},
		},
		clean: {
			build: {
				src: [ 'build' ]
			},
		},
		jade: {
			compile: {
				options: {
					data: function(dest,src){
						var data = [];
						
						var scripts = []
						var jsFiles = fs.readdirSync("src/js/");
						for(var i in jsFiles){
							scripts.push({
								src:'js/' + path.basename(jsFiles[i],path.extname(jsFiles[i])) + '.min.js'
							})
						}
						
						var stylesheets = []
						var jsFiles = fs.readdirSync("src/css/");
						for(var i in jsFiles){
							stylesheets.push({
								href:'css/' + path.basename(jsFiles[i],path.extname(jsFiles[i])) + '.css'
							})
						}
						
						data.scripts = scripts;
						data.stylesheets = stylesheets;
						return data;
					},
				},
				files: [{
					expand: true,
					cwd: 'src',
					src: [ '**/*.jade' ],
					dest: 'build',
					ext: '.html'
				}]
			}
		},
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
		grunt.task.run('build');
		grunt.task.run('watch');
	});
	
	grunt.registerTask('build','Compiles all of the assets and copies the files to the build directory.', [ 'clean', 'copy', 'uglify', 'stylus', 'jade' ]);

};