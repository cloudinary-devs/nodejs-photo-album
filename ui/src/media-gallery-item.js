import { LitElement, html, css } from 'lit';

class MediaGalleryItem extends LitElement {
  static properties = {
    src: { type: String },
    alt: { type: String },
    type: { type: String },
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
    img,
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
    }
  `;

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
