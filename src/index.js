const WhatsAppService = require('./services/whatsapp.service');

async function main() {
  console.log('='.repeat(50));
  console.log(' Iniciando Bot WhatsApp');
  console.log('='.repeat(50));
  console.log();

  const whatsapp = new WhatsAppService();

  try {
    await whatsapp.connect();
  } catch (error) {
    console.error('Erro fatal:', error);
    process.exit(1);
  }

  process.on('SIGINT', async () => {
    console.log('\n\nEncerrando aplicação...');
    await whatsapp.disconnect();
    process.exit(0);
  });
}

main();