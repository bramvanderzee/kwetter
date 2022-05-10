export function sendRabbitMQMessage(connection, name, message) {
    if (connection == null) {
        console.log("[RABBITMQ WORKER] No connection...");
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            return setTimeout(() => startRabbitMQWorker(connection), 5000);
        }

        channel.on("error", function(err) {
            console.error("[RABBITMQ WORKER ERROR]", err.message);
        });

        channel.on("close", function() {
            console.log("[RABBITMQ WORKER] channel closed");
        });

        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(name, { durable: true });

            channel.sendToQueue(name, Buffer.from(message));
            console.log("[RABBITMQ] Sent %s", message, 'to', name);
        });
    });
}