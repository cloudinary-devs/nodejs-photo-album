const uploadResult = document.getElementById('uploadResult');
uploadResult.style.display = 'none';
const uploadHandler = async (event) => {
  event.preventDefault();

  document.querySelector('button[type="submit"]').disabled = true;

  const formData = new FormData();
  const fileField = document.querySelector('input[type="file"]');

  formData.append('video', fileField.files[0]);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/upload-large-stream-from-browser`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    if (response.ok) {
      console.log(`Video uploaded successfully: ${result.url}`);
      uploadResult.style.display = 'block';
      const video = document.createElement('video');
      video.src = `${import.meta.env.VITE_CLOUDINARY_VIDEO_PREFIX}/w_400/${
        result.public_id
      }`;
      video.controls = true;
      video.width = 400;

      // Append the video element to the uploadResult div
      uploadResult.appendChild(video);
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
