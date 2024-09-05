dotenv.config({ path: '.env.local' });
import dotenv from 'dotenv';

import { v2 as cloudinary } from 'cloudinary';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cloudinary configuration goes here, at all times the Cloudinary SDK requires a cloud name, an API key and secret
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
size of the chunks for the chunked upload
used in `uploadLargeFromLocal` and `uploadLocalFromBrowserChunked`
*/
const CHUNK_SIZE = 6000000;

// all uploaded files to Cloudinary will have this tag
const tags = ['nodejs-sample'];

/*
This function retrieves files tagged with 'nodejs-sample' from Cloudinary, transforms each file by resizing it to 400x400 pixels
and optimising its format and quality, then sends the transformed URLs back as the response.
*/
const listUploadedFiles = async (request, reply) => {
  console.log('Listing uploaded files tagged', tags[0]);
  try {
    const { resources } = await cloudinary.api.resources_by_tag(
      'nodejs-sample'
    );
    const transformedUrls = resources.map((resource) =>
      cloudinary.url(resource.public_id, {
        transformation: [
          {
            height: 400,
            width: 400,
            crop: 'fill',
          },
          { fetch_format: 'auto' },
          { quality: 'auto' },
        ],
      })
    );

    reply.code(200).send(transformedUrls);
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Failed to retrieve files' });
  }
};

/*
This function reads all files from a local "photos" directory, uploads each one to Cloudinary with specified tags,
and returns the results. If an error occurs during the upload process, it sends a 500 error response indicating the failure.
*/

const uploadFromLocal = async (request, reply) => {
  console.log('Uploading files from the local filesystem');
  try {
    const photosDir = `${import.meta.dirname}/photos`;
    const localFiles = readdirSync(photosDir).map((file) =>
      join(photosDir, file)
    );
    const uploadPromises = localFiles.map((localFile) => {
      return cloudinary.uploader.upload(localFile, {
        tags,
      });
    });
    const result = await Promise.all(uploadPromises);
    return {
      result,
    };
  } catch (error) {
    reply.status(500).send({ error: 'Failed to upload files' });
  }
};

/*
This function handles image uploads from a browser by reading the uploaded file, converting it to a buffer,
and uploading it to Cloudinary. If successful, it returns the file's URL and public ID; if there is an error,
it sends a 500 error response.
*/
const uploadFromBrowser = async (request, reply) => {
  console.log('Uploading files from the browser');
  try {
    const data = await request.file();

    const buffer = await data.toBuffer();
    await new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream({ tags }, (error, uploadResult) => {
          if (error) {
            reply.code(500).send({ error: 'Failed to upload image' });
          } else {
            resolve(uploadResult);
            reply.send({
              url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          }
        })
        .end(buffer);
    });
  } catch (error) {
    console.error(error);
  }
};

/*
This function is designed to handle the uploading of large video files to Cloudinary in manageable chunks. It uses the cloudinary.uploader.upload_large method, which is specifically designed for uploading large files, like videos, in smaller chunks to avoid common issues that arise with large uploads, such as timeouts or memory overload.

The video file being uploaded (singapore.mp4) is located in a folder called `video` within the local project directory. Note how the upload function specifies the resource_type as 'video', ensuring Cloudinary processes the file as a video. It also sets a chunk_size, defining the size of each piece into which the video will be divided during the upload process.

The function then responds with the secure URL of the uploaded video, allowing it to be accessed. This structure makes the function both reliable for large file uploads and capable of handling errors effectively.
*/
const uploadLargeFromLocal = async (request, reply) => {
  console.log('Uploading large files from the local filesystem');
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        `${import.meta.dirname}/video/singapore.mp4`,
        {
          resource_type: 'video',
          chunk_size: CHUNK_SIZE,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
    reply.send({ url: uploadResult.secure_url });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Failed to upload video' });
  }
};

/*
The `uploadLocalFromBrowserChunked` function is designed to handle file uploads from the browser in chunks, allowing large files to be uploaded piece by piece rather than all at once. This is useful for managing large file uploads efficiently, especially in cases where the client may be constrained by bandwidth or where interruptions could occur during the upload. 

The function starts by extracting the file data from the request. If no file is provided, it immediately sends a 400 error response. Next, it checks for two required headers: `x-unique-upload-id`, which uniquely identifies the upload, and `content-range`, which specifies the byte range of the chunk being uploaded. If either of these headers is missing, the function returns a 400 error indicating the problem.

Once the headers are validated, the function parses the `Content-Range` header to extract the start, end, and total size of the file. These values allow the function to determine where the current chunk fits in the larger file. The function then ensures that a local directory exists to store the uploaded chunks, creating it if necessary, and opens a write stream to append the current chunk to the correct file.

After writing the chunk to disk, the function checks whether the total file size has been reached. If the file is complete, it proceeds to upload the entire file to Cloudinary using the `upload_large` method, which handles large files in chunks. Once the upload to Cloudinary is complete, the temporary file is deleted, and the function responds with the URL of the uploaded file. If only part of the file has been received, the function responds with a message indicating the size of the data received so far.
*/
const uploadLocalFromBrowserChunked = async (request, reply) => {
  console.log(
    'Uploading files from the browser to the local filesystem and then to Cloudinary'
  );
  try {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const uniqueUploadId = request.headers['x-unique-upload-id'];
    const contentRange = request.headers['content-range'];

    if (!uniqueUploadId || !contentRange) {
      return reply.status(400).send({ error: 'Missing headers' });
    }

    const rangeMatches = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/);
    if (!rangeMatches) {
      return reply.status(400).send({ error: 'Invalid Content-Range header' });
    }

    const start = parseInt(rangeMatches[1], 10);
    const totalSize = parseInt(rangeMatches[3], 10);

    const uploadDir = join(__dirname, 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, `${uniqueUploadId}.tmp`);
    const writeStream = createWriteStream(filePath, { flags: 'a', start });

    await new Promise((resolve, reject) => {
      data.file.pipe(writeStream);
      data.file.on('end', resolve);
      writeStream.on('error', reject);
    });

    const fileStats = statSync(filePath);

    if (fileStats.size === totalSize) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_large(
            filePath,
            {
              resource_type: 'auto',
              chunk_size: CHUNK_SIZE,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
        });

        unlinkSync(filePath);

        reply.send({ status: 'Upload complete', url: uploadResult.secure_url });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError);
        reply.status(500).send({ error: 'Failed to upload to Cloudinary' });
      }
    } else {
      reply.send({ status: 'Chunk received', receivedSize: fileStats.size });
    }
  } catch (error) {
    console.error('Error processing upload:', error);
    reply
      .status(500)
      .send({ error: 'Internal fastify error', details: error.message });
  }
};

/*

*/
const uploadLargeStreamFromBrowser = async (request, reply) => {
  console.log('Uploading large files from the browser using streams');
  try {
    const data = await request.file();

    const buffer = await data.toBuffer();
    await new Promise((resolve) => {
      cloudinary.uploader
        .upload_large_stream({ tags }, (error, uploadResult) => {
          if (error) {
            console.error(error);
            reply.code(500).send({ error: 'Failed to upload video' });
          } else {
            resolve(uploadResult);
            reply.send({
              url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          }
        })
        .end(buffer);
    });
  } catch (error) {
    console.error(error);
  }
};

export {
  listUploadedFiles,
  uploadFromBrowser,
  uploadFromLocal,
  uploadLargeFromLocal,
  uploadLargeStreamFromBrowser,
  uploadLocalFromBrowserChunked,
};
