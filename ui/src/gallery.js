const gallery = document.querySelector('photo-gallery');

const response = await fetch(
  `${import.meta.env.VITE_API_ENDPOINT}/list-uploaded-files`
);
const data = await response.json();

gallery.photos = data.map((url, index) => ({
  url,
  alt: `Image ${index}`,
}));
