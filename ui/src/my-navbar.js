import { LitElement, html, css } from 'lit';

class MyNavbar extends LitElement {
  static styles = css`
    nav {
      background-color: #f8f9fa;
      padding: 1rem;
      display: flex;
      justify-content: space-around;
      border-radius: 15px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    a {
      text-decoration: none;
      color: #333;
      font-weight: 700;
    }
    a:hover {
      color: #007bff;
    }
  `;

  render() {
    return html`
      <nav>
        <a href="/">Home</a>
        <a href="/upload">Upload from the browser</a>
        <a href="/upload-large">Upload large files from the browser</a>
        <a href="/upload-large-stream"
          >Upload large files from the browser (Stream)</a
        >
        <a href="/gallery">Gallery</a>
      </nav>
    `;
  }
}

customElements.define('my-navbar', MyNavbar);
