import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // يدعم العمل على GitHub Pages وأي استضافة فرعية بدون أخطاء المسارات
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});
