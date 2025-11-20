console.log('Worker started. Something meaningful will go here later.');

setInterval(() => {
  console.log('Worker heartbeat:', new Date().toISOString());
}, 5000);
