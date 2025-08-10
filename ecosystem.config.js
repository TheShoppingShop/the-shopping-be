module.exports = {
  apps: [
    {
      name: 'theshopping-api',
      cwd: '/home/nematov/projects/theshopping/the-shopping-be',
      script: 'dist/src/main.js',

      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',

      env: {
        NODE_ENV: 'production',
        PORT: 3011,
      },
    },
  ],

  deploy: {
    production: {
      user: 'nematov',

      host: '5.180.151.142',

      ref: 'origin/main',

      repo: 'https://github.com/TheShoppingShop/the-shopping-be.git',

      path: '/home/nematov/projects/theshopping',

      // ssh_options: ["ForwardAgent=yes"],

      'post-deploy': [
        'mkdir -p logs',
        'npm ci',
        'npm run build',

        'npx typeorm -d dist/src/db/data-source.js migration:run || true',

        'pm2 reload ecosystem.config.js --only theshopping-api --update-env',
      ].join(' && '),

      env: {
        NODE_ENV: 'production',
        PORT: 3011,
      },
    },
  },
};
