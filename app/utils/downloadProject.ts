import JSZip from 'jszip';
import type { FileMap } from '~/lib/stores/files';
import { WORK_DIR } from './constants';
import { BRAND } from './brand';

/**
 * Bundles the current in-memory generated project into a .zip and triggers
 * a browser download. Only includes real files (skips folders/binary
 * placeholders without content).
 */
export async function downloadProjectZip(files: FileMap) {
  const zip = new JSZip();

  let fileCount = 0;

  for (const [path, dirent] of Object.entries(files)) {
    if (!dirent || dirent.type !== 'file' || dirent.isBinary) {
      continue;
    }

    const relativePath = path.startsWith(WORK_DIR) ? path.slice(WORK_DIR.length + 1) : path.replace(/^\/+/, '');

    if (!relativePath) {
      continue;
    }

    zip.file(relativePath, dirent.content);
    fileCount++;
  }

  if (fileCount === 0) {
    throw new Error('No files available to download yet');
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${BRAND.shortName.toLowerCase()}-website.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
