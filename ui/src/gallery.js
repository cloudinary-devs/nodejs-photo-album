const gallery = document.querySelector('media-gallery');
const response = await fetch(
  `${import.meta.env.VITE_API_ENDPOINT}/list-uploaded-files`
);
const data = await response.json();

gallery.data = data;
