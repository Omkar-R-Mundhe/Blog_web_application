const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const adminLayout = '../views/layouts/admin';
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/authToken.js");


// GET *admin page
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});



// POST * register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({
          username,
          password:hashedPassword 
      });

      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }

  } catch (error) {
    console.log(error);
  }
});




// POST * admin login check 
router.post('/admin', async (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials (this is just an example, implement your own logic)
  
  const user = await User.findOne({ username });
  const isValid = await bcrypt.compare(password, user.password);
  if (!user || !isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Send token as a cookie
  res.cookie('token', token, { httpOnly: true });
  
  res.redirect('/dashboard');
});




//  GET * Admin Dashboard

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find({ user: req.user.id })
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});



//  GET * Admin - Create New Post

router.get('/add-post',authenticateToken,  async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});




//  POST * Admin - Create New Post

router.post("/add-post", authenticateToken, async (req, res) => {
  try {
    await Post.create({
      title: req.body.title,
      body: req.body.body,
      user: req.user.id,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// GET *Admin - edit  Post

router.get('/edit-post/:id', authenticateToken, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }

});


// PUT * edit post
router.put('/edit-post/:id',  async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }

});



// DELETE * delete post
router.delete('/delete-post/:id',  async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});



// GET *logout
router.post("/logout", (req, res) => {
  console.log("Logging out, clearing token");
  res.clearCookie("token");
  res.redirect("/admin");
});


module.exports = router;














// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    
//     if(req.body.username === 'admin' && req.body.password === 'password') {
//       res.send('You are logged in.')
//     } else {
//       res.send('Wrong username or password');
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });