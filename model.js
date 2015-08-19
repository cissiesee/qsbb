define(function(require) {
	require('backbone');

	QS.model = Backbone.Model.extend({
		initialize: function() {
			var self = this;
			//Backbone.Model.apply(this, arguments);
			if(_.isArray(this.children)) {
				this.children.map(function(child) {
					var model = new child.model(child.opts);
					model.key = self.key ? self.key += '.' + child.key : child.key;
					model.parent = self;

					if(model.type === 'collection') {
						_.each(model.models, function(item) {
							self._bubbleEvents(item, child.key);
						});
					} else {
						self._bubbleEvents(model, child.key);
					}
					self.set(child.key, model);
				});
			}
			if(this.init && typeof(this.init) === 'function') {
				this.init();
			}
			if(this.addListeners && typeof(this.addListeners) === 'function') {
				this.addListeners();
			}
		},
		_bubbleEvents: function(model, key) {
			var self = this;
			model.on('all', function(eventName) {
				var eventObj = eventName.split(':');
				var eventType = eventObj[0],
					eventField = key + (eventObj[1] ? '.' + eventObj[1] : '');

				var eventString = eventType + ':' + eventField;
				self.trigger(eventString, this);
			});
		},
		toObject: function() {
			var data = this.toJSON();
			this.children.forEach(function(child) {
				if(data[child.key].length) {
					data[child.key] = data[child.key].toJSON();
					return;
				}
				data[child.key] = data[child.key].toObject();
			});
			return data;
		},
		get: function(keys) {
			var target = this;
			var _keys = keys.split('.');
			if(_keys.length > 1) {
				for(var i = 0; i < _keys.length; i++) {
					target = target.get(_keys[i]);
					if(!target) {
						break;
					}
				}
				return target;
			}
			return Backbone.Model.prototype.get.apply(this, arguments);
		},
		//menus.type
		set: function() {
			var target = this, flag = true;
			//a.b only be accepted in set('a.b', value), not in set(object)
			//if you do set({'a.b': value}), result will be the natural result of backbone set method
			if(typeof arguments[0] === 'string') {
				var keys = arguments[0].split('.');
				if(keys.length > 1) {
					for(var i = 0; i < keys.length - 1; i++) {
						target = target.get(keys[i]);
						if(!target) {
							flag = false;
							break;
						}
					}
					if(flag) {
						if(!target.set) {
							QS.log('error', arguments[0] + 'is not a model!');
							return;
						}
						target.set(_.last(keys), arguments[1]);
					} else {
						QS.log('error', 'there is no ' + arguments[0] + 'in model!');
					}
					return;
				}
				Backbone.Model.prototype.set.apply(this, arguments);
				return;
			}
			Backbone.Model.prototype.set.apply(this, arguments);
		}
		// on: function(eventType, fn) {
		// 	Backbone.Model.on.apply(this, arguments);
		// 	this.children.forEach(function(child) {
		// 		self.get(child.key).on(eventType, fn);
		// 	});
		// }
	});

	QS.collection = Backbone.Collection.extend({});
})