# Chat Example (NodeJS + Socket.io + RabbitMQ)

## Install
1) 
```bash
git clone https://github.com/yoshkin/nodejs-chat-example.git chat
cd chat
npm install
cp config.json.example config.json
```
2) Edit "config.json" params (use yours connection params for RabbitMQ server)

3) Setup your local environment: 
- virtual host
- "public" folder as root of virtual host    

## Usage
1) Run in bash ```node server.js```
2) Open tab in browser with url of your virtual host (like ```http://chat.local?client_id=11```)
3) Open another tab (like ```http://chat.local?client_id=12```)
(client_id changed)
4) Try to send message from one tab and you will see this message on second tab.

## PS
It`s just sample example of NodeJS chat server with using RabbitMQ and Socket.io
!!! NOT PRODUCTION !!!