import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

const config = {
  plugins: [
    [
      "@tailwindcss/postcss",
      {
        base: rootDir,
      },
    ],
  ],
};

export default config;
