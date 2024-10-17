# Introduction

This project demonstrates how to use the [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration) to create a photo album app.

The sample project has two distinctive parts: a backend and a frontend and together they demonstrate uploading media to your product environment and displaying the uploaded media.

# Setup

Create a `.env` file with the following content at the root of the project:

```
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

VITE_API_ENDPOINT=http://localhost:3000
VITE_CLOUDINARY_IMAGE_PREFIX=https://res.cloudinary.com/YOUR-CLOUD-NAME/image/upload
VITE_CLOUDINARY_VIDEO_PREFIX=https://res.cloudinary.com/YOUR-CLOUD-NAME/video/upload
VITE_TITLE='Node.js Sample App'
```

> Please make sure to change the `YOUR-CLOUD-NAME` part in **both** `VITE_CLOUDINARY_IMAGE_PREFIX` and `VITE_CLOUDINARY_VIDEO_PREFIX`!

# Run

From your terminal, in the root folder of your project, run:

- `npm i`
- `npm start`

The last command starts both the backend and the frontend as well. The backend uses Cloudinary's Node.js SDK and exposes a bunch of endpoints to achieve the desired functionality of the app.

The frontend uses (Lit)[https://lit.dev/docs/v1/lit-html/introduction/] to provide a user interface to demonstrate how to consume the endpoints exposed by the backend.

Try uploading images and videos using each of the pages, then see them being displayed on the Gallery page.

# Explore

- Take a look at the source code to understand how it works.
- Discover more features in the [Cloudinary Docs](https://cloudinary.com/documentation).
- Ask for help in our [Community Forum](https://community.cloudinary.com/), in [Discord](https://discord.gg/Cloudinary), or [raise a support request](https://support.cloudinary.com/hc/en-us/requests/new).

Feel free to fork this repo as a starting point for your own Node.js app, contribute to it, or star it if you like it!
