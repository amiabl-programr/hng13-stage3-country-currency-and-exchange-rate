import db  from '../db/db.js';
import axios from 'axios';
import { generateSummaryImage } from '../utils/generateSummaryImage.js';

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
    // Fetch country and exchange rate data
    const { data: countries } = await axios.get(
      'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'
    );
    const { data: ratesData } = await axios.get('https://open.er-api.com/v6/latest/USD');
    const exchangeRates = ratesData.rates;

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Loop through all countries
    for (const country of countries) {
      const name = country.name;
      const capital = country.capital || null;
      const region = country.region || null;
      const population = country.population || 0;
      const flag_url = country.flag || null;

      let currency_code = null;
      let exchange_rate = null;
      let estimated_gdp = null;

      if (country.currencies?.length > 0) {
        currency_code = country.currencies[0].code || null;
      }

      if (currency_code && exchangeRates[currency_code]) {
        exchange_rate = exchangeRates[currency_code];
        const multiplier = Math.floor(Math.random() * 1001) + 1000; 
        estimated_gdp = (population * multiplier) / exchange_rate;
      } else {
        exchange_rate = null;
        estimated_gdp = 0;
      }

      // Check existing record
      const existing = await db('countries')
        .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
        .first();

      if (existing) {
        // Update
        await db('countries')
          .where({ id: existing.id })
          .update({
            capital,
            region,
            population,
            currency_code,
            exchange_rate,
            estimated_gdp,
            flag_url,
            last_refreshed_at: now,
          });
      } else {
        // Insert
        await db('countries').insert({
          name,
          capital,
          region,
          population,
          currency_code,
          exchange_rate,
          estimated_gdp,
          flag_url,
          last_refreshed_at: now,
        });
      }
    }


    // 4️⃣ Respond
    const total = await db('countries').count('* as total');
    // Generate summary image
    const allCountries = await db('countries').select('*');
    generateSummaryImage(allCountries, now);
    res.json({
      message: 'Countries refreshed successfully',
      total_countries: total[0].total,
      last_refreshed_at: now,
    });
  } catch (err) {
    console.error('Refresh failed:', err);
    res.status(500).json({
      error: 'External data source unavailable',
      details: err.message,
    });
  }
};


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