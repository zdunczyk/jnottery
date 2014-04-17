module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        tooltip: {
            views: 'src/tooltip/view/*.html',
            output: 'build/views'
        }
    });

    grunt.registerTask('tooltip', function() {
        
        grunt.file.expand(grunt.config('tooltip.views')).forEach(function(view) {
            var ext = view.lastIndexOf('.html'),
                last_slash = view.lastIndexOf('/'),
                fname = view.substr(last_slash + 1, ext - (last_slash + 1)),
                outname = grunt.config('tooltip.output') + '/' + fname + '.js';
      
            grunt.log.write('Saving `' + fname + '` view to ' + outname);
            grunt.file.write(outname,
                    'var ' + fname + '_view = \'' +
                        grunt.file.read(view).replace(/\s+/g, ' ') +
                    '\';'
            );
        });
    });
};


