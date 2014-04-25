// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function($) {
    
    window.tt = function(selector, context) {
        var $obj = new $.fn.init(selector, context);

        return $.extend({}, $obj, {
            tooltip: function(options) {
                var notes = tt.core.getElementNotes($(this)),
                    tooltip,
                    edit_mode;
                
                // stick to one note per element
                for(var first_note in notes) if(notes.hasOwnProperty(first_note)) break; 
                edit_mode = (typeof first_note !== 'undefined'); 
                
                tooltip = tt.tooltip.open($.extend({}, { 
                    root: $(this),
                    editMode: edit_mode,
                    content: (edit_mode ? notes[first_note].content : '') 
                }, options));

                tooltip
                    .on('tt.btn.edit.click', function() {
                        tt.tooltip.edit(false);    
                    })
                    .on('tt.btn.submit.click', function() {
                        tt.tooltip.edit(true);

                        if(!edit_mode)
                            first_note = tt.core.addElementNote(tt.tooltip.root, tt.tooltip.content());
                        else
                            tt.core.editElementNote(tt.tooltip.root, first_note, tt.tooltip.content()); 
                        
                        tt.core.merge();
                    });
                
                return this;
            },
            init: function(options) {
                tt.core.init($.extend({}, { root: $(this) }, options));
                return this;
            }
        });
    };

})(window.jQuery);