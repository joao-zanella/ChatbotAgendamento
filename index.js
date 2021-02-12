'use strict';
const
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()),
    request = require('request'),
    storage = require('node-persist'), //storage local
    { google } = require('googleapis');

const calendarId = "ufmp7a0cef8kjm7vj9jkpt7lsc@group.calendar.google.com";
const serviceAccount = {
    "type": "service_account",
    "project_id": "webhookum",
    "private_key_id": "cce193fda2eac459a4f38978308cd69c66dc4cae",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDU5QzExPG2RhwJ\n84iWEuxdDf6gkPw6yG2R/ruPpiRNUR07ru5JnfKpjTKxzZSSd4WOX59/EzFTvBE8\nZJ/hTzqDKOrbrQWrzzjfStf22idF94YFTn7SOvU/FLM/C8xAeyzNYpHD8arf8pmK\nLzc79wsxnoHWHue8zzABy4tbKdWxWtPYE4PzoXDswXEFjXf3zaAmMYUtZ1xu5MCN\nAIdMfvTdKsZAdKVCqgdMC65i/4+FbPTpv+diad57YcI4fx4H7RVTcwbVc9Qyptrc\nqewqO+js2fJBTUeYMfa88T0+VFkRrHJEDOxxjP67zA5pakJfIrsAwLcCryemVxYO\n4Mx+hbu/AgMBAAECggEAE8QxKM3TrBBGBy3WLH+U9C4vSi+GnltAl8cLxBJxbr+i\nvrQHCiJrnDlwulhzkcZzdIdv/XJF6K0z+SRV7ICY1q0EYqFlvuYjtNEJTIaZvIx2\n+Y7TBeg/yqZnNBR/gix4OZjhdCIVMutz567AP/A32QNgsQWNOkG5sS5PAd0DAGSF\nRgkyvpLgpdiTQECyQSA3zB5VXzLFrnJhWtx2t0ooEgOC2DzMtHejlg1cDC6GqpCv\nU4UZ/IDgmGuCnExVBsZCeH7EKnqD5tU2+JNWL5EEq5CiX1TF8GvYzPkGwjQZbxCJ\nW+1CnKyudlL8lT1U9LeTFabu7uByqfo+/YIJznJ2XQKBgQDwMijfT+Qe2JUR0Ff9\nDeCPY5/FzQSwJKvr+um+Lev8mLA1e5ZttSPCu/zm1hz15M/DCbXIm4SkSL0R5pDK\nTWCraswOUXTfxGPT+KV+5fYN2aush8OyPolDyeTsXRr81LkWlteYtr0HKFHosonn\nFCiwZvPwbAYmQgAGvXEl1lOjxQKBgQDi5wfpzuoDOhBKueJ1RtCUPckAliPg/Vx3\nbXHwH5UJhhfmJnuMB2DHksYN3VgrT65fKCdWvffIqyWGgG/Pen03KNKkPEbhsbDn\n3VJqvxfMVtq/mCBUUe8MO7+b+a5HdGjXATFSVICdKBAb9UzvjUmit0cIaS20iz1A\nCJoC2A/lswKBgA1twHs7rDVNRohIbaLoM7XQjA4y+CAg7Lu0u3y2dIsavj8/OZnI\nlsc8W1dMgTH+KN9um4srpq7Ioklt6opk6RKsVdw3EaGxCSPAsv/1O1xq3v42WOqO\nNH5luza7vdaEzhRFOqh/DvJnfqzTzoHszpmOJ/U5FN7usbGuxbSn1uVBAoGBAOKJ\nFJ57ZanZE6D3mz/Jdr86PG7od2POsL3PuDyr22mJxlySuTChwR8fy7rV7Yw4XnhE\np5nzyeo/7RQvMPJtcYxbpoowX/g/JscncXx/0uvBH17ALC7jKo4FLRU1n6lZcL6Q\nQ0TWdx3wfLzdGHXmksjwwOuFzwr9JSbEL7d9Lcn/AoGAfk3pK7olzMaVDvg28ufQ\nSLySkeFLfiz4nNbvOwGRgU6VCXQVH7MCIwLob1/z50YucDWeY8xrj19iCYgwC4sB\n4AORwz3mbSbGhICt7mbKjYqF89OGxoV9xhFUdkPtLBdYN2EyjkSGohCoTywjUxg5\neDkJ4ElcZNFhgllsrzHilCw=\n-----END PRIVATE KEY-----\n",
    "client_email": "wehbookum@webhookum.iam.gserviceaccount.com",
    "client_id": "106543008042038730045",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/wehbookum%40webhookum.iam.gserviceaccount.com"
};
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');

const iniciarBanco = async () => await storage.init(); //função que inicia o banco local

app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

// STATES

// caminho feliz
const OLA = 0, NOME = 1, TELEFONE = 2, DATA = 3, HORA = 4, FINALIZAR = 5, CANCELAMENTO = 6, INICIO = 7;

const SAUDACOES = ['boa tarde', 'bom dia', 'boa noite', 'ola', 'olá', 'oi', 'oii', 'opa', 'oie', 'eae'];
let diasLivres = [];

const proximos13dias = () => new Promise((resolve, reject) => {

    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

    const agoraMais1hora = new Date(((new Date()).getTime()) + (1000 * 60 * 60));
    const agoraMais30dias = new Date(((new Date()).getTime()) + (1000 * 60 * 60 * 24 * 30));

    console.log('Executando função proximos13dias');

    calendar.events.list({
        auth: serviceAccountAuth,
        calendarId: calendarId,
        timeMax: agoraMais30dias.toISOString(),
        timeMin: agoraMais1hora.toISOString(),
        //timeMin: (new Date()).toISOString(),    
        showDeleted: false,
        maxResults: 240,
        q: "HORARIO LIVRE",
        singleEvents: true,
        orderBy: 'startTime',

    }, (err, calendarResponse) => {
        const lista = calendarResponse.data.items;
        console.log(lista);

        let diasDisponiveis = [];

        for (let i = 0; i < lista.length; i++) {
            const vlSplit = lista[i].start.dateTime.substr(0, 10).split('-');
            console.log(vlSplit);
            const strAux = `${vlSplit[2]}/${vlSplit[1]}/${vlSplit[0]}`;
            console.log(strAux);
            if (diasDisponiveis.length < 13 && !diasDisponiveis.includes(strAux)) diasDisponiveis.push(strAux);
            if (diasDisponiveis.length >= 13) break;
        }
        console.log('dias disponiveis ' + diasDisponiveis);
        resolve(diasDisponiveis);
    });
});

const horariosLivresDiaEspecifico = (escolhido) => new Promise((resolve, reject) => {

    console.log('Executando horariosLivresDiaEspecifico');
    const hoje = new Date().toISOString();
    const hojeStr = `${hoje.substring(8, 10)}/${hoje.substring(5, 7)}/${hoje.substring(0, 4)}`;
    const agoraMais1hora = new Date(((new Date()).getTime()) + (1000 * 60 * 60));

    const auxEsc = escolhido.split('/');
    const min = (escolhido == hojeStr ? agoraMais1hora : `${auxEsc[2]}-${auxEsc[1]}-${auxEsc[0]}T00:00:00.000Z`);
    const max = `${auxEsc[2]}-${auxEsc[1]}-${auxEsc[0]}T23:59:00.000Z`;

    console.log(auxEsc);

    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

    calendar.events.list({
        auth: serviceAccountAuth,
        calendarId: calendarId,
        timeMax: max,
        timeMin: min,
        //timeMin: (new Date()).toISOString(),    
        showDeleted: false,
        maxResults: 20,
        q: "HORARIO LIVRE",
        singleEvents: true,
        orderBy: 'startTime',

    }, (err, calendarResponse) => {
        const lista = calendarResponse.data.items;

        let horasDisponiveis = [];
        let idsHorasDisponiveis = [];

        for (let i = 0; i < lista.length; i++) {
            const horarioItem = lista[i].start.dateTime.substr(11, 5);
            horasDisponiveis.push(horarioItem);
            idsHorasDisponiveis.push(lista[i].id);
        }
        console.log(horasDisponiveis);
        console.log(idsHorasDisponiveis);
        const toRetObj = {
            horas: horasDisponiveis,
            ids: idsHorasDisponiveis
        };
        resolve(toRetObj);
    });
});

const agendar = (nome, phone, eventId, sender_psid) => new Promise((resolve, reject) => {

    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

    console.log(eventId);

    const event = {
        summary: "AGENDADO",
        description: `Cliente: ${nome}\ Telefone: ${phone.replace("telefone:", "")} \n Código do cliente: ${sender_psid}`,
        colorId: 9
    };

    calendar.events.patch({
        auth: serviceAccountAuth,
        calendarId: calendarId,
        eventId: eventId,
        resource: event
    }, (err, calendarResponse) => {
        if (err) resolve("Falha ao agendar.");
        else resolve("Seu atendimento foi agendado com sucesso. Aguardamos você!");
        console.log(err ? err : calendarResponse.data);
    });
});

const getSenderPsid = (sender_psid) => new Promise((resolve, reject) => {

    const agoraMais1hora = new Date(((new Date()).getTime()) + (1000 * 60 * 60));
    const agoraMais365dias = new Date(((new Date()).getTime()) + (1000 * 60 * 60 * 24 * 365));

    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

    calendar.events.list({
        auth: serviceAccountAuth,
        calendarId: calendarId,
        timeMax: agoraMais365dias.toISOString(),
        timeMin: agoraMais1hora.toISOString(),
        //timeMin: (new Date()).toISOString(),    
        showDeleted: false,
        maxResults: 20,
        q: sender_psid,
        singleEvents: true,
        orderBy: 'startTime',

    }, (err, calendarResponse) => {
        const lista = calendarResponse.data.items;

        let horasDisponiveis = [];

        for (let i = 0; i < lista.length; i++) {
            const vlSplit = lista[i].start.dateTime.substr(0, 10).split('-');
            console.log(vlSplit);
            const strAux = `${vlSplit[2]}/${vlSplit[1]}/${vlSplit[0]}`;
            const horarioItem = lista[i].start.dateTime.substr(11, 5);
            const idEvento = lista[i].id
            if (horasDisponiveis.length >= 13) break;
            horasDisponiveis.push(
                {
                    "content_type": "text",
                    "title": `${strAux} às ${horarioItem}`,
                    "payload": `${idEvento}`
                },
            );
        }
        console.log('HorasDisponiveis ' + horasDisponiveis);
        resolve(horasDisponiveis);
    });
});

const cancelar = (eventCancel) => new Promise((resolve, reject) => {
    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

    const event = {
        summary: "HORARIO LIVRE",
        description: '',
        colorId: 3
    };

    console.log('EventCancel: ' + eventCancel);

    calendar.events.patch({
        auth: serviceAccountAuth,
        calendarId: calendarId,
        eventId: eventCancel,
        resource: event
    }, (err, calendarResponse) => {
        if (err) resolve("Falha ao agendar.");
        else resolve("Seu atendimento foi agendado com sucesso. Aguardamos você!");
        console.log(err ? err : calendarResponse.data);
    });
});

app.post('/webhook', async (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(async function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('linha 213 Sender PSID: ' + sender_psid);
            let msg = "";
            if (webhook_event.message.quick_reply && webhook_event.message.quick_reply.payload) msg = webhook_event.message.quick_reply.payload;
            else if (webhook_event.message) msg = webhook_event.message.text;
            else if (webhook_event.postback) msg = webhook_event.postback.payload;

            let turno = await storage.getItem(`u_${sender_psid}_turno`) || OLA;
            const retProcessar = await processar(msg, turno, sender_psid);

            callSendAPI(sender_psid, retProcessar.response);
            await storage.setItem(`u_${sender_psid}_turno`, `${retProcessar.turnoSave}`);

        });
        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "QWERTY"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

async function processar(msg, turno, sender_psid) {
    let response, turnoSave;
    if (turno == INICIO || SAUDACOES.includes(msg.toLowerCase())) {
        turnoSave = NOME

        response = {
            "text": `Bem vindo a Clínica Portal, selecione uma das opções abaixo para iniciar:`,
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": `Agendar consulta`,
                    "payload": 'Agendar consulta'
                },
                {
                    "content_type": "text",
                    "title": `Cancelar consulta`,
                    "payload": 'Cancelar consulta'
                }
            ]
        };

    } else if (turno == NOME && msg == 'Cancelar consulta') {
        turnoSave = CANCELAMENTO

        let horasMarcadas = await getSenderPsid(sender_psid);
        console.log(horasMarcadas);

        if (horasMarcadas.length == 1) {

            let diaCancel = horasMarcadas[0].title;
            let eventId = horasMarcadas[0].payload;

            response = {
                "text": `Selecione o botão "Confirmar" para cancelar sua consulta marcada para dia ${diaCancel}.`,
                quick_replies: [
                    {
                        "content_type": "text",
                        "title": `Confirmar`,
                        "payload": `${eventId}`
                    },
                ]
            };

        } else if (horasMarcadas.length > 1) {

            response = {
                "text": 'Você tem horários marcados para os seguintes dias. Qual deseja cancelar?',
                quick_replies: horasMarcadas
            };

        } else {

            response = {
                "text": 'Desculpe, não encontramos horários agendados em seu nome.\n Certifique-se de estar logado na mesma conta que o senhor(a) fez o agendamento.'
            };

        }

    } else if (turno == CANCELAMENTO) {
        turnoSave = FINALIZAR

        await cancelar(msg);

        response = {
            "text": "Seu horário foi cancelado com sucesso! Agradecemos seu contato."
        };

    } else if (turno == NOME && msg == 'Agendar consulta') {
        console.log('Entrou no caminho feliz');
        console.log(msg);
        turnoSave = NOME;

        response = {
            "text": `Olá! Bem vindo a Clínica Portal, informe seu nome para iniciarmos?`,
        };

    } else if (turno == NOME) {
        turnoSave = TELEFONE;
        let name = msg.charAt(0).toUpperCase() + msg.slice(1);
        console.log(name);

        await storage.setItem('name', name)

        response = {
            "text": `Ok ${name}, por favor informe seu número de telefone.`
        };

    } else if (turno == TELEFONE) {

        turnoSave = DATA;

        await storage.setItem('phone', msg);

        const retornoDias = await proximos13dias();
        diasLivres = retornoDias;

        response = {
            "text": "Selecione uma data para executar o agendamento:",
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": `${diasLivres[0]}`,
                    "payload": `${diasLivres[0]}`
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[1]}`,
                    "payload": `${diasLivres[1]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[2]}`,
                    "payload": `${diasLivres[2]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[3]}`,
                    "payload": `${diasLivres[3]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[4]}`,
                    "payload": `${diasLivres[4]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[5]}`,
                    "payload": `${diasLivres[5]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[6]}`,
                    "payload": `${diasLivres[6]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[7]}`,
                    "payload": `${diasLivres[7]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[8]}`,
                    "payload": `${diasLivres[8]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[9]}`,
                    "payload": `${diasLivres[9]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[10]}`,
                    "payload": `${diasLivres[10]}`,
                },
                {
                    "content_type": "text",
                    "title": `${diasLivres[11]}`,
                    "payload": `${diasLivres[11]}`,
                },
                {
                    "content_type": "text",
                    "title": 'Selecionar outro dia',
                    "payload": 'mudar intent',
                }
            ]
        };

    } else if (msg == 'Selecionar outro dia') {
        turnoSave = DATA;

        response = {
            "text": "Por favor informe o dia desejado"
        };

    } else if (turno == DATA) {
        turnoSave = HORA;

        const pegaHoras = await horariosLivresDiaEspecifico(msg);
        console.log(pegaHoras.horas);
        console.log(pegaHoras.ids);

        response = {
            "text": `Os horários disponíveis para o dia selecionado são:`,
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[0]}`,
                    "payload": `${pegaHoras.ids[0]}`
                },
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[1]}`,
                    "payload": `${pegaHoras.ids[1]}`
                },
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[2]}`,
                    "payload": `${pegaHoras.ids[2]}`
                },
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[3]}`,
                    "payload": `${pegaHoras.ids[3]}`
                },
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[4]}`,
                    "payload": `${pegaHoras.ids[4]}`
                },
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[5]}`,
                    "payload": `${pegaHoras.ids[5]}`
                },
            ]
        };

    } else if (turno == HORA) {
        turnoSave = FINALIZAR;

        let nome = await storage.getItem('name'); // msg
        let phone = await storage.getItem('phone'); // msg

        await agendar(nome, phone, msg, sender_psid);
        response = {
            'text': `Obrigado ${nome} seu horário foi agendado com sucesso!`
        }
    }

    return { response, turnoSave };
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

iniciarBanco();