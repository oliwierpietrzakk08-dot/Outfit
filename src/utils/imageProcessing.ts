import { removeBackground } from '@imgly/background-removal';

export const processImage = async (file: File): Promise<string> => {
  try {
    const blob = await removeBackground(file, {
      publicPath: 'https://static.img.ly/packages/@imgly/background-removal/1.7.0/dist/', // CDN for WASM
      progress: (key, current, total) => {
        console.log(`Processing ${key}: ${current}/${total}`);
      }
    });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error removing background:', error);
    // Fallback: return original image if background removal fails
    return URL.createObjectURL(file);
  }
};
