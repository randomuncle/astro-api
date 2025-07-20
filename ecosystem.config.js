module.exports = {
  apps: [{
    name: 'astrology-api',
    script: './server.js',
    
    // 🔧 Production Configuration
    instances: 'max', // Usa tutti i core CPU disponibili
    exec_mode: 'cluster',
    
    // 🔄 Auto Restart
    autorestart: true,
    watch: false, // Disabilita in produzione
    max_memory_restart: '1G',
    
    // 📝 Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 🌍 Environment Variables
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      instances: 'max'
    }
  }]
};