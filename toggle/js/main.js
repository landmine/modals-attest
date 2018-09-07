(function(w, doc) {
  'use strict';

  let peToggleCounter = 0;

  class Toggle extends HTMLElement {
    static get observedAttributes() {
      return ['checked'];
    }

    constructor() {
      super();

      this.attachShadow({ mode: 'open' });

      const currentDoc = doc.querySelector('link[href$="index.html"]').import,
        template = currentDoc.querySelector('#template'),
        clone = doc.importNode(template.content, true);

      this.button = clone.querySelector('button');
      this.label = clone.querySelector('label');

      this.shadowRoot.appendChild(clone);

      this._handleClick = this._handleClick.bind(this);
    }

    connectedCallback() {
      this._upgradeProperty('checked');
      this._upgradeProperty('value');
      this._upgradeProperty('labelhidden');
      
      this._mapPropsToFormControls();
      this._renderLabel();

      this.button.addEventListener('click', this._handleClick);
      
    }

    _handleClick() {
      this.checked = !this.checked;
    }

    _mapPropsToFormControls() {
      if (!this.id) {
        this.id = `pe-toggle-${peToggleCounter++}`;
      }
      this.button.id = this.id + '_button';
      this.label.id = this.id + '_label';

      this.button.setAttribute('aria-labelledby', this.label.id);

      if (this.hasAttribute('value')) {
        this.button.value = this.getAttribute('value');
      }
      if (this.hasAttribute('name')) {
        this.button.name = this.getAttribute('name');
      }
      
      this.label.setAttribute('for', this.button.id);
    }

    _renderLabel(){
      if (this.hasAttribute('labelhidden')) {
        this.label.classList.toggle('visuallyhidden');
      }

      if (this.hasAttribute('labelText')) {
        this.label.textContent = this.getAttribute('labelText');
      }
    }

    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    get checked() {
      return this.hasAttribute('checked');
    }

    set checked(value) {
      if (value) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
    }

    get value() {
      return this.button.value;
    }

    get name() {
      return this.button.name;
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'checked') {
        const isChecked = newValue !== null;
        this.button.setAttribute('aria-checked', isChecked);
      }
    }

    disconnectedCallback() {
      this.button.removeEventListener('click');
    }
  }

  customElements.define('pearson-toggle', Toggle);
})(window, document);