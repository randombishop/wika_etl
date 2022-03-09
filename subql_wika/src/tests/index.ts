// The Postgres operations rely on the global variable `store`
// that will be provided by Subquery in the sandbox
// Therefore, we disable Postgres to run the tests.
process.env.DB_ENABLE = "0";
