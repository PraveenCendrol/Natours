const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
process.on('uncaughtException', err => {
  console.log('Process Exited uncaughtExpression :=)');
  console.log(err);
  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => {
  console.log(`Database connected successfully`);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', err => {
  console.log('Process Exited :=)', err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
