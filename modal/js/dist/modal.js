'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FOCUSABLE_ELEMENTS = '\n    a[href]:not([tabindex^="-"]):not([inert]),\n    area[href]:not([tabindex^="-"]):not([inert]),\n    input:not([disabled]):not([inert]),\n    select:not([disabled]):not([inert]),\n    textarea:not([disabled]):not([inert]),\n    button:not([disabled]):not([inert]),\n    iframe:not([tabindex^="-"]):not([inert]),\n    audio:not([tabindex^="-"]):not([inert]),\n    video:not([tabindex^="-"]):not([inert]),\n    [contenteditable]:not([tabindex^="-"]):not([inert]),\n    [tabindex]:not([tabindex^="-"]):not([inert])',
    TAB_KEY = 9,
    ESCAPE_KEY = 27;

function getDeepActiveElement() {
  var a = document.activeElement;
  while (a && a.shadowRoot && a.shadowRoot.activeElement) {
    a = a.shadowRoot.activeElement;
  }
  return a;
}

function getFocusableChildren(node) {
  var filter = Array.prototype.filter,
      focusableChildren = node.querySelectorAll(FOCUSABLE_ELEMENTS);
  return filter.call(focusableChildren, function (child) {
    return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
  });
}

function setFocusToFirstChild(node) {
  var focusableChildren = getFocusableChildren(node),
      focusableChild = node.querySelector('[autofocus]') || focusableChildren[0];

  if (focusableChild) {
    focusableChild.focus();
  }
}

function trapTabKey(e) {
  for (var _len = arguments.length, nodes = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    nodes[_key - 1] = arguments[_key];
  }

  var focusableChildren = nodes.reduce(function (acc, n) {
    return acc.concat(getFocusableChildren(n));
  }, []),
      focusedItemIdx = focusableChildren.indexOf(getDeepActiveElement()),
      lastFocusableIdx = focusableChildren.length - 1;

  if (e.shiftKey && focusedItemIdx === 0) {
    focusableChildren[lastFocusableIdx].focus();
    e.preventDefault();
  }

  if (!e.shiftKey && focusedItemIdx === lastFocusableIdx) {
    focusableChildren[0].focus();
    e.preventDefault();
  }
}

var Modal = function (_HTMLElement) {
  _inherits(Modal, _HTMLElement);

  _createClass(Modal, null, [{
    key: 'observedAttributes',
    get: function get() {
      return ['footer'];
    }
  }]);

  function Modal() {
    _classCallCheck(this, Modal);

    var _this = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this));

    _this.attachShadow({ mode: 'open' });

    _this.openModal = _this.openModal.bind(_this);
    _this.closeModal = _this.closeModal.bind(_this);

    _this.bindKeyPress = _this.bindKeyPress.bind(_this);
    _this.maintainFocus = _this.maintainFocus.bind(_this);
    return _this;
  }

  _createClass(Modal, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, oldValue, newValue) {

      // if `footer` is changing, but
      // this.modal has not been defined yet,
      // bail out.
      if (name === 'footer' && !this.modal) return;
      if (!this.footer) {
        var actions = this.modal.querySelector('.actions');
        actions.remove();
      }
      if (this.footer) {
        this.renderfooter(this.modal);
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this2 = this;

      // Get component attributes
      var titleText = this.getAttribute('titletext'),
          triggerId = this.getAttribute('triggerid'),
          footer = this.hasAttribute('footer'),
          elements = this.getAttribute('elements');

      // Clone content for shadow DOM
      var currentDoc = document.querySelector('link[href$="index.html"]').import;
      var template = currentDoc.querySelector('#template');
      var clone = document.importNode(template.content, true);

      // Create elements
      // Target the body of the modal
      // create the footer

      if (footer) {
        this.renderfooter(clone);
      }

      this.renderStyles(clone);

      console.log(elements);
      var overlayButtonTemplate = currentDoc.querySelector('#overlayDiv'),
          overlayButtonClone = document.importNode(overlayButtonTemplate.content, true),
          overlayEntryPoint = clone.querySelector('#modalPlaceholder');

      overlayEntryPoint.parentNode.insertBefore(overlayButtonClone, overlayEntryPoint.nextElementSibling);
      overlayEntryPoint.remove();

      var title = clone.querySelector('#dialogHeading');
      if (titleText !== null) {
        title.innerHTML = titleText;
      } else {
        title.innerHTML = 'Modal Title';
      }

      // functionality
      this.body = document.querySelector('body');
      this.main = document.querySelector('main');
      this.triggerBtn = document.querySelector('#' + triggerId);

      this.modal = clone.querySelector('#modal');
      this.eventBtns = clone.querySelectorAll('[data-event]');
      this.overlay = clone.querySelector('#modalOverlay');

      // When the modal trigger is clicked, open modal
      this.triggerBtn.addEventListener('click', this.openModal);

      this.eventBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var eventType = e.target.dataset.event;
          _this2.closeModal(eventType);
        });
      });

      // sets the positioning for modals that are programmatically created and have scrolling content
      this.setPosition();

      this.shadowRoot.appendChild(clone);

      document.addEventListener('keydown', this.bindKeyPress);
      document.body.addEventListener('focus', this.maintainFocus, true);
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      document.removeEventListener('keydown', this.bindKeyPress);
      document.body.removeEventListener('focus', this.maintainFocus);
    }
  }, {
    key: 'openModal',
    value: function openModal(e) {
      var _this3 = this;

      // unhide it on open, to prevent FOUC
      this.style.display = "block";

      var thisButton = e.currentTarget,
          buttonDisabled = thisButton.getAttribute('disabled');

      if (buttonDisabled === null) {
        thisButton.setAttribute('disabled', true);
        this.main.setAttribute('aria-hidden', 'true');
        this.overlay.removeAttribute('disabled');
      }

      this.overlay.classList.remove('hidden');
      this.overlay.classList.remove('fadeOut');
      this.overlay.classList.add('fadeIn');

      this.modal.classList.remove('hidden');
      this.modal.classList.remove('slideOutDown');
      this.modal.classList.add('slideInDown');
      this.open = true;

      setTimeout(function () {
        _this3.maintainFocus();
      }, 250);
    }
  }, {
    key: 'closeModal',
    value: function closeModal(eventName) {
      var _this4 = this;

      this.triggerBtn.removeAttribute('disabled');
      this.main.setAttribute('aria-hidden', 'false');
      this.body.classList.remove('hide-overflow');

      this.overlay.classList.remove('fadeIn');
      this.overlay.classList.add('fadeOut');

      this.modal.classList.remove('slideInDown');
      this.modal.classList.add('slideOutDown');

      setTimeout(function () {
        _this4.modal.classList.add('hidden');
        _this4.modal.classList.remove('slideOutDown');
      }, 400);

      setTimeout(function () {
        _this4.dispatchEvent(new Event(eventName, { bubbles: true, composed: true }));
      }, 500);

      setTimeout(function () {
        _this4.overlay.classList.add('hidden');
        _this4.overlay.classList.remove('fadeOut');
      }, 800);

      setTimeout(function () {
        _this4.triggerBtn.focus();
      }, 801);

      this.open = false;
    }
  }, {
    key: 'maintainFocus',
    value: function maintainFocus() {
      // if the modal is not open, stop the function
      if (!this.open) return;

      /**
       * The DOM we want to trap focus in. If the consumer passed in
       * focusable children, it's the Light DOM; else, it's the Shadow DOM.
       */
      var targetDOM = getFocusableChildren(this).length > 0 ? this : this.modal;

      // if neither the Light DOM nor the Shadow DOM within the modal contain
      // the active element, set focus back into the targetDOM.
      if (!this.contains(getDeepActiveElement()) && !this.modal.contains(getDeepActiveElement())) {
        setFocusToFirstChild(targetDOM);
      }
    }
  }, {
    key: 'bindKeyPress',
    value: function bindKeyPress(e) {
      if (this.open && e.which === ESCAPE_KEY) {
        this.closeModal('cancel');
      }
      if (this.open && e.which === TAB_KEY) {
        trapTabKey(e, this, this.modal);
      }
    }
  }, {
    key: 'setPosition',
    value: function setPosition() {
      var _this5 = this;

      setTimeout(function () {
        var modalPosition = _this5.modal.getBoundingClientRect();
        window.scrollTo(0, 0);
        if (modalPosition.top <= 0) {
          _this5.modal.style.top = '50px';
          _this5.modal.style.transform = 'translate(-50%)';
          _this5.modal.style.marginBottom = '50px';
        }
      }, 100);
    }
  }, {
    key: 'renderfooter',
    value: function renderfooter(parentNode) {
      var successBtnText = this.getAttribute('successbtntext'),
          cancelBtnText = this.getAttribute('cancelbtntext'),
          hideCancel = this.getAttribute('hidecancel'),
          hideSuccess = this.getAttribute('hidesuccess');

      var currentDoc = document.querySelector('link[href$="index.html"]').import;

      var selector = hideCancel !== null ? '#actions-noCancel' : hideSuccess !== null ? '#actions-noSuccess' : '#actions',
          actionsTemplate = currentDoc.querySelector(selector),
          actionsClone = document.importNode(actionsTemplate.content, true),
          cancelButton = actionsClone.querySelector('#cancelButton'),
          saveButton = actionsClone.querySelector('#successButton');

      var modalBody = parentNode.querySelector('#dialogDescription');

      if (cancelBtnText !== null) {
        cancelButton.innerHTML = cancelBtnText;
      }

      if (successBtnText !== null) {
        saveButton.innerHTML = successBtnText;
      }

      modalBody.parentNode.insertBefore(actionsClone, modalBody.nextSibling);
    }
  }, {
    key: 'renderStyles',
    value: function renderStyles(parentNode) {
      var elementsVersion = this.hasAttribute('elements'),
          currentDoc = document.querySelector('link[href$="index.html"]').import,
          selector = elementsVersion ? '#old' : '#new',
          styleTemplate = currentDoc.querySelector(selector),
          styleClone = document.importNode(styleTemplate.content, true),
          modalBody = parentNode.querySelector('.deep-encapsulation');

      modalBody.parentNode.insertBefore(styleClone, modalBody.nextSibling);
    }
  }, {
    key: 'footer',
    get: function get() {
      return this.hasAttribute('footer');
    },
    set: function set(value) {
      var isfooterShown = Boolean(value);

      if (isfooterShown) {
        this.setAttribute('footer', '');
      } else {
        this.removeAttribute('footer');
      }
    }
  }]);

  return Modal;
}(HTMLElement);

customElements.define('pearson-modal', Modal);