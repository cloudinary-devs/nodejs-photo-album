import { LitElement, html } from 'lit';

class AppHead extends LitElement {
  render() {
    return html`
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Node.js Sample App</title>
      <link rel="stylesheet" href="src/index.css" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <script type="module" src="src/my-navbar.js"></script>
    `;
  }
}

customElements.define('app-head', AppHead);
