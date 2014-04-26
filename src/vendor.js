// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {

    tt.vendor = $.extend(tt.vendor || {}, {
        config: {},
        init: function(options) {
            this.config = $.extend({
                bitly: {
                    access_token: false    
                }
            }, options);
        }
    });
    
})(window.tt, window.jQuery);