import { connect } from 'amqplib/callback_api.js';
import { credentials } from 'amqplib';
import { startRabbitMQWorker } from './worker.js';
import { sendRabbitMQMessage } from './publisher.js';

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

        startRabbitMQWorker(connection, queueName);
        sendRabbitMQMessage(connection, queueName, "Test");
    });
}