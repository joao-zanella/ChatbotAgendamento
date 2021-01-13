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

const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

const iniciarBanco = async () => await storage.init(); //função que inicia o banco local

const proximos10dias = () => new Promise((resolve, reject) => {

    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

    const agoraMais1hora = new Date(((new Date()).getTime()) + (1000 * 60 * 60));
    const agoraMais30dias = new Date(((new Date()).getTime()) + (1000 * 60 * 60 * 24 * 30));

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
            const strAux = `${vlSplit[2]}/${vlSplit[1]}/${vlSplit[0]}`;
            if (diasDisponiveis.length < 10 && !diasDisponiveis.includes(strAux)) diasDisponiveis.push(strAux);
            if (diasDisponiveis.length >= 10) break;
        }
        console.log('dias disponiveis ' + diasDisponiveis);
        resolve(diasDisponiveis);
    });
});

const horariosLivresDiaEspecifico = (escolhido) => new Promise((resolve, reject) => {

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

const agendar = (nome, numero, eventId) => new Promise((resolve, reject) => {

    const serviceAccountAuth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: 'https://www.googleapis.com/auth/calendar'
    });

    const event = {
        summary: "AGENDADO",
        description: `Cliente: ${nome}\ Telefone: ${numero.replace("telefone:", "")}`,
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

app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

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

async function handleMessage(sender_psid, received_message) {
    let response;

    const ultimaMsg = await storage.getItem(`${sender_psid}_ultimaMsg`) || 'nada'; //recupera o que falou na msg anterior

    if (received_message.text == 'oi') {

        response = {
            "text": `Olá! Informe seu nome para iniciarmos seu agendamento. ${ultimaMsg}`
        };

        await storage.setItem(`${sender_psid}_ultimaMsg`, received_message.text); //salva o que disse atualemnte para ser consultado depois

    } else if (received_message.text == 'joao' || 'João') {

        var img = 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=748&q=80'
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Selecione a data desejada:",
                        "subtitle": "Selecione o botão para selecionar a data.",
                        "image_url": img,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "10:30",
                                "payload": "10:30",
                            },
                            {
                                "type": "postback",
                                "title": "11:30",
                                "payload": "11:30",
                            }
                        ],
                    }]
                }
            }
        }


    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "está é a imagem correta?",
                        "subtitle": "selecione o botão para responder.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Sim!",
                                "payload": "sim",
                            },
                            {
                                "type": "postback",
                                "title": "Não!",
                                "payload": "nao",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Send the response message
    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;
    if (payload) {
        console.log(payload);
    }


    // Set the response based on the postback payload
    if (payload === 'sim' || "Sim" || "Sim!" || 'sim!' || "s") {
        response = { "text": "Obrigado !!!!!" }
    } else if (payload === 'nao' || "Não" || "Não!" || "não" || "n") {
        response = { "text": "Tente enviar outra." }
    }
    // Send the message to acknowledge the postback
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

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

iniciarBanco();