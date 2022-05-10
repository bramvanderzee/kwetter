export function startRabbitMQWorker(connection, name) {
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

        channel.prefetch(10);
        channel.assertQueue(name, { durable: true }, function(err, _ok) {
            if (closeOnError(err)) return;
            channel.consume(name, processMsg, { noAck: false });
            console.log("[RABBITMQ WORKER] Worker on queue", name, "started");
        });

        function processMsg(msg) {
            work(msg, function(ok) {
                try {
                    if (ok)
                        channel.ack(msg);
                    else
                        channel.reject(msg, true);
                } catch (e) {
                    closeOnError(e);
                }
            });
        }
    });
}

function work(message, callback) {
    console.log("[RABBITMQ WORKER MESSAGE]:", message.content.toString());
    callback(true);
}

function closeOnError(error) {
    if (!error) return false;
    console.error("[RABBITMQ WORKER ERROR]", error);
    return true;
}