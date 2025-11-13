# Country Currency and Exchange Rate API

## Overview
This is a robust Node.js Express backend application designed to fetch, store, and serve comprehensive country data, including currency and exchange rates. It leverages Knex.js for database abstraction, integrates with external APIs for data enrichment, and provides dynamic image generation for data summaries.

## Features
-   **Express.js**: Implements a RESTful API for efficient data retrieval and management.
-   **Knex.js**: Provides a powerful SQL query builder for interacting with relational databases, ensuring maintainable and scalable data operations.
-   **Axios**: Facilitates seamless integration with third-party APIs (restcountries.com, open.er-api.com) to fetch country details and up-to-date exchange rates.
-   **Node-Canvas**: Dynamically generates visual summary reports of country data as PNG images.
-   **Data Refresh Mechanism**: Periodically updates country information and exchange rates, ensuring data currency.
-   **Filtering and Sorting**: Allows clients to filter countries by region or currency, and sort results by population, GDP, name, or exchange rate.
-   **Global Error Handling**: Centralized error management for consistent API responses.

## Getting Started
### Installation
To set up and run this project locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/amiabl-programr/hng13-stage3-country-currency-and-exchange-rate.git
    ```
2.  **Navigate to Project Directory**:
    ```bash
    cd hng13-stage3-country-currency-and-exchange-rate
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Set up Database (Example for MySQL)**:
    While `knexfile.js` shows a test setup with SQLite, for a persistent database, MySQL is typically used given the `mysql2` dependency. Ensure you have a MySQL server running and create a database for the project.

5.  **Run Migrations (if applicable)**:
    If database migrations are defined (though `migrations` directory is mentioned in `knexfile.js` but not provided, for a full setup this would be required):
    ```bash
    npx knex migrate:latest --env development # or --env production
    ```

6.  **Start the Server**:
    ```bash
    npm start
    ```
    The API server will start on the port specified in your environment variables, defaulting to `3000`.

### Environment Variables
Create a `.env` file in the root directory of the project and define the following environment variables:

-   `PORT`: The port on which the Express server will listen.
    ```
    PORT=3000
    ```
-   Database connection details for Knex.js (example for MySQL):
    ```
    DB_CLIENT=mysql2
    DB_CONNECTION_HOST=localhost
    DB_CONNECTION_PORT=3306
    DB_CONNECTION_USER=root
    DB_CONNECTION_PASSWORD=my_secure_password
    DB_CONNECTION_DATABASE=country_currency_db
    ```
    Alternatively, for SQLite (though typically for testing or simpler local setups):
    ```
    DB_CLIENT=sqlite3
    DB_CONNECTION_FILENAME=./dev.sqlite3
    USE_NULL_AS_DEFAULT=true
    ```
    *Note: The actual database configuration might be handled in a `db/db.js` file (which was not provided), and these variables are illustrative of common Knex configurations.*

## API Documentation
### Base URL
`http://localhost:PORT` (e.g., `http://localhost:3000`)

### Endpoints
#### GET /status
Retrieves a health check and statistics on the stored country data.

**Request**:
No request body or query parameters.

**Response**:
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2023-10-27T10:30:00.000Z"
}
```

**Errors**:
-   `500 Internal Server Error`: An unexpected error occurred while fetching status.

#### GET /countries
Retrieves a list of countries with optional filtering and sorting capabilities.

**Request**:
Query Parameters (all optional):
-   `region`: Filter countries by their geographical region (e.g., `Europe`, `Americas`).
-   `currency`: Filter countries by their primary currency code (e.g., `USD`, `EUR`).
-   `sort`: Sort the results. Format is `field_direction`. Valid fields: `gdp`, `population`, `name`, `exchange`. Valid directions: `asc` (ascending), `desc` (descending).
    Examples: `population_desc`, `gdp_asc`, `name_asc`, `exchange_desc`.

**Response**:
```json
[
  {
    "id": 1,
    "name": "United States",
    "capital": "Washington D.C.",
    "region": "Americas",
    "population": 331002651,
    "currency_code": "USD",
    "exchange_rate": 1.0,
    "estimated_gdp": 23000000000000.00,
    "flag_url": "https://flagcdn.com/us.svg",
    "last_refreshed_at": "2023-10-27 10:30:00"
  },
  {
    "id": 2,
    "name": "Canada",
    "capital": "Ottawa",
    "region": "Americas",
    "population": 37742154,
    "currency_code": "CAD",
    "exchange_rate": 1.35,
    "estimated_gdp": 2000000000000.00,
    "flag_url": "https://flagcdn.com/ca.svg",
    "last_refreshed_at": "2023-10-27 10:30:00"
  }
]
```

**Errors**:
-   `500 Internal Server Error`: An unexpected error occurred while fetching countries.

#### POST /countries/refresh
Refreshes the country data and exchange rates in the database by fetching the latest information from external APIs. This operation updates existing country records and inserts new ones.

**Request**:
No request body or query parameters.

**Response**:
```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2023-10-27 10:30:00"
}
```

**Errors**:
-   `500 Internal Server Error`: Failed to refresh countries, potentially due to issues with external data sources or database operations.

#### GET /countries/image
Generates a dynamic PNG image that provides a summary report of the stored country data, including total countries and the top 5 countries by estimated GDP.

**Request**:
No request body or query parameters.

**Response**:
Binary image data (Content-Type: `image/png`). The image will be directly served to the client.

**Errors**:
-   `500 Internal Server Error`: Failed to generate the summary image due to server-side issues.

#### GET /countries/:name
Retrieves detailed information for a specific country by its name. The lookup is case-insensitive.

**Request**:
Path Parameter:
-   `name`: The full name of the country (e.g., `Ghana`, `United States`).

**Response**:
```json
{
  "id": 1,
  "name": "United States",
  "capital": "Washington D.C.",
  "region": "Americas",
  "population": 331002651,
  "currency_code": "USD",
  "exchange_rate": 1.0,
  "estimated_gdp": 23000000000000.00,
  "flag_url": "https://flagcdn.com/us.svg",
  "last_refreshed_at": "2023-10-27 10:30:00"
}
```

**Errors**:
-   `404 Not Found`: No country found with the specified name.
-   `500 Internal Server Error`: An unexpected error occurred while fetching country details.

#### DELETE /countries/:name
Deletes a specific country record from the database by its name. The lookup is case-insensitive.

**Request**:
Path Parameter:
-   `name`: The full name of the country to be deleted (e.g., `Canada`).

**Response**:
`204 No Content` (Successful deletion, no response body).

**Errors**:
-   `404 Not Found`: No country found with the specified name to delete.
-   `500 Internal Server Error`: An unexpected error occurred during the deletion process.

## Technologies Used

| Technology         | Description                                                              | Link                                                       |
| :----------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------- |
| **Node.js**        | JavaScript runtime environment                                           | [nodejs.org](https://nodejs.org/)                          |
| **Express.js**     | Web framework for Node.js                                                | [expressjs.com](https://expressjs.com/)                    |
| **Knex.js**        | SQL query builder for JavaScript                                         | [knexjs.org](https://knexjs.org/)                          |
| **MySQL2**         | MySQL client for Node.js                                                 | [github.com/sidorares/node-mysql2](https://github.com/sidorares/node-mysql2) |
| **SQLite3**        | Lightweight disk-based database for Node.js                              | [github.com/TryGhost/node-sqlite3](https://github.com/TryGhost/node-sqlite3) |
| **Axios**          | Promise-based HTTP client for the browser and Node.js                    | [axios-http.com](https://axios-http.com/)                  |
| **Node-Canvas**    | Canvas implementation for Node.js for image generation                   | [npmjs.com/package/canvas](https://www.npmjs.com/package/canvas) |
| **Dotenv**         | Loads environment variables from a `.env` file                           | [npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) |
| **CORS**           | Middleware for enabling Cross-Origin Resource Sharing                    | [npmjs.com/package/cors](https://www.npmjs.com/package/cors) |

## Author Info
-   **Victor**
    -   LinkedIn: [linkedin.com/in/victor-your-username](https://linkedin.com/in/victor-your-username)
    -   Twitter: [twitter.com/victor_your_username](https://twitter.com/victor_your_username)

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/index.html)
[![Knex.js](https://img.shields.io/badge/Knex.js-4D789B?style=for-the-badge&logo=knexdotjs&logoColor=white)](https://knexjs.org/)
[![Project Status](https://img.shields.io/badge/Status-Active-brightgreen.svg?style=for-the-badge)](https://github.com/amiabl-programr/hng13-stage3-country-currency-and-exchange-rate)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)