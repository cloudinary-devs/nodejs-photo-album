import { LitElement, html, css } from 'lit';

class LargeFileUploader extends LitElement {
  static styles = css`
    .uploader {
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 2px dashed #ccc;
      padding: 20px;
      width: 300px;
    }
    input[type='file'] {
      display: none;
    }
    button {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #4caf50;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #45a049;
    }
    progress {
      width: 100%;
      margin-top: 10px;
    }
    .status {
      margin-top: 10px;
      font-style: italic;
    }
  `;

  static properties = {
    uploadUrl: { type: String },
    uploadId: { type: String },
    progress: { type: Number },
    status: { type: String },
  };

  constructor() {
    super();
    this.uploadUrl = 'http://localhost:3000/upload_large_from_browser_chunked';
    this.uploadId = '';
    this.progress = 0;
    this.status = 'Ready to upload';
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
            // Final chunk, Cloudinary upload completed
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

  render() {
    return html`
      <div class="uploader">
        <label>
          <button
            @click="${() =>
              this.shadowRoot.querySelector('input[type=file]').click()}"
          >
            Select File to Upload
          </button>
          <input type="file" @change="${this.handleFileSelect}" />
        </label>
        <progress value="${this.progress}" max="100"></progress>
        <div class="status">${this.status}</div>
      </div>
    `;
  }
}

customElements.define('large-file-uploader', LargeFileUploader);

export default LargeFileUploader;
