// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {

    tt.vendor = $.extend(tt.vendor || {}, {
        facebook: function(url) {
            window.open('https://www.facebook.com/sharer.php'
                + '?u=' + encodeURIComponent(url));
        }
    });
    
})(window.tt, window.jQuery);
