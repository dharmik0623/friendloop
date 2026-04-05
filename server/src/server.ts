import http from 'http';
import app from './app';
import setupSockets from './sockets';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize WebSockets
const io = setupSockets(server);
app.set('io', io);

server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
