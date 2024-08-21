import Fastify from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import {
  readdirSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  createWriteStream,
  statSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors);
await fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 100 * 1024 * 1024,
    fieldSize: 100 * 1024 * 1024,
  },
});

const CHUNK_SIZE = 6000000;

const tags = ['nodejs-sample'];

fastify.get('/list_uploaded_files', async (request, reply) => {
  const { resources } = await cloudinary.api.resources_by_tag('nodejs-sample');
  const publicIds = resources.map((resource) => resource.public_id);
  const transformedUrls = publicIds.map((publicId) =>
    cloudinary.url(publicId, {
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
});

fastify.get('/upload_from_local', async (request, reply) => {
  try {
    const photosDir = `${import.meta.dirname}/photos`;
    const localFiles = readdirSync(photosDir).map((file) =>
      join(photosDir, file)
    );
    const uploadPromises = localFiles.map(async (localFile) => {
      return await cloudinary.uploader.upload(localFile, {
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
});

fastify.post('/upload_from_browser', async (request, reply) => {
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
    console.log(error);
  }
});

fastify.get('/upload_large_from_local', async (request, reply) => {
  try {
    console.log('calling largeUpload');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        `${import.meta.dirname}/video/singapore.mp4`,
        {
          resource_type: 'video',
          chunk_size: 6000000,
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
    console.log(error);
    reply.code(500).send({ error: 'Failed to upload video' });
  }
});

fastify.post('/upload_large_from_browser_chunked', async (request, reply) => {
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
    const end = parseInt(rangeMatches[2], 10);
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
      // All chunks received, start Cloudinary upload
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

        // Delete the temporary file
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
});
// should try with video
fastify.post('/upload_large_stream_from_browser', async (request, reply) => {
  try {
    const data = await request.file();

    const buffer = await data.toBuffer();
    await new Promise((resolve) => {
      cloudinary.uploader
        .upload_large_stream({ tags }, (error, uploadResult) => {
          if (error) {
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
    console.log(error);
  }
});

try {
  await fastify.listen({ port: 3000 });
} catch (error) {
  fastify.log.error(err);
  process.exit(1);
}
