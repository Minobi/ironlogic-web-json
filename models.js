const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db/db.sqlite3',
});

const Task = sequelize.define('tasks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serial: DataTypes.INTEGER,
  type: DataTypes.STRING(128),
  json: DataTypes.TEXT,
});

const Event = sequelize.define('events', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  event: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  card: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  flag: DataTypes.INTEGER,
});

const Controller = sequelize.define('controllers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serial: DataTypes.INTEGER,
  type: DataTypes.TEXT,
  fw: DataTypes.TEXT,
  conn_fw: DataTypes.TEXT,
  active: DataTypes.INTEGER,
  mode: DataTypes.INTEGER,
  last_conn: DataTypes.INTEGER,
  license: DataTypes.TEXT,
  interval: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
});

const Card = sequelize.define('cards', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  card: DataTypes.TEXT,
  flags: DataTypes.INTEGER,
  tz: DataTypes.INTEGER,
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to database has been established successfully.');
    sequelize.sync()
      .then(() => {
        console.log('Models sync successfully');
      });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });

module.exports.Task = Task;
module.exports.Event = Event;
module.exports.Controller = Controller;
module.exports.Card = Card;