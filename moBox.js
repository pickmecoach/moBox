!(function(window){
	window.moBox = function(options) {
		var doc = document;

		function _getScrollBarWidth() {
			var el = document.createElement('div'),
			scrWidth;
			el.style.cssText = 'overflow: scroll; width: 100px; height: 100px; position:absolute; bottom: 100%';
			doc.body.appendChild(el);
			scrWidth = el.offsetWidth - el.clientWidth;
			doc.body.removeChild(el);
			return scrWidth + 'px';
		}

		function _getTransition() {
			var el = doc.createElement('div');
			return (el.style.WebkitTransition) ? "webkitTransitionEnd" : 'transitionend';
		}

		function _redefineDefaults(source, reSource) {
			var prop, ret = source;
			for (prop in reSource) {
				if (reSource.hasOwnProperty(prop)) {
					ret[prop] = reSource[prop];
				}
			}
			return ret;
		}

		function _initEvents() {
			if (this.closeButton) {
				this.closeButton.addEventListener('click', this.close.bind(this));
			}
			if (this.overlay) {
				this.overlay.addEventListener('click', this.close.bind(this));
			}
		}

		function _fadeOut(obj, callback) {
			var os = obj.style;
			os.opacity = 1;
			(function fn(){
				if ((os.opacity -= 0.2) > 0) {
					setTimeout(fn, 50);
				} else {
					os.display = 'none';
					if (callback && typeof callback === 'function') callback();
				}
			})()
		}

		function _fadeIn(obj, callback) {
			var os = obj.style;
			os.visibility = '';
			os.opacity = 0;
			(function fn(){
				if (( os.opacity = +os.opacity + 0.2) < 1) {
					setTimeout(fn, 50);
				} else {
					os.opacity = '';
					if (callback && typeof callback === 'function') callback();
				}
			})()
		}

		function _build() {
			var _content, 
			_contentWrapper,
			_panel,
			opts = this.options,
			modal = this.modal,
			container = this.container,
			cBtn = this.closeButton,
			ovlay = this.overlay;
			
			if (typeof opts.content === 'object') {
				_content = opts.content.innerHTML;
			} else {
				_content = opts.content;
			}
			container = doc.createElement('div');
			container.className = 'moBox';

			_panel = doc.createElement('div');
			_panel.className = 'moBox__panel';

			modal = doc.createElement('div');
			modal.className = 'moBox__modal moBox__modal_' + opts.modalType;
			modal.style.maxWidth = opts.maxWidth + 'px';
			modal.style.minWidth = opts.minWidth + 'px';
			modal.style.cssText = 'max-width: ' + opts.maxWidth + 'px; min-width: ' + opts.minWidth + 'px;';
			modal.appendChild(_panel);

			if (opts.closeButton === true) {
				cBtn = doc.createElement('button');
				cBtn.className = 'moBox__close';
				cBtn.innerHTML = 'x';
				modal.appendChild(cBtn);
			}

			_contentWrapper = doc.createElement('div');
			_contentWrapper.className = 'moBox__content';
			_contentWrapper.innerHTML = _content;
			modal.appendChild(_contentWrapper);

			if (opts.overlay === true) {
				ovlay = doc.createElement('div');
				ovlay.className = 'moBox__overlay moBox__overlay_' + opts.overlayType;
			}
			ovlay.appendChild(modal);
			container.appendChild(ovlay);
			this.modal = modal;
			this.container = container;
			this.closeButton = cBtn;
			this.overlay = ovlay;

			doc.body.appendChild(this.container);
		}

		var defaults = {
			modalType: 'fade',
			overlayType: 'fade',
			maxWidth: 600,
			minWidth: 280,
			overlay: true,
			content: '',
			closeButton: true,
			animation: true
		};

		function BigBoss() {
			this.modal = null;
			this.overlay = null;
			this.closeButton = null;
			this.container = null;
			this.transitionEnd = _getTransition();
			this.scrollBarWidth = _getScrollBarWidth();

			if (arguments[0] && typeof arguments[0] === 'object') {
				this.options = _redefineDefaults(defaults, arguments[0]);
			} else {
				this.options = defaults;
			}

			this.open = function() {
				_build.call(this);
				_initEvents.call(this);

				var m = this.modal,
				o = this.overlay;
				
				getComputedStyle(m).height;
				this.container.setAttribute('data-state', 'open');
				doc.body.style.cssText = 'overflow: hidden; padding-right: ' + this.scrollBarWidth + ';';
				if (m.offsetHeight > window.innerHeight) {
					m.setAttribute('data-anchored', '');
					o.style.overflow = 'auto';
				}
			};

			this.close = function(e) {
				e.stopPropagation();
				if (e.target !==  this.overlay && e.target !== this.closeButton) return;
				var m = this.modal,
				c = this.container,
				o = this.overlay;

				c.removeAttribute('data-state');

				if (!this.options.animation) {
					c.parentNode.removeChild(c);
				} else {
					o.addEventListener(this.transitionEnd, function(e) {
						if (e.target === this && doc.body.contains(c)) {
							e.stopImmediatePropagation();
							c.parentNode.removeChild(c);
							doc.body.style.cssText = '';
						}
					});
				}
			};
		}

		return new BigBoss(options);
	}
})(window);

