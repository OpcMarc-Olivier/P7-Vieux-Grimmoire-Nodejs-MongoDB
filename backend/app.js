const express = require ('express')
const mongoose = require('mongoose');
const SignUp = require('./models/SignUp')
const booksRoutes = require('./routes/Books')


const app = express()
mongoose.connect('mongodb+srv://moperrois:YiMbABY8ZgoRcXzv@clusterp7.5f3ohlx.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/books', booksRoutes)



app.post('/api/auth/signup', (req, res, next) => {
  const signUp = new SignUp({...req.body})
  signUp.save()
  .then(()=> res.status(201).json({message:'Nouvel utilisateur enregistré'}))
  .catch((error)=> res.status(400).json({error}))
});





module.exports = app