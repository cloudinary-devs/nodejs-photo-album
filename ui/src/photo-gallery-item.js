import { LitElement, html, css } from 'lit';

class PhotoGalleryItem extends LitElement {
  static properties = {
    src: { type: String },
    alt: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      padding: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      border-radius: 5px;
      width: 400px;
      height: 400px;
    }

    img {
      border-radius: 5px;
    }
  `;

  constructor() {
    super();
    this.src = '';
    this.alt = '';
  }

  render() {
    return html`
      <img src="${this.src}" alt="${this.alt}" width="400" height="400" />
    `;
  }
}

customElements.define('photo-gallery-item', PhotoGalleryItem);
