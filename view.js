define(function(require) {
	require('backbone');
	require('juicer');
	//require('model');

	QS.view = Backbone.View.extend({
		initialize: function(opts) {
			var self = this;

			if(!this.name) {
				console.log('element need a name!');
			}
			//only support rendered, title, type, props

			//type: determin which state to be used
			_.extend(this, _.pick(opts, ['rendered', 'type', 'props', 'transition']));

			//if model is not set, init a default one
			if(!this.model) {
				this.model = QS.createModel(this.name);
			}

			if(this.props) {
				_.each(this.props, function(value, key) {
					if(key.match(/^qs-/)) {
						delete self.props[key];
					}
				});
			}

			if(this.init && typeof(this.init) === 'function') {
				this.init(opts);
			}
			
			if(this.addListeners && typeof(this.addListeners) === 'function') {
				this.addListeners();
			}
			if(this.modelEvents) {
				this.makeModelEvents();
			}
			if(this.dispatcherEvents) {
				this.makeDispatcherEvents();
			}

			//this.events = _.extend({}, this.events, this.viewListeners);
			//this.children = [];
		},
		setPanel: function(panel) {
			this._panel = panel;
		},
		getPanel: function() {
			return this._panel;
		},
		setState: function(state) {
			/*if(this.state === state) {
				return;
			}*/
			this.preState = this.state;
			this.state = state;
			//this.template = this['template' + state];
			this.render();
		},
		getTemplate: function() {
			return this['template' + (this.state || '')];
		},
		listenToGlobal: function(eventsString, fn) {
			var dispatcher = QS.dispatcher;
			dispatcher.on(eventsString, fn, this);
		},
		stopListeningGlobal: function() {
			var dispatcher = QS.dispatcher;
			dispatcher.off(null, null, this);
		},
		//'change:model change:layout destroy': function() {}
		makeModelEvents: function() {
			var self = this;
			if(!this.model) {
				console.log("model hasn't been set, listeners can't be added!");
				return;
			}

			var events = this._modelEvents = this.makeEvents(this.modelEvents);

			_.each(events, function(fn, eventsString) {
				self.listenTo(self.model, eventsString, fn);
			});
		},
		makeDispatcherEvents: function() {
			var self = this;
			var dispatcher = QS.dispatcher;

			var events = this._dispatcherEvents = this.makeEvents(this.dispatcherEvents);

			_.each(events, function(fn, eventsString) {
				self.listenToGlobal(eventsString, fn);
			});
		},
		makeEvents: function(events) {
			var self = this;
			_.each(events, function(fn, eventsString) {
				var callback;
				if(typeof fn === 'function') {
					callback = fn;
				}
				if(typeof fn === 'string' && typeof self[fn] === 'function') {
					callback = self[fn];
				}
				if(!callback) {
					QS.log('error', 'listener"' + eventsString + '" has an illegal callback!');
					delete events[eventsString];
					return;
				}
				events[eventsString] = callback;
			});
			return events;
		},
		compile: function() {
			var self = this;
				templateName = 'template' + (this.state || ''),
				template = this[templateName];

			if(template === undefined) {
				throw new Error(templateName + ' in ' + this.name + ' is not exsited!');
			}
			
			if(template.render) {
				return template;
			}

			if(typeof(template) === 'function') {
				template = _.bind(template, this)();
			}

			if(typeof(template) === 'string') {
				this.templateStr = template;
				this[templateName] = juicer(this.templateStr);
				return this[templateName];
			}
			console.log('warn: template must be string or a function return a string or juicer tpl!');
		},
		destroy: function() {
			var self = this;
			if(this.elements) {
				this.elements.forEach(function(element) {
					element.destroy();
				});
			}
			this.remove();
			this.stopListeningGlobal();
		},
		on: function(type, fn) {

		},
		parse: function(data) {
			//console.log(data.toObject());
			return data.attributes;
		},
		render: function() {
			var _data = this.model;
			var self = this;
			// if(!_data) {
			// 	throw new Error(this.className + 'should connect with model!');
			// }
			if(_data && this.parse && typeof(this.parse) === 'function') {
				_data = this.parse(_data);
			}

			var template = this.compile();

			this.$el
				.css(this.style || {})
				.html(template.render(_data));
				
			this.renderTags();

			if(this.rendered && typeof(this.rendered) === 'function') {
				this.rendered();
			}

			if(this.transition && typeof(this.transition) === 'function') {
				this.$el.css({
					visibility: 'hidden'
				});
				_.delay(function() {
					self.transition();
					self.$el.css({
						visibility: 'visible'
					});
				}, 0);
			}

			return this;
		},
		/**
		  * <div qs-view="PanelExampleTest2" test="1"></div>
		  */
		renderTags: function() {
			var self = this;
			var tagAttr = 'qs-element';
			var $targets = this.$el.find('[' + tagAttr + ']');

			if(this.elements) {
				this.elements.forEach(function(element) {
					element.destroy();
				});
			}
			this.elements = [];
			$targets.each(function(i, target) {
				var $target = $(target),
					name = $target.attr(tagAttr);
					opts = {
						model: self.model,
						props: $target.attributes()
					};
					//targetObj = {};
				//var $parent = $target.parent();
				//targetObj = {$target: $target, view: QS.elements[$target.attr('qs-view')], opts: $target.attributes()};

				var clas = QS.getElement(name);

				var childIns = new clas(opts);
				childIns.parent = self;
				$target.replaceWith(childIns.$el);
				childIns.render();
				self.elements.push(childIns);
			});
		}
	})
});