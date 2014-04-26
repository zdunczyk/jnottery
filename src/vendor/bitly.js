// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {

    tt.vendor = $.extend(tt.vendor || {}, {
        bitly: function(long_url, callback) {
            if(this.bitlyReady()) {
                $.getJSON(
                    'https://api-ssl.bitly.com/v3/shorten',
                    {
                        format: 'json',
                        access_token: this.config.bitly.access_token,
                        longUrl: long_url 
                    },
                    function(response) {
                        if(response.status_code === 200)
                            callback(decodeURIComponent(response.data.url));
                    }
                );
            }    
        },
        bitlyReady: function() {
            return (typeof this.config !== 'undefined') && !!this.config.bitly.access_token;
        }
    });
    
})(window.tt, window.jQuery);