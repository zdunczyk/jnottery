// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {
    var str = rayson.type.str,
        int8 = rayson.type.int8,
        int32 = rayson.type.int32;

    function extend(parent, child) {
        var pty = function() {};
        pty.prototype = parent.prototype;
        child.prototype = new pty();
        child.prototype.constructor = child;
        return child;
    }

    function Note(element, content, params) {
        $.extend(this, {
            element: element,
            content: content,
            params: (typeof params === 'undefined' ? [] : params),
            id: null
        });
    }

    Note.prototype = {
        save: function() {
            if(this.id === null) {
                var unique_id = tt.core.getElementId(this.element),
                    note_id = tt.core.getUniqueId(8);
                
                if(typeof unique_id === 'undefined') {
                    unique_id = tt.core.getUniqueId(8);
                    this.element.data(tt.core.ID_PREFIX, unique_id);
                    this.element.addClass(tt.core.ID_PREFIX + '-' + unique_id);
                }

                if($.type(tt.core.pendingNotes[unique_id]) !== 'object')
                    tt.core.pendingNotes[unique_id] = {};
              
                this.id = note_id;
                tt.core.pendingNotes[unique_id][note_id] = this;
            }

            return this.id;
        },
        remove: function() {
            var element_id = tt.core.getElementId(this.element);
            
            if(this.id !== null && typeof element_id !== 'undefined')
                delete tt.core.pendingNotes[element_id][this.id];
        },
        values: function() {
            return {
                content: this.content,
                params: this.params
            };    
        },
        setContent: function(txt) {
            this.content = txt;
        },
        getContent: function() {
            return this.content;
        }
    };
       
    Note.template = {
        selector: int8,
        content: str,
        params: [ str ]
    };

    Note.templateOrder = [ 'selector', 'content', 'params' ];

    var ElementNote = extend(Note, function(element, content, params) {
        Note.call(this, element, content, params);        
    });

    ElementNote.template = Note.template;
    ElementNote.templateOrder = Note.templateOrder;

    var SelectionNote = extend(Note, function(element, range, content, params) {
        Note.call(this, element, content, params); 
        this.range = range;
    });

    SelectionNote.prototype.values = function() {
        var selection = tt.range.serialize(this.element, this.range);
        return {
            selection: (selection ? [ selection.start, selection.end ] : []),
            content: this.content,
            params: this.params
        };    
    };
    
    SelectionNote.template = $.extend(Note.template, {
        selection: [ int32 ]        
    });            
    
    SelectionNote.templateOrder = Note.templateOrder.concat([ 'selection' ]);
    
    tt.core = $.extend(tt.core || {}, {
        Note: Note,
        ElementNote: ElementNote,
        SelectionNote: SelectionNote,

        valuesTypes: function(note_class) {
            var result = {};
            
            note_class.template && $.each(note_class.template, function(n, val) {
                result[n] = val;

                if($.isArray(result[n])) 
                    result[n] = result[n][0];
            });
            
            return result;
        }
    });
    
})(window.tt, window.jQuery);