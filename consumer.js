const amqp = require("amqplib");

function readJsonContent(buffer) {
  return JSON.parse(buffer.toString());
}

const makeHandler = (channel) =>
  function handler(message) {
    const payload = readJsonContent(message.content);
    console.log("received", message.fields.redelivered);
    console.log("received", payload);
    if (payload.number === "99") {
      channel.ack(message);
    }
  };

async function connect() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    // make sure the/a queue exists, if not, create it
    const result = await channel.assertQueue("jobs");

    channel.consume("jobs", makeHandler(channel));

    console.log("waiting");
  } catch (ex) {
    console.error(ex);
  }
}

connect();
