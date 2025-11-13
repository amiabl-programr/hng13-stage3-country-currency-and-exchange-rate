export default {
  test: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    migrations: { directory: "./migrations" },
  }
};
