import db  from '../db/db.js';
import axios from 'axios';
import { generateSummaryImageBuffer } from '../utils/generateSummaryImage.js';

export async function getCountries(req, res) {
     try {
    const { region, currency, sort } = req.query;

    let query = db('countries').select('*');

    if (region) {
      query = query.where('region', region);
    }

    if (currency) {
      query = query.where('currency_code', currency);
    }

   
    if (sort) {
      const [field, direction] = sort.split('_');
      const validFields = {
        gdp: 'estimated_gdp',
        population: 'population',
        name: 'name',
        exchange: 'exchange_rate',
      };

      if (validFields[field]) {
        query = query.orderBy(validFields[field], direction === 'desc' ? 'desc' : 'asc');
      }
    }

    const countries = await query;


    res.status(200).json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getSpecificCountry(req, res) {
const {name} = req.params;

  try {
    const country = await db('countries')
      .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
      .first();

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.status(200).json(country);
  } catch (error) {
    console.error('Error fetching country:', error.message);
    res.status(500).json({ error: 'Server error' });
  }

}

export async function generateStatus(req, res) {
  
    try {
    const [{ count }] = await db('countries').count('id as count');
    const [{ last_refreshed_at }] = await db('countries')
      .select('last_refreshed_at')
      .orderBy('last_refreshed_at', 'desc')
      .limit(1);

    res.status(200).json({
      total_countries: Number(count),
      last_refreshed_at: last_refreshed_at
        ? new Date(last_refreshed_at).toISOString()
        : null,
    });
  } catch (error) {
    console.error('Error fetching status:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export const createCountry = async (req, res) => {
  try {
    console.log('🌍 Refreshing country data...');

    // Fetch both APIs in parallel
    const [countriesRes, ratesRes] = await Promise.all([
      axios.get('https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'),
      axios.get('https://open.er-api.com/v6/latest/USD'),
    ]);

    const countries = countriesRes.data;
    const exchangeRates = ratesRes.data.rates;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Prepare all country objects
    const countryData = countries.map(c => {
      const currency = c.currencies?.[0]?.code || null;
      const rate = currency && exchangeRates[currency] ? exchangeRates[currency] : null;
      const multiplier = Math.floor(Math.random() * 1001) + 1000;
      const gdp = rate ? (c.population * multiplier) / rate : 0;

      return {
        name: c.name,
        capital: c.capital || null,
        region: c.region || null,
        population: c.population || 0,
        currency_code: currency,
        exchange_rate: rate,
        estimated_gdp: gdp,
        flag_url: c.flag || null,
        last_refreshed_at: now,
      };
    });

    // Fetch existing country names once
    const existingCountries = await db('countries').select('id', 'name');
    const existingMap = new Map(
      existingCountries.map(c => [c.name.toLowerCase(), c.id])
    );

    // Separate inserts and updates
    const inserts = [];
    const updates = [];

    for (const c of countryData) {
      const existingId = existingMap.get(c.name.toLowerCase());
      if (existingId) {
        updates.push({ ...c, id: existingId });
      } else {
        inserts.push(c);
      }
    }

    // Run updates and inserts in batches
    if (updates.length > 0) {
      const updatePromises = updates.map(u =>
        db('countries').where({ id: u.id }).update(u)
      );
      await Promise.all(updatePromises);
    }

    if (inserts.length > 0) {
      await db.batchInsert('countries', inserts, 100); // insert in batches of 100
    }

    // Count total
    const [{ total }] = await db('countries').count('* as total');

    console.log(`✅ Refreshed ${inserts.length} new, ${updates.length} updated`);
    res.status(200).json({
      message: 'Countries refreshed successfully',
      total_countries: total,
      last_refreshed_at: now,
    });
  } catch (err) {
    console.error('❌ Refresh failed:', err.message);
    res.status(500).json({
      error: 'External data source unavailable',
      details: err.message,
    });
  }
};


export async function generateSummaryImage(req,res) {
    try {
    const countries = await db('countries').select('*');
    const lastRefreshedAt = new Date().toLocaleString();

    const imageBuffer = generateSummaryImageBuffer(countries, lastRefreshedAt);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(imageBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate summary image' });
  }
}

export async function deleteCountry(req, res) {
  // Function implementation
  const {name} = req.params;
  
//   check if country exists in the database
try{
    const country = await db('countries')
    .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
    .first();

    if (!country) {
      return  res.status(404).json({ error: 'Country not found' });
    }

    await db('countries')
    .where({id: country.id}) 
    .del();
    res.status(204).send();

} catch {
    console.error('Error deleting country:', error.message);
    res.status(500).json({ error: 'Server error' });
}

}