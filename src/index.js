import app from './app';
import { configSocket } from './configs/config-socket';

app.on('ready', () => {
  const port = process.env.PORT;
  const server = configSocket(app);
  server.listen(port, () => {
    console.log(`Server is runing on localhost:${port} 🐳`);
  });
});
