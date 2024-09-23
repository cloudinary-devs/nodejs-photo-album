import { LitElement, html } from 'lit';
import './media-gallery-item.js';

class MediaGallery extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    data: { type: Object },
    loading: { type: Boolean },
  };

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
      return html`<p class="text-xl p-4">Loading gallery...</p>`;
    }

    return html`
      <div class="flex flex-wrap -mx-4">
        ${!hasImages && !hasVideos
          ? html`<p class="text-xl p-4">
              No images or videos tagged as 'nodejs-sample'
            </p>`
          : html`
              ${hasImages
                ? images.map(
                    (image) => html`
                      <div class="lg:w-1/3 md:w-1/2 w-full p-4">
                        <media-gallery-item
                          src="${image}"
                          alt="Image"
                          type="image"
                        ></media-gallery-item>
                      </div>
                    `
                  )
                : ''}
              ${hasVideos
                ? videos.map(
                    (video) => html`
                      <div class="lg:w-1/3 md:w-1/2 w-full p-4">
                        <media-gallery-item
                          src="${video}"
                          alt="Video"
                          type="video"
                        ></media-gallery-item>
                      </div>
                    `
                  )
                : ''}
            `}
      </div>
      ${!hasImages && hasVideos
        ? html`<p class="text-xl p-4">No images tagged as 'nodejs-sample'</p>`
        : ''}
      ${!hasVideos && hasImages
        ? html`<p class="text-xl p-4">No videos tagged as 'nodejs-sample'</p>`
        : ''}
    `;
  }
}

customElements.define('media-gallery', MediaGallery);
