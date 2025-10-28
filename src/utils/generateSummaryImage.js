import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

/**
 * Generates summary.png with total countries, top 5 by GDP, and last refresh timestamp
 */
export const generateSummaryImage = (countries = [], lastRefreshedAt) => {
  try {
    console.log('🖼️ Generating summary image...');
    if (!Array.isArray(countries) || countries.length === 0) {
      console.warn('⚠️ No country data provided to generate summary image.');
      countries = [];
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
    ctx.font = 'bold 28px Arial';
    ctx.fillText('🌍 Country Summary Report', 40, 60);

    // 🕒 Timestamp
    ctx.font = '16px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`Last Refreshed: ${lastRefreshedAt || 'Unknown'}`, 40, 100);

    // 📊 Total countries
    const totalCountries = countries.length;
    ctx.fillStyle = '#00c46a';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`Total Countries: ${totalCountries}`, 40, 140);

    // 💰 Top 5 by GDP
    const top5 = countries
      .filter(c => c.estimated_gdp && !isNaN(c.estimated_gdp))
      .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
      .slice(0, 5);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Top 5 Countries by Estimated GDP', 40, 200);

    ctx.font = '18px Arial';
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

    // 💾 Save output
    const outputDir = path.resolve('cache');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'summary.png');
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on('finish', () => console.log(`✅ Summary image saved to ${outputPath}`));
  } catch (err) {
    console.error('❌ Failed to generate summary image:', err.message);
  }
};
