module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: '*.js'
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		}
	});


	grunt.registerTask('default', ['jshint', 'karma']);

};
