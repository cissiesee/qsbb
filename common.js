/*common method*/
define(function(require) {
	//require('jquery.min');
	//require('juicer');
	//require('bootstrap');
	//require('lodash.min');
	//require('backbone-min');
	//require('requirecss');
	//require('es5-shim');
	//require('underscore');
	require('./extend/jquery_extend');
	require('./extend/string_extend');
	//require('./panel');
	require('./view');
	require('./model');
	//require('./qs.js');

	function dispatcher() {
		var eventCallbacks = {};
		for(var i = 0; i < arguments.length; i++) {
			eventCallbacks[arguments[i]] = [];//new Backbone.Collection();
		}
		return {
			source: eventCallbacks,
			on: function(eventName, fn, context) {
				if(!eventCallbacks[eventName]) {
					throw new Error('event type: ' + eventName + ' must be registered in common.js!');
				}
				eventCallbacks[eventName].push({
					context: context,
					callback: fn
				});
			},
			trigger: function(eventName, args) {
				args = args || [];
				var length = eventCallbacks[eventName].length;
				for(var j = 0; j < length; j++) {
					var current = eventCallbacks[eventName][j];
					current.callback.apply(current.context, args);
				}
			},
			off: function(eventName, fn, context) {
				//TODO eventName and fn is not undefined
				_.each(eventCallbacks, function(callbacks, eventName) {
					_.remove(callbacks, function(callback) {
						callback.context === context;
					});
				});
			}
		};
	};

	//原型继承方法
	function extend(obj, extendObj) {
		extendObj = extendObj || {};
		var _f = function(opts) {
			_.extend(this, opts);
		};
		//这句是原型式继承最核心的地方，函数的原型对象为对象字面量
		_f.prototype = obj;
		return new _f(extendObj);
	}

	function makeAttributes(name, attributes) {
		return _.extend({}, attributes, {name: name});
	}

	function log(type, text) {
		if(!console in window) {
			return;
		}
		switch(type) {
			case 'error':
				console.log('%c' + 'Error: ' + text, 'color:red');
				break;
			case 'success':
				console.log('%c' + text, 'color:green');
				break;
			case 'warn':
				console.log('%c' + text, 'color:yellow');
				break;
			default:
				console.log(text);
		}
	}

	/*var qsPro = {
		set: function(clasName, clas) {
			if(this[clasName]) {
				throw new Error(this.type + ': ' + clasName + ' is already existed!');
			}
			this[clasName] = clas;
		},
		get: function(clasName) {
			if(!this[clasName]) {
				throw new Error(this.type + ': ' + clasName + ' is not exist!');
			}
			return this[clasName];
		},
		remove: function(clasName) {
			delete this[clasName];
		},
		removeAll: function() {
			return;
			_.each(this, function(v, k){
				delete this[this.type][k];
			});
		}
	}*/

	_.extend(QS, {
		dispatcher: dispatcher(
			'LOADED',
			'BEFORE_DIAL',
			'DIALING',
			'VIDEO_WAITING',
			'VIDEO_READY',
			'VIDEO_FAILED',
			'VIDEO_GET',
			'VIDEO_STOP',
			'CONTACT_ADD',
			'CONTACT_REMOVE',
			'DESKTOP_READY',
			'DOC_READY',
			'BOARD_READY',
			'OPEN_SOUNDTIP',
			'MENU_EXPAND',
			'MENU_COLLAPSE'
		),// more event types need to be added
			//all single element be managered here
		elements: {},//extend(qsPro),
		//all composite component be mangered here, component is composed of elements
		//panels: {},//extend(qsPro),
		//all model managered here
		models: {},//extend(qsPro),
		version: '3.0',
		animateDuration: 600,
		extend: extend,
		log: log,
		createElement: function(name, attributes) {
			attributes = makeAttributes(name, attributes);
			if(QS.elements[name]) {
				throw new Error('element: ' + name + ' is already existed!');
			}
			QS.elements[name] = QS.view.extend(attributes);
			return QS.elements[name];
		},
		getElement: function(name) {
			if(!QS.elements[name]) {
				throw new Error('element: ' + name + ' is not exist!');
			}
			return QS.elements[name];
		},
		createModel: function(name, attributes, collection) {
			attributes = makeAttributes(name, attributes);
			if(QS.models[name]) {
				throw new Error('model: ' + name + ' is already existed!');
			}
			QS.models[name] = attributes.type === 'collection' ? QS.collection.extend(attributes) : QS.model.extend(attributes);
			return QS.models[name];
		},
		getModel: function(name) {
			if(!QS.models[name]) {
				throw new Error('model: ' + name + ' is not exist!');
			}
			return QS.models[name];
		}
		/*createPanel: function(name, attributes) {
			attributes = makeAttributes(name, attributes);
			if(QS.panels[name]) {
				throw new Error('panel: ' + name + ' is already existed!');
			}
			QS.panels[name] = extend(QS.panel, attributes);//QS.model.extend(attributes);
			return QS.panels[name];
		},
		getPanel: function(name) {
			if(!QS.panels[name]) {
				throw new Error('panel: ' + name + ' is not exist!');
			}
			return QS.panels[name];
		}*/
	});
});