import { connect } from 'amqplib/callback_api.js';
import { credentials } from 'amqplib';
import { startRabbitMQWorker } from './worker.js';

export var rabbitmq_connection = null;
export var has_connection = false;

export function startRabbitMQConnection(user, pass, queueName) {
    const rabbitmq_opts = { credentials: credentials.plain(user, pass) };
    connect('amqp://rabbit-mq', rabbitmq_opts, function(error0, connection) {
        if (error0) {
            has_connection = false;
            return setTimeout(() => startRabbitMQConnection(user, pass, queueName), 5000);
        }

        connection.on("error", function(error) {
            console.log("[RABBITMQ ERROR]", error);
        });

        connection.on("close", function() {
            console.log("[RABBITMQ CLOSED]");
            has_connection = false;
            return setTimeout(() => startRabbitMQConnection(user, pass, queueName), 5000);
        });

        console.log('[RABBITMQ CONNECTED]');

        has_connection = true;
        rabbitmq_connection = connection;

        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            var message = 'Test';

            channel.assertQueue(queueName, {
                durable: true
            });

            channel.sendToQueue(queueName, Buffer.from(message));
            console.log("[RABBITMQ] Sent %s", message, 'to', queueName);

            console.log('Starting RabbitMQ worker...');
            startRabbitMQWorker(connection, queueName);
        });

    });
}