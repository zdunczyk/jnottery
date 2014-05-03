module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        lib_name: 'jnottery-v<%= pkg.version %>', 
        full_name: 'jnottery-full-v<%= pkg.version %>',
        nano_name: 'nano',
        base64_name: 'base64', 
        view_build_dir: 'build/views',
        lib_banner:'\
\
// <%= pkg.name %> library \n\
// Copyright (c) 2014, <%= pkg.author %> <tomasz@zdunczyk.org> \n\
// Released under the <%= pkg.license %> license. \n\
\
        \n',
        tooltip: {
            views: 'src/tooltip/view/*.html',
            output: '<%= view_build_dir %>'
        },
        concat: {
            full: {
                options: {
                    separator: '\n\n',
                    banner: '\
\
// <%= pkg.name %> Full Release \n\
// Parts of this code are written, and maintained by diffrent authors, see copyright notes below. \n\
// Copyright (c) 2014, <%= pkg.author %> <tomasz@zdunczyk.org> \n\
// @see <%= pkg.homepage %> \n\
// The library itself and all of its dependencies are released under the <%= pkg.license %> license. \n\
// Requires jQuery, other dependencies included. \n\
\
                    \n'
                },
                src: [ 
                    'libs/0xJQ/release/xJQ.min.js', 
                    'libs/rangy/rangy-core.js',
                    'libs/rangy/rangy-cssclassapplier.js',
                    'libs/rayson/release/rayson.min.js',
                    'build/<%= base64_name %>.min.js',
                    'build/<%= nano_name %>.min.js',
                    'build/<%= lib_name %>.min.js' 
                ],
                dest: 'build/<%= full_name %>.js'
            },
            lib: {
                options: {
                    separator: ';',
                    banner: '<%= lib_banner %>(function() { \n',
                    footer: '\n })();'
                },
                src: [
                    '<%= view_build_dir %>/main.js',
                    'src/tt.js',
                    'src/core.js',
                    'src/tooltip.js',
                    'src/range.js',
                    'src/vendor.js',
                    'src/core/*.js',
                    'src/tooltip/*.js',
                    'src/vendor/*.js'
                ],
                dest: 'build/<%= lib_name %>.js'
            }
        },
        uglify: {
            lib: {
                options: {
                    banner: '<%= lib_banner %>'
                },
                files: {
                    'build/<%= lib_name %>.min.js': [ '<%= concat.lib.dest %>' ]
                }    
            },
            nano: {
                options: {
                    banner: '/* Nano Templates (Tomasz Mazur, Jacek Becela) */ \n'
                },
                files: {
                    'build/<%= nano_name %>.min.js': [ 'libs/nano/<%= nano_name %>.js' ]
                } 
            },
            base64: {
                options: {
                    banner: '// $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $\n',
                    beautify: {
                        ascii_only: true
                    }
                },
                files: {
                    'build/<%= base64_name %>.min.js': [ 'libs/js-base64/<%= base64_name %>.js' ]
                }
            }
        },
        copy: {
            css: {
                src: 'src/tooltip/css/main.css',
                dest: 'build/<%= lib_name %>.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');

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

    grunt.registerTask('lib', [ 'tooltip', 'concat:lib', 'uglify:lib', 'copy:css' ]);
    grunt.registerTask('full', [ 'lib', 'uglify:nano', 'uglify:base64', 'concat:full' ]);
};


