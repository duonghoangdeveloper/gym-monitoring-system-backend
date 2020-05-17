import app from './app';

app.on('ready', () => {
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server is runing on localhost:${port} 🐳`);
  });
});
