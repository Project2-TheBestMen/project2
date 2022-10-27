const router = require('express').Router();
const { User } = require('../../models');

// CREATE new user
router.post('/', async (req, res) => {
  try {
    const dbUserData = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    req.session.save(() => {
      req.session.loggedIn = true;

      res.status(200).json(dbUserData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const dbUserData = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!dbUserData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    const validPassword = await dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    req.session.save(() => {
      req.session.loggedIn = true;
     
      

      res
        .status(200)
        .json({ user: dbUserData, message: 'You are now logged in!' });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
  
});

// Logout
router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// get all users
router.get('/', async (req, res) => {
  const userData = await User.findAll();
  res.json(userData);
})


// get user by id
router.get('/:id', async (req, res) => {
  const userData = await User.findAll({
    where: {
      id: req.params.id
    }
  });
  if (!userData){
    res.status(404).json({message: 'No user found with this id'})
  }
  res.json(userData);
})

// Delete user
router.delete('/:id', (req, res) => {
  User.destroy({
      where: {
          id: req.params.id
      }
  })
  .then(data => {
      if (!data) {
          res.status(404).json({message: "No user found with this ID"})
      }
      res.json(data);
  })
  .catch((err) => {
      res.status(500).json(err);
  })
})


module.exports = router;
