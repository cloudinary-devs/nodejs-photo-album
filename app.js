import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';

import {
  listUploadedFiles,
  uploadFromBrowser,
  uploadFromLocal,
  uploadLargeFromLocal,
  uploadLargeStreamFromBrowser,
  uploadLocalFromBrowserChunked,
} from './routes/routeHandlers.js';

/*
This sample project uses Fastify, a fast and low overhad web framework for Node.js.
It gets instantiated with logging enabled which allows us to track request/response cycles in the console
For more visit https://fastify.dev.
*/
const fastify = Fastify({
  // logger: true,
});

/*
CORS requests are enabled for our server, as request will arrive to this server from a frontend
that runs on a different port.
*/
await fastify.register(cors);

// fileSize: 100 * 1024 * 1024: This sets the maximum allowed file size to 100 megabytes (MB).
await fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

// this endpoint retrieves all uploaded files
fastify.get('/list-uploaded-files', listUploadedFiles);

// this endpoint uploads files from the local filesystem
fastify.get('/upload-from-local', uploadFromLocal);

// this endpoint uploads files directly from the browser
fastify.post('/upload-from-browser', uploadFromBrowser);

// this endpoint uploads large files from the local fileystem
fastify.get('/upload-large-from-local', uploadLargeFromLocal);

// this endpoint uploads large files in chunks from the browser
fastify.post(
  '/upload-large-from-browser-chunked',
  uploadLocalFromBrowserChunked
);

// this endpoint uploads large files using streams from the browser
fastify.post('/upload-large-stream-from-browser', uploadLargeStreamFromBrowser);

try {
  // the fastify server runs on port 3000
  await fastify.listen({ port: 3000 });
} catch (error) {
  // any errors with the server will be logged and the server gracefully shuts down
  fastify.log.error(error);
  process.exit(1);
}
