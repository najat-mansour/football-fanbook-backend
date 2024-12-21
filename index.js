import express from 'express';
import bodyParser from 'body-parser';

import publicRouter from './routers/public.js';
import profileRouter from './routers/profile.js';
import quizzesRouter from './routers/quizzes.js';
import translator from './routers/translator.js';
import matches from './routers/matches.js';
import aiRouter from './routers/ai.js';
import statisticsRouter from './routers/statistics.js';

//! app 
const app = express();
const PORT = process.env.PORT || 3000;

//! middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

//! routers
app.use('/', publicRouter);
app.use('/profile', profileRouter);
app.use('/quizzes', quizzesRouter);
app.use('/translator', translator);
app.use('/matches', matches);
app.use('/ai', aiRouter);
app.use('/statistics', statisticsRouter);

//! start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});