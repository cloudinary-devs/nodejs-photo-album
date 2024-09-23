import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(__dirname, '../.env') });
export default defineConfig({
  define: {
    'process.env': process.env,
  },
});
