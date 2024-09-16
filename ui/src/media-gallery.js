import { LitElement, html, css } from 'lit';
import './media-gallery-item.js';

class MediaGallery extends LitElement {
  static properties = {
    data: { type: Object },
    loading: { type: Boolean },
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
    .message {
      text-align: center;
      font-size: 1.2em;
      color: #666;
    }
  `;

  constructor() {
    super();
    this.data = { images: [], videos: [] };
    this.loading = true; // Set the loading state to true initially
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  async loadData() {
    // Simulate data loading (replace this with real data fetching)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.loading = false; // Set loading to false when the data has finished loading
  }

  render() {
    const { images, videos } = this.data;
    const hasImages = images && images.length > 0;
    const hasVideos = videos && videos.length > 0;

    if (this.loading) {
      return html`<p class="message">Loading gallery...</p>`;
    }

    return html`
      <div class="gallery">
        ${!hasImages && !hasVideos
          ? html`<p class="message">
              No images or videos tagged as 'nodejs-sample'
            </p>`
          : html`
              ${hasImages
                ? images.map(
                    (image) => html`
                      <media-gallery-item
                        src="${image}"
                        alt="Image"
                        type="image"
                      ></media-gallery-item>
                    `
                  )
                : ''}
              ${hasVideos
                ? videos.map(
                    (video) => html`
                      <media-gallery-item
                        src="${video}"
                        alt="Video"
                        type="video"
                      ></media-gallery-item>
                    `
                  )
                : ''}
            `}
      </div>
      ${!hasImages && hasVideos
        ? html`<p class="message">No images tagged as 'nodejs-sample'</p>`
        : ''}
      ${!hasVideos && hasImages
        ? html`<p class="message">No videos tagged as 'nodejs-sample'</p>`
        : ''}
    `;
  }
}

customElements.define('media-gallery', MediaGallery);
