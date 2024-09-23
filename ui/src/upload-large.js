import { LitElement, html } from 'lit';

class LargeFileUploader extends LitElement {
  createRenderRoot() {
    return this;
  }

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
      this.status = `File selected: ${file.name}`;
    } else {
      this.status = 'Ready to upload';
    }
    this.requestUpdate(); // Re-render to update the status
  }

  handleSubmit(e) {
    e.preventDefault(); // Prevents form submission (page refresh)
    const fileInput = this.querySelector('input[type=file]');
    const file = fileInput.files[0];
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

          // Modify the Cloudinary URL to add the 'w_400' transformation
          if (result.url) {
            const cloudinaryUrl = result.url.replace(
              '/upload/',
              '/upload/w_400/'
            );
            this.cloudinaryUrl = cloudinaryUrl;
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
      return html`<video
        controls
        src="${this.cloudinaryUrl}"
        class="m-2"
      ></video>`;
    } else if (this.cloudinaryUrl.includes('/image/')) {
      return html`<img
        src="${this.cloudinaryUrl}"
        alt="Uploaded image"
        class="m-2"
      />`;
    }
    return html``;
  }

  render() {
    return html`
      <form @submit="${this.handleSubmit}" enctype="multipart/form-data">
        <!-- File input and upload button in the same row -->
        <div class="flex items-center space-x-4">
          <label>
            <button
              type="button"
              class="btn btn-primary"
              @click="${() => this.querySelector('input[type=file]').click()}"
            >
              Select File to Upload
            </button>
            <input
              type="file"
              class="file-input file-input-bordered file-input-primary"
              @change="${this.handleFileSelect}"
              style="display: none;"
            />
          </label>

          <button class="btn btn-primary" type="submit">Upload File</button>
        </div>

        <!-- Status text below the buttons -->
        <div class="mt-2 text-lg">${this.status}</div>

        <!-- Progress bar below the status text -->
        <progress
          class="progress progress-primary w-56 mt-2"
          value="${this.progress}"
          max="100"
        ></progress>
      </form>

      <!-- Upload result section -->
      <div
        class="flex flex-wrap"
        id="uploadResultSection"
        style="display: ${this.cloudinaryUrl ? 'flex' : 'none'};"
      >
        <h2 class="w-full text-xl font-bold mt-3">Uploaded asset</h2>
        ${this.renderUploadResult()}
      </div>
    `;
  }
}

customElements.define('large-file-uploader', LargeFileUploader);

export default LargeFileUploader;
