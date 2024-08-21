import { LitElement, html, css } from 'lit';
import './photo-gallery-item.js';

class PhotoGallery extends LitElement {
  static properties = {
    photos: { type: Array },
  };

  static styles = css`
    :host {
      display: block;
      padding: 20px;
    }

    .gallery {
      display: grid;
      gap: 20px;
    }

    @media (min-width: 1024px) {
      .gallery {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 768px) and (max-width: 1023px) {
      .gallery {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 767px) {
      .gallery {
        grid-template-columns: 1fr;
      }
    }
  `;

  constructor() {
    super();
    this.photos = [];
  }

  render() {
    return html`
      <div class="gallery">
        ${this.photos.map(
          (photo) => html`
            <photo-gallery-item
              src="${photo.url}"
              alt="${photo.alt}"
            ></photo-gallery-item>
          `
        )}
      </div>
    `;
  }
}

customElements.define('photo-gallery', PhotoGallery);
