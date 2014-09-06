<h1>SocketTanks</h1>

Este proyecto contiene la estructura de un juego de tanques en línea. Su arquitectura es simple, cada cliente le reporta acciones al servidor (movimientos y disparos), este corre la lógica del juego y al detectar eventos (nuevo jugador, explosión de un tanque, puntuación, etc) le notifica a todos los clientes. Sin embargo la conexión entre cliente y servidor hace falta, tu tarea es implementarla usando Websockets. Sigue las indicaciones a continuación.

<h3>Servidor</h3>

El archivo a modificar es `server.js`. El servidor debe:

1. El servidor debe servir la librería de Socket.io y recibir las conexiones entrantes de los clientes.
2. Al recibir el evento `newPlayer`, el servidor debe crear al jugador usando la función `socketTanks.newPlayer(<socketId>)`, pasando como parametro el id del socket. Como 'acknowledgement' del evento, se debe enviar el objeto que  retorna la función `socketTanks.newPlayer(<socketId>)`.
3. Al recibir el evento `clientTankEvent`, se debe llamar al metodo `socketTanks.clientTankEvent(<data>)` con el objeto que trae el evento.
4. Al recibir el evento `disconnect`, se debe llamar al metodo `socketTanks.playerLeft(<socketId>)` con el id del socket que se desconecto.

Además el objeto `socketTanks`, encargado de correr la lógica del juego, cuenta con 3 callbacks. Estos se deben implementar de la siguiente forma:

1. `socketTanks.onKill(<función>)`, se llama al detectar la muerte de un tanque. El servidor debe enviar un broadcast a todos los clientes con el objeto que la función pasa como parámetro. El nombre del evento es `tankKilled`.
2. `socketTanks.onPoint(<función>)`, se llama cuando un tanque se merece un punto. Esta función pasa como parametro el id del socket a quien corresponde el punto. Esto se debe notificar al socket con un evento `point`. 
3. `socketTanks.onUpdate(<función>)`, se llama para refrescar la posicion de los tanques. El servidor debe enviar un broadcast a todos los clientes con el objeto que la función pasa como parámetro. El nombre del evento es `serverUpdate`.

<h3>Cliente</h3>

Los archivos a modicar son `index.html` y `client.js`. El cliente debe:

1. Usar la librería de socket.io que sirve el servidor y conectarse al servidor usando websockets.
2. Al conectarse, el cliente debe iniciar el juego usando `board.start(<función>)`. Esta función recibe como parámetro un callback que se llama cada vez que el usuario ingresa un comando, en este callback se debe enviar el evento `clientTankEvent` con el objeto que pasa la función. Luego de iniciar el juego, el cliente debe enviar el evento `newPlayer` al servidor, este evento maneja un 'acknowledgement' que pasa como parametro un objeto, con este objeto se crea al jugador usando `board.createPlayer(<objeto>)`.
3. Al recibir el evento `serverUpdate`, se debe llamar al metodo `board.serverUpdates(<data>)` con el objeto que trae el evento.
4. Al recibir el evento `tankKilled`, se debe llamar al metodo `board.killedTank(<data>)` con el objeto que trae el evento.
5. Al recibir el evento `point`, se debe llamar al metodo `board.playerScored()`.
6. Al recibir el evento `disconnect`, se debe llamar al metodo `board.stop()`.
