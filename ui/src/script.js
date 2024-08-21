const uploadHandler = async (event) => {
  event.preventDefault();

  document.querySelector('button[type="submit"]').disabled = true;

  const formData = new FormData();
  const fileField = document.querySelector('input[type="file"]');

  formData.append('image', fileField.files[0]);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/upload_from_browser`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    if (response.ok) {
      console.log(`Image uploaded successfully: ${result.url}`);
      const uploadResult = document.getElementById('uploadResult');
      const img = document.createElement('img');
      img.src = `${import.meta.env.VITE_CLOUDINARY_PREFIX}/w_200/${
        result.public_id
      }`;
      uploadResult.appendChild(img);
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
