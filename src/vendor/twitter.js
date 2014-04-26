// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {

    tt.vendor = $.extend(tt.vendor || {}, {
        twitter: function(url) {
            var text = (typeof this.config !== 'undefined') ? this.config.twitter.text : '';

            window.open('https://twitter.com/share'
                + '?url=' + encodeURIComponent(url)
                + '&text=' + encodeURIComponent(text));      
        }
    });
    
})(window.tt, window.jQuery);