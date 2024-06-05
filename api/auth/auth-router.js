const router = require('express').Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Users = require('../user/users-model')




const rounds = 8;


router.post('/register', async (req, res, next) => {
  try{
  const {username, password} = req.body;

  if(!username || !password){
    return res.status(400).json({message:'username and password required'})
  }

  const existingUser = await Users.findBy({username}).first()
  if(existingUser){
    return res.status(409).json({message:'username taken'})
  }


    const hash = bcrypt.hashSync(password,rounds)
    const newUser = await Users.add({username, password: hash})

    res.status(201).json(newUser)
  }catch(err){
    next(err)
  }

 
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login',async (req, res, next) => {
  try{
  const {username, password} = req.body

  if(!username || !password) {
    return res.status(400).json({message: 'username and password required'})
  }


    const user = await Users.findBy({username}).first()

    if(user && bcrypt.compareSync(password, user.password)){
      const token = generateToken(user);
      res.status(200).json({message: `welcome, ${user.username}`, token})
    }else{
      res.status(401).json({message:'invalid credentials'})
    }

    }catch(err){
      next(err)
  }
  
});

function generateToken(user){
  const payload = {
    subject:user.id,
    username: user.username
  };
  const options = {
    expiresIn: '1h',
  };
  const secret = process.env.SECRET || 'shh';
  return jwt.sign(payload, secret, options)

}




module.exports = router;
