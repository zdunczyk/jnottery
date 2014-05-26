jNottery
========
jNottery is a jQuery plugin that lets you add notes and markers to webpages. 
All the data is encoded as a part of an URL which makes it easy to share or save.

The library consists of 3 independent modules:

- core: hash encoder/decoder, notes manager
- tooltip: fully styled tooltip designed to be comaptible with core
- vendor: connectors with external services 

Current version is marked as pre-alpha and might be unstable.

For more info go to [jnottery.com](http://jnottery.com).

Uses
====
- [0xJQ](https://github.com/zdunczyk/0xJQ)
- [js-base64](https://github.com/dankogai/js-base64)
- [nano](https://github.com/trix/nano)
- [rangy](http://code.google.com/p/rangy/)
- [rayson](https://github.com/zdunczyk/rayson)
- [Modern UI Icons](http://modernuiicons.com/)

TODO
====
- custom note params
- serializing forms content
- support for standalone markers - make notes optional 
- add autosize plugin to tooltip's input
- support for nested selectable blocks
- optimization, cut down the library size
- support for multiple independent tooltips
- UX improvements - allow user to choose whether one or all notes on webpage will be shared
- multiple notes for single element or selection
- refactor note-selection bindings
- fix security vulnerabilities - add protection from code injection
- prepare framework for building custom tooltips