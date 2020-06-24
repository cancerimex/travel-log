const { Router } = require('express');
const { checkToken } = require('../middlewares');

const LogEntry = require('../models/LogEntry');
const User = require('../models/User');

const {
  API_KEY
} = process.env;

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const entries = await LogEntry.find({ 'visibility': 'public' }).populate('user');   
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {    
    const entries = await LogEntry.find().or([{ user: req.params.id }, { visibility: 'public' }]).populate('user');        
    res.json(entries);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    req.body.user = req.decoded.id;
    const user = await User.findById(req.decoded.id);
    
    const logEntry = new LogEntry(req.body);
    logEntry.user = user;
    const createdEntry = await logEntry.save()
    user.logs.push(logEntry);
    await user.save();
    res.json(createdEntry);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

module.exports = router;