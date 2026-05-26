module.exports = {
  apps: [
    {
      name: 'neighbornet-backend',
      script: 'src/server.js',
      cwd: 'D:/NeighborNet/neighbornet-resilience/server',
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
    },
    {
      name: 'neighbornet-frontend',
      script: 'serve-frontend.js',
      cwd: 'D:/NeighborNet/neighbornet-resilience/client',
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
