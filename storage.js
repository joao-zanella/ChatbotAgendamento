const storage = require('node-persist');

const iniciarBanco = async () => await storage.init();

const salva = async () => {
    //you must first call storage.init
    //await storage.init( /* options ... */);
    await storage.setItem('name', 'Ericles B');
    console.log(await storage.getItem('name')); // yourname
}

iniciarBanco();

setTimeout(() => salva(), 5000);


/* EXEMPLO INTEIRO COM LIMPEZA DE CACHE AUTOMATICA, SÓ FUNCIONA QUANDO O WEBSERVICE RODA NO SERVIDOR SEMPRE, SEM DORMIR
await storage.init({
    dir: 'relative/path/to/persist',

    stringify: JSON.stringify,

    parse: JSON.parse,

    encoding: 'utf8',

    logging: false,  // can also be custom logging function

    ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS or a valid Javascript Date object

    expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache

    // in some cases, you (or some other service) might add non-valid storage files to your
    // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
    forgiveParseErrors: false

});

*/