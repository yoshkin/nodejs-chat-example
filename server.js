let config = require('./config.json');
var amqp = require('amqp'),
    io = require('socket.io')(8001, {path: '/socket/'});
var connection = amqp.createConnection({
                    host: config.host,
                    port: config.port,
                    login: config.login,
                    password: config.password});
connection.on('error', function(e) {
    console.log("Error from amqp: ", e);
});

let checkAuthToken = function(token) {
    //тут можем проверять токен, делая запрос на бекенд
    return (typeof token !== "undefined" && token) ? true : false;
};
connection.on('ready', function () {
    connection.exchange("chat_exchange", options={type:'fanout'}, function(exchange) {
        io.sockets.on('connection', function(socket){
            console.log('A user connected', socket.id);
            socket.auth = false;
            socket.token = '';

            socket.on('authenticate', function(data){
                if(checkAuthToken(data.token)) {
                    console.log("Authenticated socket ", socket.id);
                    socket.auth = true;
                }
                socket.token = data.token;
                if (!socket.auth) {
                    console.log("Disconnecting socket ", socket.id);
                    socket.emit('auth', 'unauthorized');
                    socket.disconnect('unauthorized');
                }
                connection.queue('yashenkov' + socket.token, {closeChannelOnUnsubscribe: true, autoDelete: true}, function (queue) {
                    var ctag;
                    queue.bind(exchange, '');
                    queue.subscribe(function (message) {
                        console.log('-----------------');
                        console.log('Subscribed to queue', queue.name);
                        var encoded_payload = unescape(message.data);
                        var payload = JSON.parse(encoded_payload);
                        console.log('Recieved a message:', payload);

                        socket.emit('chat-message', payload);
                    }).addCallback(function(ok) { ctag = ok.consumerTag; });

                    socket.on('disconnect', function () {
                        console.log('User disconnected', socket.id);
                        queue.unsubscribe(ctag);
                        console.log('User unsubscribed', socket.id);
                        console.log('-----------------');
                    });
                    socket.on('chat-message', function(msg){
                        console.log('Received message from client: ' + msg);
                        sendMessage(exchange, msg)
                    });
                });
            });
        });
        var sendMessage = function(exchange, payload) {
            console.log('Sending message to exchange...', exchange.name);
            var encoded_payload = JSON.stringify(payload);
            exchange.publish('', encoded_payload, {})
        };
    })
});