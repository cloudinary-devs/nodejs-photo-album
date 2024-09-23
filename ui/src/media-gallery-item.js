import { LitElement, html } from 'lit';

class MediaGalleryItem extends LitElement {
  static properties = {
    src: { type: String },
    alt: { type: String },
    type: { type: String },
  };

  constructor() {
    super();
    this.src = '';
    this.alt = '';
    this.type = 'image';
  }

  render() {
    return html`
      ${this.type === 'image'
        ? html`<img src="${this.src}" alt="${this.alt}" />`
        : html`<video src="${this.src}" controls></video>`}
    `;
  }
}

customElements.define('media-gallery-item', MediaGalleryItem);
