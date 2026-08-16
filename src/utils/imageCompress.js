/**
 * Convierte cualquier imagen (jpg, png, gif, bmp, etc.) a formato .webp
 * usando canvas, 100% del lado del cliente, sin librerías externas.
 *
 * Limitación conocida: los navegadores no pueden decodificar HEIC/HEIF
 * (formato que usan los iPhone por defecto) desde <canvas>. Si un cliente
 * sube una foto HEIC directo desde su iPhone sin pasar por Fotos/WhatsApp,
 * la conversión va a fallar y se devuelve el archivo original sin tocar.
 *
 * @param {File} file - Archivo de imagen original
 * @param {Object} opciones
 * @param {number} opciones.calidad - 0 a 1 (default 0.85)
 * @param {number} opciones.maxAncho - Redimensiona si es más ancha (default 1600)
 * @returns {Promise<File>} - Nuevo File en formato webp
 */
export async function compressToWebp(file, { calidad = 0.85, maxAncho = 1600 } = {}) {
  // Si el navegador no soporta la conversión, devolvemos el original
  if (!file || !file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    if (width > maxAncho) {
      height = Math.round((height * maxAncho) / width);
      width = maxAncho;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', calidad)
    );

    // Si el navegador no soporta codificar a webp, toBlob devuelve null
    if (!blob) return file;

    const nombreBase = file.name.replace(/\.[^/.]+$/, '');
    return new File([blob], `${nombreBase}.webp`, { type: 'image/webp' });
  } catch (err) {
    console.error('No se pudo convertir la imagen a webp, se sube la original:', err);
    return file;
  }
}

/**
 * Igual que compressToWebp pero para un array de archivos (por si más
 * adelante agregás carga múltiple de fotos adicionales).
 */
export async function compressManyToWebp(files, opciones) {
  return Promise.all(Array.from(files).map((f) => compressToWebp(f, opciones)));
}