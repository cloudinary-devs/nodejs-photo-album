import { LitElement, html } from 'lit';

class MyNavbar extends LitElement {
  createRenderRoot() {
    return this;
  }

  toggleMenu(e) {
    const dropdownMenu = this.querySelector('.dropdown-content');
    if (dropdownMenu) {
      dropdownMenu.classList.toggle('hidden');
    }
  }

  render() {
    return html`
      <div class="navbar bg-base-100">
        <div class="navbar-start">
          <div class="dropdown">
            <label
              tabindex="0"
              class="btn btn-ghost lg:hidden"
              @click="${this.toggleMenu}"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 hidden"
            >
              <li><a href="/">Home</a></li>
              <li><a href="/upload">Upload from browser</a></li>
              <li><a href="/upload-large">Upload large files</a></li>
              <li>
                <a href="/upload-large-stream">Upload large files via stream</a>
              </li>
              <li><a href="/gallery">Gallery</a></li>
            </ul>
          </div>
          <a href="/" class="btn btn-ghost text-xl"
            >Cloudinary Node.js Sample App</a
          >
        </div>
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li><a href="/">Home</a></li>
            <li><a href="/upload">Upload from browser</a></li>
            <li><a href="/upload-large">Upload large files</a></li>
            <li>
              <a href="/upload-large-stream">Upload (large) files via stream</a>
            </li>
            <li><a href="/gallery">Gallery</a></li>
          </ul>
        </div>
      </div>
    `;
  }
}

customElements.define('my-navbar', MyNavbar);
