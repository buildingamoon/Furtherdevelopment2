module.exports = {
  apps: [
    {
      name: 'o-dotsfrontend',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        BASE_URL: 'https://o-dots.com'
      },
      env_development: {
        NODE_ENV: 'development',
        BASE_URL: 'http://localhost:3000'
      }
    }
  ]
};
