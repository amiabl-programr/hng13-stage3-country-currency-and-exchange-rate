import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Generates a summary PNG image (served directly in the browser)
 */

export const generateSummaryImageBuffer = (countries = [], lastRefreshedAt) => {
    // Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const fontPath = path.join(__dirname, '..',  'fonts', 'Ubuntu-B.ttf');
  registerFont(fontPath, { family: 'Ubuntu' });
} catch (err) {
  console.warn('⚠️ Font file not found — using fallback font.');
}
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 🟦 Background
  ctx.fillStyle = '#101828';
  ctx.fillRect(0, 0, width, height);

  // 🏷️ Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Ubuntu';
  ctx.fillText('🌍 Country Summary Report', 40, 60);

  // 🕒 Timestamp
  ctx.font = '16px Ubuntu';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`Last Refreshed: ${lastRefreshedAt || 'Unknown'}`, 40, 100);

  // 📊 Total countries
  const totalCountries = countries.length;
  ctx.fillStyle = '#00c46a';
  ctx.font = 'bold 22px Ubuntu';
  ctx.fillText(`Total Countries: ${totalCountries}`, 40, 140);

  // 💰 Top 5 by GDP
  const top5 = countries
    .filter(c => c.estimated_gdp && !isNaN(c.estimated_gdp))
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Ubuntu';
  ctx.fillText('Top 5 Countries by Estimated GDP', 40, 200);

  ctx.font = '18px Ubuntu';
  let y = 240;

  if (top5.length === 0) {
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('No valid GDP data available.', 60, y);
  } else {
    for (const [i, c] of top5.entries()) {
      ctx.fillStyle = '#00b4d8';
      ctx.fillText(`${i + 1}. ${c.name}`, 60, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`$${c.estimated_gdp.toFixed(2)} billion`, 400, y);
      y += 40;
    }
  }

  // Return as a buffer (instead of saving to disk)
  return canvas.toBuffer('image/png');
};
