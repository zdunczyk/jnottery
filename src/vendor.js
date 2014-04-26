// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {

    tt.vendor = $.extend(tt.vendor || {}, {
        config: undefined,
        init: function(options) {
            this.config = $.extend({
                bitly: {
                    access_token: false    
                },
                twitter: {
                    text: 'Check my notes on ' + document.title 
                }
            }, options);
        }
    });
    
})(window.tt, window.jQuery);