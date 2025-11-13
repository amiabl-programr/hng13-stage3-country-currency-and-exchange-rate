export async function up(knex) {
  await knex.schema.createTable('countries', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('capital', 255);
    table.string('region', 100);
    table.bigInteger('population').notNullable();
    table.string('currency_code', 10);
    table.float('exchange_rate');
    table.float('estimated_gdp');
    table.string('flag_url', 1000);
    table
      .dateTime('last_refreshed_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table.unique(['name'], { indexName: 'uq_name' });
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('countries');
}
