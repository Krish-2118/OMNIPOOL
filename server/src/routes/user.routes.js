const express = require('express');
const router = express.Router();
const { getUsers, createUser, getUserById, updateUser } = require('../controllers/user.controller');
const auth = require('../middleware/auth');

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(auth, updateUser);

module.exports = router;
