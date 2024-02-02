import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }, 
  build: {
    lib: {
      entry: path.resolve("src", 'src/components/index.ts'),
      name: 'panora-integration-card',
      fileName: (format) => `panora-integration-card.${format}.ts`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  },
})
