module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: [
				'src/main/webapp/js/*.js',
				'src/test/js/*.js',
				'Gruntfile.js'
			]
		},
		replace: {
			demo: {
				src: 'src/main/webapp/index.html',
				dest: 'target/grunt-webapp/demo.html',
				replacements: [{
					from: 'remote-model.js',
					to: 'localstorage-model.js'
				}]
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		}
	});


	grunt.registerTask('default', ['jshint', 'replace', 'karma']);

};
