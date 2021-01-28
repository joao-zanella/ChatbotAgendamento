'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()),
    request = require('request'),
    storage = require('node-persist'), //storage local
    { google } = require('googleapis');


const calendarId = "aane1epaq3vhc6a9iggmvp7tv4@group.calendar.google.com";
const serviceAccount = {
    "type": "service_account",
    "project_id": "lorobot",
    "private_key_id": "ab7fd67f109f3da23c4017c56b2e7dac35417c3a",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzAQt8Oh+0WwtT\n1w8VsvQbj3BT0SIZDiPb4+kyZlJUhUFTD23zw8qUhGDaHf18OuJkR9tX2UPZXWTr\nQm8pvu3ErubJykPhyDDqj1uOsHyVH0gvTNiohDF6+By4nj4tYTJclmDgp+fDTQU5\nHw1BAOTt2ZkXTM9awrJ2EXzfUlrP/+qaIcmVwrjiHjvUQi7t61rFK6S6jok5thMx\nzFHRwcCnkLDZvsM8u/fZtRq7mtUKKonvg0QSqTuKi4bjvqL1guiHP+zsaQizaNX5\nXN0o+a+CHXzSCKBIkhI5lJbXWmNqGW1uP9VYLACF8/FyHHugvQz3WaDmC6uz4z0q\nIuVSOcszAgMBAAECggEAAceLYS9EvGrBSJKVPE58nb+FyteD4sLguWFhIpagz+VJ\nOnWnTqqOG37bZZ+xsuf08zFBrXRj98e1Zp9Q8pXK0E86zRu9JAP09If7TYZUnrji\nY1H8v2QdB89qna05CgNy2DfIe8M/ixH7cM9tts02+WRV4MTrNMhFtOXEm4W6kGHD\nI/vCEBPKSu8PJyMxd/qXav2b+4gcguLmt9mMzRh6Cg5qNjiMp4EaDDFwsz6mSPgG\n/RA1vVQDrBpXZeOpQSQ3ikAe5q3zoJ8oFJSnMCh8olrCtbOtdGyOZ07j9ielXMnS\nnmcku82MhtV7cXMghBhr9sQ37u4h+YrVTGOZub4C/QKBgQDkMmrtaC5BHKtwKZkd\neCVCOu6V0DUUXs2AtgcPuKjP/YABqriJi4YLbivWi3Mmhq7MClN5r2xqf3wkFimV\n4dMVzjzP2tNj/521Pj4uAoI/muOsl+Y1kOHeQtSa+6IjMjrKKpUwaKV3U+skzv9j\nqN3H3PRKNCva8u8eSGP1jHBZPQKBgQDI0EaoX+8XacFZcMMoLtMaePA/x+4qyXUB\nyHwctin63iXMNTVtV7dgavOZL9I0p+dshW2PPDyes23jNB28zGEp99G9d2noEAXK\n+hhKocff9AmnLf9iOrqvAdVLBIsOVztobmTYCfAbajihDDKFtRjP7ueFANRC1XY/\nA/inVkudLwKBgQCoV5VQPEnbGOZUISvmdIqv+D+n32g49dMOf7pn26cVgQJcuG/Y\ncEhbyFOou0kgg70RoxB/tWz6h7+x83OMMYMCFBoCkIDfxWO3oApI8OrbN018NrbK\nj25BA/ZJuxaadmSuXYmfo6Nli0/t4JLBF4M8/QBueVxc8lh6c5biP09mVQKBgFm5\nRXjBtHA/nlY6Hdh8Y3I2ixHUYMPZU2BClcG2WrduPnEpbP+364U3BDRzu3YvdyVz\n0GnpPiSigvy7MnZC0z8PLTV8f2NilVQFvojKFCYqQY3i7XKUTwkWxphIJWF49GBK\nwuAMQK3fHgJHEuPO8JEna2Zv4mciPT0WpykNU6edAoGAH0nemf+M7NlpT8pkZgez\nOiddeN6BSMrAP60T2rzHY87hU0YV6V2gdUMIS2r06olx58xdMXtnNHpfsAa1Ew9u\nbufieUf0Pq7AO0TanAPrP/ch4jhhuPG84bTlWjCVyQ7welH/HEgQGuwHIkwkgPIN\nBaTCuHZMdH0IHnx0BKOi/W4=\n-----END PRIVATE KEY-----\n",
    "client_email": "lorobot-611@lorobot.iam.gserviceaccount.com",
    "client_id": "105835705991210877621",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/lorobot-611%40lorobot.iam.gserviceaccount.com"
};

const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');

const iniciarBanco = async () => await storage.init(); //função que inicia o banco local

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// STATES

// caminho feliz
const OLA = 0, NOME = 1, TELEFONE = 2, DATA = 3, HORA = 4, FINALIZAR = 5, CANCELAMENTO = 6, INICIO = 7;

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

const getSenderPsid = () => new Promise((resolve, reject) => {

    const hoje = new Date().toISOString();
    const min = `${hoje.substring(8, 10)}/${hoje.substring(5, 7)}/${hoje.substring(0, 4)}`;
    const max = '2021-12-12T23:59:00.000Z';

    console.log(hojeStr);

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
        console.log(lista);

        resolve(lista);
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

        console.log(msg);
    } else if (turno == NOME && msg == 'Cancelar consulta') {
        turnoSave = CANCELAMENTO

        await getSenderPsid();

        if (horasMarcadas.length == 1) {
            response = {
                "text": `Seu horário marcado para dia ${verifDia} e ${verifHora} foi cancelado.`
            };
        } else {
            response = {
                "text": 'Desculpe, não encontramos horários agendados em seu nome.\n Certifique-se de estar logado na mesma conta que o senhor(a) fez o agendamento.'
            };
        }

        // if (horasMarcadas.length > 1) {
        //     response = {
        //         "text": 'Você tem horários marcados para os seguintes dias: ',
        //         quick_replies: [
        //             {
        //                 "content_type": "text",
        //                 "title": `${verifDia} - ${verifHora} - ${horasMarcadas[0]}`,
        //                 "payload": `${verifDia} - ${verifHora} - ${horasMarcadas[0]}`
        //             },
        //             {
        //                 "content_type": "text",
        //                 "title": `${verifDia} - ${verifHora} - ${horasMarcadas[1]}`,
        //                 "payload": `${verifDia} - ${verifHora} - ${horasMarcadas[1]}`
        //             },
        //         ]
        //     };
        // }
        // else 

    } else if (turno == NOME && msg == 'Agendar consulta') {
        console.log('Entrou no caminho feliz');
        console.log(msg);
        turnoSave = NOME;

        response = {
            "text": `Olá! Bem vindo a Clínica Portal, informe seu nome para iniciarmos?`,
        };

    } else if (turno == NOME) {
        turnoSave = TELEFONE;

        await storage.setItem('name', msg)

        response = {
            "text": `Ok ${msg}, por favor informe seu número de telefone.`
        };

    } else if (turno == TELEFONE) {

        turnoSave = DATA;

        await storage.setItem('phone', msg);

        const retornoDias = await proximos13dias();
        diasLivres = retornoDias;

        diasLivres.forEach((item) => {
            console.log(item);
        });

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