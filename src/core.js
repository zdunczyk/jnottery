// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {
    var str = rayson.type.str,
        raw = rayson.type.raw,
        int8 = rayson.type.int8;

    var TT_ELEMENT = 0;
   
    var pending_notes = {};
        
    function Note(type, content, params) {
        $.extend(this, {
            type: type,
            content: content,
            params: (typeof params === 'undefined' ? [] : params)
        });
    }
    
    function getUniqueId(n) {
        return Array.apply(null, Array(n)).map(function() {
            return (Math.random() * 16 | 0).toString(16);
        }).join('');
    }

    function getElementId(element) {
        return element.data('ttid');
    }

    function addElementNote(element, content, params) {
        var unique_id = getElementId(element),
            note_id = getUniqueId(8);
        
        if(typeof unique_id === 'undefined') {
            unique_id = getUniqueId(8);
            element.data('ttid', unique_id);
            element.addClass('ttid-' + unique_id);
        }

        if($.type(pending_notes[unique_id]) !== 'object')
            pending_notes[unique_id] = {};
       
        pending_notes[unique_id][note_id] = new Note(TT_ELEMENT, content, params);
        
        return note_id;
    }

    function hasElementNote(element, note_id) {
        var unique_id = getElementId(element);
    
        if(typeof pending_notes[unique_id] !== 'undefined' 
            && typeof pending_notes[unique_id][note_id] !== 'undefined') {
            
            return { element_id: unique_id, note_id: note_id }; 
        }

        return null;
    }
    
    tt.core = $.extend(tt.core || {}, {
        version: '0.1.0',
        
        // main Note object
        note: Note,
       
        deleteElementNote: function(element, note_id) {
            var idx = hasElementNote(element, note_id);
            
            if($.type(idx) === 'object')
                delete pending_notes[idx.element_id][idx.note_id];
        },
        addElementNote: function(element, content, params) {
            return addElementNote(element, content, params);
        },
        editElementNote: function(element, note_id, content, params) {
            var idx = hasElementNote(element, note_id),
                note;
        
            if($.type(idx) === 'object') {
                note = pending_notes[idx.element_id][idx.note_id];
                if(typeof content !== 'undefined')
                    note.content = content;

                if(typeof params !== 'undefined')
                    note.params = params;
            }
        },
        getElementNotes: function(element) {
            var unique_id = getElementId(element);
            
            if($.type(pending_notes[unique_id]) === 'object')
                return pending_notes[unique_id];
            
            return {}; 
        },
        init: function(options) {
            var hash_decoded,
                elements = [],
                note;
            
            if(window.location.hash !== '') {
                hash_decoded = rayson.b64.decode(window.location.hash.slice(1), Base64.decode);
                
                hash_decoded = rayson.unserialize(hash_decoded, {
                    // version of encoded data
                    version: str,
                    // encoded selectors
                    selectors: [ raw ],
                    // encoded notes
                    notes: [{
                        type: int8,
                        // index from selectors array
                        selector: int8,
                        content: str,
                        params: [ str ]
                    }]
                });
                
                for(var s = 0; s < hash_decoded.selectors.length; s++) {
                    elements.push($.xJQ(hash_decoded.selectors[s]));
                }
                
                for(var n = 0; n < hash_decoded.notes.length; n++) {
                    note = hash_decoded.notes[n];
                    
                    if(note.type === TT_ELEMENT) {
                        addElementNote(
                            elements[note.selector], 
                            note.content, 
                            note.params 
                        );
                    }
                }
            }
        },
        merge: function() {
            var selectors = [],
                current_selector,
                notes = [];
            
            if(!$.isEmptyObject(pending_notes)) {
                for(var unique_id in pending_notes) {
                    if(pending_notes.hasOwnProperty(unique_id)) {
                        current_selector = selectors.push($('.ttid-' + unique_id).xJQ()) - 1;
                        
                        for(var note_id in pending_notes[unique_id]) {
                            if(pending_notes[unique_id].hasOwnProperty(note_id)) {
                                var note = pending_notes[unique_id][note_id];
                                notes.push({
                                    type: note.type,
                                    selector: current_selector,
                                    content: note.content,
                                    params: note.params
                                });
                            }
                        }
                    }
                }
                
                window.location.hash = rayson.b64.encode(rayson.serialize({
                    version: tt.core.version,
                    selectors: selectors,
                    notes: notes 
                }, {
                    version: str,
                    selectors: raw,
                    type: int8,
                    selector: int8,
                    content: str,
                    params: str 
                }), Base64.encode);

                return true;
            }

            return false;
        }
    });

})(window.tt, window.jQuery);