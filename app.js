const express = require('express');
const { Task, Event, Controller, Card } = require('./models');

const app = express();
const port = 3000;

function getDateTime() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
}

app.use(express.json());

app.post('/', (req, res) => {
  if (typeof req.body !== 'object') {
    res.status(400).send('Malformed json');
  } else {
    const messages = [];
    const sn = req.body.sn;
    const type = req.body.type;
    Controller.findOrCreate({
      where: {
        serial: sn,
        type: type,
      },
    })
      .then((controller, created) => {
        req.body.messages.forEach(message => {
          const operation = message.operation;
          const id = message.id;

          switch (operation) {
            case undefined: {
              if (message.success == 1) {
                console.log(`Success answer from controller ${sn}`);
                Task.destroy({
                  where: {
                    id: id,
                  },
                });
              } else {
                console.log(`Unknown answer from controller ${sn}`);
              }
              Controller.update({
                active: message.success,
              }, {
                where: {
                  serial: sn,
                  type: type,
                },
              });
              break;
            }

            case 'power_on': {
              if (created) {
                console.log('Unknown controller, add to database');
              }
              Controller.update({
                fw: message.fw,
                conn_fw: message.conn_fw,
                active: message.active,
                mode: message.mode,
                last_conn: Date.now(),
              }, {
                where: {
                  serial: sn,
                  type: type,
                },
              });

              console.log(`Controller ${sn} power on`);
              if (message.active == 0) {
                messages.push({
                  id: 0,
                  operation: 'set_active',
                  active: 1,
                  online: 0,
                });
              }
              break;
            }

            case 'ping': {
              const active = message.active;

              console.log(`Ping from controller ${sn}`);

              Controller.update({
                mode: message.mode,
                last_conn: Date.now(),
              }, {
                where: {
                  serial: sn,
                  type: type,
                },
              })
                .then(([updated]) => {
                  if (active != controller.active) {
                    messages.push({
                      id: 0,
                      operation: 'set_active',
                      active: controller.active,
                      online: 0,
                    });
                  }
                });
              break;
            }

            case 'check_access': {
              const card = message.card;
              const reader = message.reader;

              console.log(`Check access from controller ${sn} with card ${card} on reader ${reader}`);
              messages.push({
                id: id,
                operation: 'check_access',
                granted: 1,
              });
              break;
            }

            case 'events': {
              const count = req.body.messages.length;
              const events = [];
              message.events.forEach(event => {
                console.log(`Event from controller ${sn}`);
                console.dir(event);
                events.push({
                  event: event.event,
                  flag: event.flag,
                  card: event.card,
                  time: event.time,
                });
              });
              Event.bulkCreate(events);
              messages.push({
                id: id,
                operation: 'events',
                events_success: count,
              });
              break;
            }

            default:
              console.log('Unknown operation');
              break;
          }
        });

        res.send({
          date: getDateTime(),
          interval: 60,
          messages: messages,
        });
      });
  }
});

app.use((req, res, next) => {
  res.status(404);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});