import AppBootstrap from'./app/app-bootstrap.js';

async function main() {
  const app = new AppBootstrap();

  try {
    await app.start();
  } catch (error) {
    console.error('Erro fatal ao iniciar a aplicacao:', error);
    process.exit(1);
  }
}

main();
