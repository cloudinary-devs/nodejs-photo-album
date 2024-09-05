import { LitElement, html, css } from 'lit';

class LargeFileUploader extends LitElement {
  static styles = css`
    .uploader {
      margin-bottom: 20px;
    }
    progress {
      width: 100%;
      margin-top: 10px;
    }
    .status {
      margin-top: 10px;
      color: #555;
    }
    #uploadResultSection {
      display: none;
    }
    /* Style for both video and image elements */
    video,
    img {
      width: 400px;
      margin-top: 10px;
    }
  `;

  static properties = {
    uploadUrl: { type: String },
    uploadId: { type: String },
    progress: { type: Number },
    status: { type: String },
    cloudinaryUrl: { type: String },
  };

  constructor() {
    super();
    this.uploadUrl = 'http://localhost:3000/upload-large-from-browser-chunked';
    this.uploadId = '';
    this.progress = 0;
    this.status = 'Ready to upload';
    this.cloudinaryUrl = '';
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.uploadFileInChunks(file);
    }
  }

  async uploadFileInChunks(file) {
    const chunkSize = 6000000; // 6MB chunk size
    const totalChunks = Math.ceil(file.size / chunkSize);
    this.uploadId = crypto.randomUUID();
    this.status = 'Starting upload...';
    this.cloudinaryUrl = '';

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk, file.name);

      const headers = new Headers({
        'x-unique-upload-id': this.uploadId,
        'content-range': `bytes ${start}-${end - 1}/${file.size}`,
      });

      try {
        this.status = `Uploading chunk ${chunkIndex + 1} of ${totalChunks}...`;
        const response = await fetch(this.uploadUrl, {
          method: 'POST',
          headers: headers,
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          this.progress = ((chunkIndex + 1) / totalChunks) * 100;

          if (result.url) {
            this.cloudinaryUrl = result.url;
            this.status = 'Upload complete! File available on Cloudinary.';
          } else {
            this.status = `Chunk ${chunkIndex + 1} uploaded. ${result.status}`;
          }

          this.requestUpdate();
        } else {
          const errorData = await response.json();
          console.error('Failed to upload chunk:', response.status, errorData);
          this.status = `Error uploading chunk ${chunkIndex + 1}: ${
            errorData.error
          }`;
          throw new Error(
            `Upload failed: ${errorData.error}. ${errorData.details || ''}`
          );
        }
      } catch (error) {
        console.error('Error uploading chunk:', error);
        this.status = `Error: ${error.message}`;
        this.dispatchEvent(
          new CustomEvent('upload-error', { detail: error.message })
        );
        break;
      }
    }

    if (this.progress === 100 && !this.cloudinaryUrl) {
      this.status = 'Upload complete! Waiting for Cloudinary processing...';
    }
  }

  renderUploadResult() {
    if (this.cloudinaryUrl.includes('/video/')) {
      return html`<video controls src="${this.cloudinaryUrl}"></video>`;
    } else if (this.cloudinaryUrl.includes('/image/')) {
      return html`<img src="${this.cloudinaryUrl}" alt="Uploaded image" />`;
    }
    return html``;
  }

  render() {
    return html`
      <form @submit="${this.handleSubmit}" enctype="multipart/form-data">
        <div class="uploader">
          <label>
            <button
              type="button"
              @click="${() =>
                this.shadowRoot.querySelector('input[type=file]').click()}"
            >
              Select File to Upload
            </button>
            <input
              type="file"
              @change="${this.handleFileSelect}"
              style="display: none;"
            />
          </label>
          <progress value="${this.progress}" max="100"></progress>
          <div class="status">${this.status}</div>
        </div>
        <button type="submit">Upload File</button>
      </form>

      <section
        id="uploadResultSection"
        style="display: ${this.cloudinaryUrl ? 'block' : 'none'};"
      >
        ${this.renderUploadResult()}
      </section>
    `;
  }
}

customElements.define('large-file-uploader', LargeFileUploader);

export default LargeFileUploader;
