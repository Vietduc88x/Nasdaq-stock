module.exports = {
  apps: [{
    name: 'market-api',
    script: 'src/server.js',
    cwd: '/opt/market-api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 3004,
      LOG_LEVEL: 'info'
    }
  }]
};
