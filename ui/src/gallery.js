const gallery = document.querySelector('media-gallery');
const response = await fetch(
  `${import.meta.env.VITE_API_ENDPOINT}/list-uploaded-files`
);
const data = await response.json();

// First, set the data and then turn off the loading state
gallery.data = data;
gallery.loading = false;
