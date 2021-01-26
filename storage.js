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

});else if (msg == 'Cancelar consulta.') {

        let horasMarcadas = [];
        let verifHora = '13:30';
        let verifDia = '22/01/2021';

        if (horasMarcadas.length > 2) {
            response = {
                "text": 'Você tem horários marcados para os seguintes dias: ',
                quick_replies: [
                    {
                        "content_type": "text",
                        "title": `${verifDia} - ${verifHora}`,
                        "payload": `${verifDia} - ${verifHora}`
                    },
                    {
                        "content_type": "text",
                        "title": `${verifDia} - ${verifHora}`,
                        "payload": `${verifDia} - ${verifHora}`
                    },
                ]
            };
        }
        else if (horasMarcadas.length < 2) {
            response = {
                "text": `Seu horário marcado para dia ${verifDia} e ${verifHora} foi cancelado.`
            };
        } else {
            response = {
                "text": 'Desculpe, não encontramos horários agendados em seu nome.\n Certifique-se de estar logado na mesma conta que o senhor(a) fez o agendamento.'
            };
        }

    }

*/