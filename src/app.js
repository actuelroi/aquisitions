import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello from the index with in src folder ');
});

export default app;
