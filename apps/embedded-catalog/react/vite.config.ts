import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dts from 'vite-plugin-dts'
import * as packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    dts({
      include: ['src/components/'],
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }, 
  build: {
    lib: {
      entry: path.resolve("src", 'components/index.ts'),
      name: 'integration-card-react',
      formats: ['es', 'umd'],
      fileName: (format) => `integration-card-react.${format}.js`
    },
    rollupOptions: {
      external:[...Object.keys(packageJson.peerDependencies)],
    }
  },
})
