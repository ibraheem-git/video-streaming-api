const express = require('express')
const router = express.Router();
const User = require('../models/Users');
const mailer = require('../mail')




  router.get('/', async (req, res) => {
    try {
      const getAllUsers = await User.find()
       res.json(getAllUsers)
    } catch (error) {
      res.status(404).json({success: false, err: "something went wrong"})
    }
    
})



  
router.post('/signUp', async (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
      return res.render('signUp', { err: 'Name, email and password are required' })
    }
      
    const userExist = await User.findOne({email})
    if (userExist) {
        return res.render('signUp', { err: 'Email already exist' })
    }
  
    const newClient = {name, email, password}
    try{
      await User.create(newClient);
      mailer(email, 'Sign up successful', 'Hi there, your registration is successful')
      return res.render('post', { err: 'Registration is successful' })
    }catch(error){
       return res.status(401).json('error')
    }
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    // console.log(email, password);
    if (!email || !password) {
      return res.render('login', { err: 'Email and password are requird' })
    }
    const userExist = await User.findOne({email})
    if (userExist) {
      if(!userExist.verified) {
        return res.redirect('login?err=Your accoun is not verified')
      }
      // save user data in session
      req.session.user = userExist;
      req.session.save(function(err) {
        // session saved
      })
      res.redirect('/dashb');
    } else {
      res.render('login', { err: 'Email or password is invalid' })
    }
})

router.post('/update', async (req, res) => {
  if(!req.session.user) {
    return res.redirect('/login?err=Please login');
  }
  const { _id } = req.session.user;
  const { name, email, password } = req.body;
  // const user_id = req.params;
//   if (!email) {
//     return res.status(400).json({ err: `user with ${user_id} not found`})
// }

  const user = await User.findById(_id);
  if(user) {
    if(name) user.name = name;
    if(email) user.email = email;
    if(user) user.password = password;
    user.save();
  }

    // const a = await User.findByIdAndUpdate( _id ,
    //   { name, email, password });
      req.session.user = user;
    return res.redirect('/edit?success=Your profile has been updated');
})

module.exports = router