
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env',
});
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message, err.stack);

  process.exit(1);
});
const app = require('./app');
 
// Start Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);


  server.close(() => {
    process.exit(1);
  });
});
