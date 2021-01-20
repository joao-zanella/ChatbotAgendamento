'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()),
    request = require('request'),
    storage = require('node-persist'), //storage local
    { google } = require('googleapis'),
    calendar = google.calendar('v3');


const calendarId = "i2hsubk3ooci8b7ifnmse397lc@group.calendar.google.com";
const serviceAccount = {
    "type": "service_account",
    "project_id": "lorobot",
    "private_key_id": "3d6363ac7d3dff45696e11b072166155af11328e",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDci8FxLRC8eU1e\nNp2wc9/5s4+TczqXgOqQpBOenRfjPQHO3zlwweChXG8dHDVQ+GDfTERhmSeJC8o6\nDkRBwjNkdGLMtCKFaxlimjkBKdOJ20UKQxoSHMKkgpDA8AdFQlo1W2R67NH06ECb\nWYTA8nzcM0xnDEAcb9y6maAGWf9juKDWiM5ddYPTi3VgrMTgIGDjpMSey2xi5y5A\nEGdtwaWVgnfybIO5bFXlx/JH0cscKfAHx7ZOwWjQFK+EfYszkoP2qngxo+NlTVEi\niWSz4nTlse4zPnM/4zbb+5RqL6hLENNHIcSH30ttctRuE8KUgy6MBDfM6MaRtEhn\nGH8EXKq5AgMBAAECggEADwyaTpa8pZ/BX8RqTjgZ+HgAPBeIz/3EA8qubAxcLO1k\nyjEBQmh4Y4pjKqFaIgRQ1+vkXqSMxhU/32ZJ0hLmXtxyQXWpRWFhghD0AthPzwBf\nXavmg4Xi4kbmicPXOyqj7TAnUxwF16hhgDhDjsb9Lilx9TYoycf4T+NbwBM0EiHO\nqAnb2T0DLadKKwPyzIU1Wr9CYN5hRUNBk8AFGEoN/zF0Z+IF42bExymJPcOyUbQE\n5R5PqA5pk37ImhfcVbP8MPF5UWQJTw+V1ojjdKsGY7xj37PKxkkF+0l1jdSC2XAC\ny8L+UaCdzkQJ58EAGqv8Z1uzPrWXKm5pd8ElIDDu4QKBgQDzJlQIzZ+riIRP59TH\n6L28GWFua1YbPZDlIzG4YEacsg3vjv77EZnHCGODHE0z5OjNugCSwL3w7+IVxv+d\n9VQeFMkKVPqqTWQxUPwwSut34DDDHyZ+s/1BgHgeh2lIcT+C4OLbAk2/k5nu9MEw\nPpiQENPRAokkuyDBUAVdJQDluwKBgQDoM5yBmzws3PngMCLCx0yN5QTCuvihFJdh\n5kf3ZIq0GCbub+H7wEko26gweCwzEkE22NB7k56fm/DgrIVYFmICrkPC4O8i7xnY\ne/xgDmAk710DAGueyfaooZ0O4qgcMKqaX4C9SwKx7PncGPwGcoirHNfduOxZBW1L\nM8bU285QGwKBgG+vgFQW1yu8ZkIp09QLdPNsmRNWHFQg4GhP1SvClUyugLYz8a0z\ndXY1xTfZDSE0GTc+I7tE6zo7hZbJNGrC4GN82qdzRzxolggNEfnAwA3tHZjSuyTh\n2gd3UjV7r4GF+01LrQg6M6o2yzM2m3JknkE2aYUM7B/CEJabAgu5zoK3AoGAX07v\n6nLhXDjHh7G6UuCjF4rtTVCZROTCzjhLScxG8m0Hbc8WntLqNI8UlfB9k+jmQ7Dy\nwgZxkWnckRu/D80AJcGJpq/U+C3UGfuqN3MvG3n0X4sIoYCccdMEOFvoTMnc/Mg+\ne3QSgx2V4TWQHMVeO333TNbejBuiJL/32N7v7AkCgYEAxB2qP3rm53QW8YD+z/3w\nisGsY8YtF1xQf5Yf0aH9FxKSaUdzZ/AUVPgS9v/WUyp4fhZqpCkSkoYYLQQbjQO8\nQYQnYlKbFTtHZ9whbFpTUoo3kNsILj6FfYkE9Bygze/wHpdwbeYL3gOevZDdIy33\nKKD3K2AoDr6Gs7Jlz3i4IxI=\n-----END PRIVATE KEY-----\n",
    "client_email": "lorobot-611@lorobot.iam.gserviceaccount.com",
    "client_id": "105835705991210877621",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/lorobot-611%40lorobot.iam.gserviceaccount.com"
};
const iniciarBanco = async () => await storage.init(); //função que inicia o banco local

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// STATES

// caminho feliz
const OLA = 0, NOME = 1, TELEFONE = 2, DATA = 3, HORA = 4, FINALIZAR = 5;
//
const SEL_DIA = 6, CANCELAMENTO = 7;
const SAUDACOES = ['boa tarde', 'bom dia', 'boa noite', 'ola', 'olá', 'oi', 'oii', 'opa'];
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
    console.log('ESTE É O EVENTID ' + eventId);
    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

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

app.post('/webhook', async (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(async function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
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
    let VERIFY_TOKEN = "qwerty"

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
    console.log('SENDER_PSID:' + sender_psid);

    let response, turnoSave;

    if (turno == OLA || SAUDACOES.includes(msg.toLowerCase())) {
        turnoSave = NOME;
        response = {
            "text": `Olá! Informe seu nome para iniciarmos seu agendamento.`
        };
    } else if (turno == NOME) {
        turnoSave = TELEFONE;

        response = {
            "text": `Ok ${msg}, por favor informe seu número de telefone.`
        };

    } else if (turno == TELEFONE) {
        turnoSave = DATA;

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
                    "payload": `${pegaHoras.ids[1]}`,
                },
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[2]}`,
                    "payload": `${pegaHoras.ids[2]}`,
                },
                {
                    "content_type": "text",
                    "title": `${pegaHoras.horas[3]}`,
                    "payload": `${pegaHoras.ids[3]}`,
                },
            ]
        };
    } else if (turno == HORA) {
        turnoSave = FINALIZAR;

        let nome = 'Felipe';
        let phone = '54 99873996'

        await agendar(nome, phone, msg, sender_psid);
        response = {
            'text': `Seu horário foi agendado com sucesso!`
        }
    }
    console.log({ response, turnoSave });
    return { response, turnoSave };
}

function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;
    let message = received_postback.text;
    if (payload) {
        console.log(payload);
    }
    if (payload === 'sim' || "Sim" || "Sim!" || 'sim!' || "s") {
        response = { "text": "Obrigado !!!!!" }
    } else if (payload === 'nao' || "Não" || "Não!" || "não" || "n") {
        response = { "text": "Tente enviar outra." }
    }
    callSendAPI(sender_psid, response);
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