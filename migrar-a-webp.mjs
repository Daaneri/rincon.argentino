// migrar-a-webp.mjs
// Script de UNA SOLA VEZ. Convierte todas las imágenes del bucket "productos"
// a .webp, actualiza image_url / image_urls en la tabla productos, y borra
// los archivos originales (jpg/png/etc) del Storage.
//
// Uso: node migrar-a-webp.mjs

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// --- Completá esto con tus datos ---
const SUPABASE_URL = 'https://jcdexakycfpnfymuukzt.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZGV4YWt5Y2ZwbmZ5bXV1a3p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTkxMjYxMCwiZXhwIjoyMDk3NDg4NjEwfQ._HxFbUfAhMpEfc8E4uvAFWbCxV0G_XDwPUnZDajbc-M'; // Project Settings > API > service_role
const BUCKET = 'productos';
const CALIDAD_WEBP = 85; // 0-100
// ------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function esWebp(nombre) {
  return nombre.toLowerCase().endsWith('.webp');
}

function urlPublica(nombreArchivo) {
  return supabase.storage.from(BUCKET).getPublicUrl(nombreArchivo).data.publicUrl;
}

async function convertirArchivo(nombreArchivo) {
  // 1. Descargar original
  const { data: blob, error: errDescarga } = await supabase.storage
    .from(BUCKET)
    .download(nombreArchivo);
  if (errDescarga) {
    console.error(`  ✗ Error descargando ${nombreArchivo}:`, errDescarga.message);
    return null;
  }

  const buffer = Buffer.from(await blob.arrayBuffer());

  // 2. Convertir a webp
  let webpBuffer;
  try {
    webpBuffer = await sharp(buffer).webp({ quality: CALIDAD_WEBP }).toBuffer();
  } catch (err) {
    console.error(`  ✗ Error convirtiendo ${nombreArchivo}:`, err.message);
    return null;
  }

  // 3. Subir la versión webp
  const nombreBase = nombreArchivo.replace(/\.[^/.]+$/, '');
  const nuevoNombre = `${nombreBase}.webp`;

  const { error: errSubida } = await supabase.storage
    .from(BUCKET)
    .upload(nuevoNombre, webpBuffer, { contentType: 'image/webp', upsert: true });

  if (errSubida) {
    console.error(`  ✗ Error subiendo ${nuevoNombre}:`, errSubida.message);
    return null;
  }

  // 4. Borrar el original
  const { error: errBorrado } = await supabase.storage.from(BUCKET).remove([nombreArchivo]);
  if (errBorrado) {
    console.error(`  ⚠ Se subió ${nuevoNombre} pero no se pudo borrar el original ${nombreArchivo}:`, errBorrado.message);
  }

  return { nombreOriginal: nombreArchivo, nombreNuevo: nuevoNombre };
}

async function main() {
  console.log('Listando archivos del bucket...');
  const { data: archivos, error } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 1000 });

  if (error) {
    console.error('Error listando el bucket:', error.message);
    return;
  }

  const paraConvertir = archivos.filter((f) => f.name && !f.name.endsWith('/') && !esWebp(f.name));
  console.log(`${paraConvertir.length} archivo(s) para convertir de ${archivos.length} totales.\n`);

  // mapa: url vieja -> url nueva
  const mapaUrls = new Map();

  for (const archivo of paraConvertir) {
    console.log(`Convirtiendo: ${archivo.name}`);
    const resultado = await convertirArchivo(archivo.name);
    if (resultado) {
      const urlVieja = urlPublica(resultado.nombreOriginal);
      const urlNueva = urlPublica(resultado.nombreNuevo);
      mapaUrls.set(urlVieja, urlNueva);
      console.log(`  ✓ ${resultado.nombreNuevo}`);
    }
  }

  console.log(`\nActualizando tabla productos (${mapaUrls.size} URL(s) migradas)...`);

  const { data: productos, error: errProductos } = await supabase.from('productos').select('*');
  if (errProductos) {
    console.error('Error leyendo productos:', errProductos.message);
    return;
  }

  let actualizados = 0;
  for (const p of productos) {
    let cambio = false;
    let nuevoImageUrl = p.image_url;
    let nuevosImageUrls = Array.isArray(p.image_urls) ? [...p.image_urls] : [];

    if (p.image_url && mapaUrls.has(p.image_url)) {
      nuevoImageUrl = mapaUrls.get(p.image_url);
      cambio = true;
    }

    nuevosImageUrls = nuevosImageUrls.map((url) => {
      if (mapaUrls.has(url)) {
        cambio = true;
        return mapaUrls.get(url);
      }
      return url;
    });

    if (cambio) {
      const { error: errUpdate } = await supabase
        .from('productos')
        .update({ image_url: nuevoImageUrl, image_urls: nuevosImageUrls })
        .eq('id', p.id);

      if (errUpdate) {
        console.error(`  ✗ Error actualizando producto ${p.id} (${p.name}):`, errUpdate.message);
      } else {
        actualizados++;
        console.log(`  ✓ Producto actualizado: ${p.name}`);
      }
    }
  }

  console.log(`\nListo. ${paraConvertir.length} imagen(es) convertida(s), ${actualizados} producto(s) actualizado(s).`);
}

main();
