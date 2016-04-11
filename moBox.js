!(function(window) {
	window.moBox = function(opts) {

		/*
		* Переписываем стандартные настройки. Функция вызывается при инициализации
		* нового модального окна, если был передан объект с натройками.
		*
		* @pamams:
		* {source | object} - объект с начальными настройками.
		* {reSource} - объект с пользовательскими настройками.
		*
		* Возвращает объект настроек с начальными настройками, переписанными
		* переданными пользовательскими настройками.
		*/
		function redefineDefaults(source, reSource) {
			var prop, ret = source;
			for (prop in reSource) {
				if (reSource.hasOwnProperty(prop)) {
					ret[prop] = reSource[prop];
				}
			}
			return ret;
		}

		/*
		* Узнаем какое событие на окончание перехода используется в данном браузере.
		*
		* Возвращает либо префиксное (для старых браузеров), либо стандартное transitionend.
		*/
		function getTransition() {
			var el = document.createElement('div');
			return (el.style.WebkitTransition) ? "webkitTransitionEnd" : 'transitionend';
		}

		/*
		* Функция инициализации модального окна.
		*/
		function build() {
			var content, // ссылка на контент модального окна.
			contentWrapper, // обертка для контента.
			container; // временный DocumentFragment для вставки в body.

			// Если переданный контент - DOM-объект, достаем из него содержимое,
			// либо просто передаем строку для вставки в модальное окно.
			if (typeof this.options.content === 'object') {
				content = this.options.content.innerHTML;
			} else {
				content = this.options.content;
			}

			// Создаем временный фрагмент.
			container = document.createDocumentFragment();

			this.modal = document.createElement('div');
			this.modal.className = 'moBox-modal moBox-modal_' + this.options.modalType;
			this.modal.style.boxSizing = 'border-box';
			if (this.modal.style.WebkitBoxSizing) this.modal.style.WebkitBoxSizing = 'border-box';
			if (this.modal.style.MozBoxSizing) this.modal.style.MozBoxSizing = 'border-box';
			this.modal.style.maxWidth = this.options.maxWidth + 'px';
			this.modal.style.minWidth = this.options.minWidth + 'px';

			if (this.options.closeButton === true) {
				this.closeButton = document.createElement('button');
				this.closeButton.className = 'moBox-close';
				this.closeButton.innerHTML = 'x';
				this.modal.appendChild(this.closeButton);
			}

			if (this.options.overlay === true) {
				this.overlay = document.createElement('div');
				this.overlay.className = 'moBox-overlay moBox-overlay_' + this.options.overlayType;
				container.appendChild(this.overlay);
			}

			contentWrapper = document.createElement('div');
			contentWrapper.className = 'moBox-content';
			contentWrapper.innerHTML = content;
			contentWrapper.style.boxSizing = 'border-box';
			if (contentWrapper.style.WebkitBoxSizing) contentWrapper.style.WebkitBoxSizing = 'border-box';
			if (contentWrapper.style.MozBoxSizing) contentWrapper.style.MozBoxSizing = 'border-box';
			this.modal.appendChild(contentWrapper);

			container.appendChild(this.modal);

			document.body.appendChild(container);
		}

		function initEvents() {
			if (this.closeButton) {
				this.closeButton.addEventListener('click', this.close.bind(this));
			}

			if (this.overlay) {
				this.overlay.addEventListener('click', this.close.bind(this));
			}
		}

		var defaults = {
			modalType: 'slide-top',
			overlayType: 'fade',
			maxWidth: 600,
			minWidth: 280,
			overlay: true,
			content: '',
			closeButton: true,
			gallery: false,
			animation: true
		};

		function fadeOut(obj, callback) {
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

		function fadeIn(obj, callback) {
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

		function boxScroll(box, overlay) {
			var winH = window.innerHeight,
			topMax,
			topMin,
			shift = 80,
			bs = box.style,
			inited = false;
			function s(e) {
				if (!inited) {
					topMax = box.getBoundingClientRect().top;
					topMin = -box.offsetHeight + winH - topMax;
					bs.top = topMax + 'px';
				}
				var next = Math.ceil(parseInt(bs.top) - e.deltaY);
				if (next < topMax && next > topMin) {
					bs.top = next + 'px';
				} else {
					if (next >= topMax) {
						bs.top = topMax + 'px';
					} else {
						bs.top = topMin + 'px';
					}
				}
				inited = true;
				e.preventDefault();
			}
			overlay.addEventListener('mousewheel', s);
		}

		function switchModal(viewport, contentBox, next) {
			var vs = viewport.style,
			nextW,
			nextH;

			vs.width = viewport.getBoundingClientRect().width + 'px';
			vs.height = viewport.getBoundingClientRect().height + 'px';
			var prevW = parseInt(vs.width, 10),
			prevH = parseInt(vs.height, 10);
			fadeOut(contentBox, function() {
				contentBox.innerHTML = next;
				contentBox.style.display = '';
				contentBox.style.visibility = 'hidden';
				nextW = contentBox.getBoundingClientRect().width + parseInt(getComputedStyle(viewport).paddingLeft, 10) * 2;
				nextH = contentBox.getBoundingClientRect().height + parseInt(getComputedStyle(viewport).paddingTop, 10) * 2;
				vs.width = (nextW > vs.maxWidth) ? nextW + 'px' : vs.width; 
				vs.height = nextH + 'px';
				if (nextH > window.innerHeight) {
					vieport.setAttribute('data-anchored', '');
				}
				setTimeout(function() {
					fadeIn(contentBox);
				}, 300);
			});
		}

		var MoBox = function() {
			this.modal = null;
			this.overlay = null;
			this.closeButton = null;

			if (arguments[0] && typeof arguments[0] === 'object') {
				this.options = redefineDefaults(defaults, arguments[0]);
			} else {
				this.options = defaults;
			}

			this.transitionEnd = getTransition();

			this.open = function() {
				build.call(this);
				initEvents.call(this);

				var m = this.modal;
				window.getComputedStyle(m).height;
				m.setAttribute('data-state', 'open');
				this.overlay.setAttribute('data-state', 'open');
				if (m.offsetHeight > window.innerHeight) {
					m.setAttribute('data-anchored', '');
					boxScroll(m, this.overlay);
				}
			};

			this.close = function() {
				// document.removeEventListener('mousewheel', s)
				var that = this,
				m = this.modal;
				o = this.overlay;
				m.removeAttribute('data-state');
				m.style.top = '';
				o.removeAttribute('data-state');

				if (!this.options.animation) {
					m.parentNode.removeChild(m);
					o.parentNode.removeChild(o);
				} else {
					m.addEventListener(this.transitionEnd, function() {
						m.parentNode.removeChild(m);
					});
					o.addEventListener(this.transitionEnd, function() {
						o.parentNode.removeChild(o);
					});
				}
			};

			this.changeContent = function(newContent) {
				var contentBox = document.querySelector('.moBox-content'),
				nextContent;
				if (typeof newContent === 'object') {
					nextContent = newContent.innerHTML;
				} else {
					nextContent = newContent;
				}
				if (this.options.animation === true) {
					switchModal(this.modal, contentBox, nextContent);
				} else {
					contentBox.innerHTML = nextContent;
				}
			};

		}
		return new MoBox(opts);
	};
})(window);

var m = moBox({
	modalType: "drop",
	content: document.querySelector('.order'),
	// content: "HELLO WORLD! adsasdasd asdas asd asd asd asdasdasda sda dasd adsa dasd asda sdas asda sdasdasd asdfefs gvsfsefas ",
	animation: true
});
var d = moBox({modalType: "drop"});
document.querySelector('.button').addEventListener('click', function() {
	m.open();
});