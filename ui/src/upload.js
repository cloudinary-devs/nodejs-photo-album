const uploadResultSection = document.getElementById('uploadResultSection');
uploadResultSection.style.display = 'none';
const uploadHandler = async (event) => {
  event.preventDefault();

  document.querySelector('button[type="submit"]').disabled = true;

  const formData = new FormData();
  const fileField = document.querySelector('input[type="file"]');

  formData.append('image', fileField.files[0]);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/upload-from-browser`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    if (response.ok) {
      uploadResultSection.style.display = 'block';
      console.log(`Image uploaded successfully: ${result.url}`);
      const img = document.createElement('img');
      img.src = `${import.meta.env.VITE_CLOUDINARY_IMAGE_PREFIX}/w_400/${
        result.public_id
      }`;
      uploadResultSection.appendChild(img);
    } else {
      document.querySelector('button[type="submit"]').disabled = false;
      console.error(result);
    }
  } catch (error) {
    document.querySelector('button[type="submit"]').disabled = false;
    console.error(error);
  } finally {
    document.querySelector('button[type="submit"]').disabled = false;
  }
};

document.getElementById('uploadForm').addEventListener('submit', uploadHandler);
