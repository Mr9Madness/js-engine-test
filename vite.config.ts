import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    resolve: {
        alias: {
            '~/': resolve(__dirname, './src'),
        },
    },

    plugins: [vue()],
    build: {
        target: 'node20',
        outDir: 'dist',
        // sourcemap: isProduction ? false: 'inline',
        emptyOutDir: true,
        minify: false,
        lib: {
            entry: resolve(__dirname, './src/main.js'),
            fileName: 'main',
            formats: ['es'],
        },
    },
})
