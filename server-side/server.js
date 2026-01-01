const express = require('express');
const cors = require("cors");
const dmsRouter = require('./routers/authRouter');
const deviceRouter = require('./routers/deviceRouter');
const computerRouter = require('./routers/computerRouter');
const codeDataRouter = require('./routers/codedataRouter');
const dashboardRouter = require('./routers/dashboardRouter');
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/dms', dmsRouter);
app.use('/dms/devices', deviceRouter);
app.use('/dms/computers', computerRouter);
app.use('/dms/codedata', codeDataRouter);
app.use('/dms/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : null });
});


const port = process.env.PORT || 1901;
const host = process.env.HOST || 'localhost';

const server = app.listen(port, host, () => {});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});