import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Bundles ui/index.html and everything it imports into the single file dist/ui/index.html.
export default defineConfig({
    plugins: [viteSingleFile()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: { input: 'ui/index.html' },
    },
});
