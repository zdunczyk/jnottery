// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function($) {
    
    window.tt = function(selector, context) {
        var $obj = new $.fn.init(selector, context);

        return $.extend({}, $obj, {
            tooltip: function(options) {
                var notes = tt.core.getElementNotes($(this)),
                    tooltip;
                
                // stick to one note per element
                for(var first_note in notes) if(notes.hasOwnProperty(first_note)) break; 
                
                tooltip = tt.tooltip.open($.extend({}, { 
                    root: $(this),
                    edit: first_note,
                    content: (!!first_note ? notes[first_note].content : ''),
                    init: function(tooltip) {

                        tooltip.on({
                            'btn.edit.click.tt': function() {
                                tt.tooltip.edit(false);    
                            },
                            'btn.submit.click.tt': function(e, tooltip) {
                                tt.tooltip.edit(true);
                                
                                if(!tooltip.edit)
                                    tooltip.edit = tt.core.addElementNote(tooltip.root, tt.tooltip.content());
                                else
                                    tt.core.editElementNote(tooltip.root, tooltip.edit, tt.tooltip.content()); 
                                
                                tt.core.updateHash();
                            },
                            'btn.facebook.click.tt': function() {
                                tt.vendor.facebook(document.URL);
                            },
                            'btn.twitter.click.tt': function() {
                                tt.vendor.bitly(document.URL, function(short_url) {
                                    tt.vendor.twitter(short_url);    
                                });
                            },
                            'btn.link.click.tt': function() {
                                tt.vendor.bitly(document.URL, function(short_url) {
                                    window.prompt('Here is link to this page containing your notes (Ctrl + C to save in clipboard)', short_url);  
                                });
                            },
                            'btn.save.click.tt': function() {
                                var agent = navigator.userAgent.toLowerCase(),
                                    letter = 'D';

                                if(window.opera && window.opera.version() < 9)
                                    letter = 'T';
                                else if(agent.indexOf('konqueror') !== -1)
                                    letter = 'B'; 

                                alert('Your notes are currently encoded in URL. Press ' + (agent.indexOf('mac') !== -1 ? 'Cmd' : 'Ctrl') + ' + ' + letter + ' to bookmark this page and all of your notes at once.');
                            }
                        });
                    }
                }, options));

                return this;
            },
            init: function(options) {
                if(!rangy.initialized)
                    rangy.init();
                
                tt.core.init($.extend({}, { root: $(this) }, options));

                if(options && options.vendor)
                    tt.vendor.init(options.vendor);

                return this;
            }
        });
    };

})(window.jQuery);