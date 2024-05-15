const { log } = require('console')
const Book = require('../models/Book')
const fs = require('fs')
const path = require ('path')
const sharp = require('sharp')

exports.getAllBooks = (req,res,next)=>{
   Book.find()
   .then(books => res.status(200).json(books))
   .catch( error => res.status(400).json({error}))
}

exports.getOneBook = (req,res,next)=>{
 Book.findOne({_id: req.params.id })
 .then(book => res.status(200).json(book))
 .catch( error => res.status(404).json({error}))
}


exports.addBook = async (req,res,next)=>{
   console.log(req.file);
   const ref = `resized-${Date.now()}-${req.file.originalname}`
   const compressedImageFilePath = path.join(__dirname,'../','images',ref)
   const resizedImage = await sharp(req.file.buffer)
   .resize({width:900})
   .jpeg({
      quality: 80
   })
   .toFile(compressedImageFilePath)
   .then((info)=> console.log(info));

   const bookObject = JSON.parse(req.body.book);
   delete bookObject._id;
   delete bookObject.userId;
   console.log(bookObject);
   const bookToAdd = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`
   })
   bookToAdd.save()
   .then(()=>res.status(201).json({message: 'Objet enregistré'}))
   .catch(error=> res.status(400).json({error}))
}

exports.modifyBook = async (req,res,next) =>{
   
   const bookObject = req.file? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : {...req.body};

   delete bookObject._userId;
   Book.findOne({_id: req.params.id })
   .then(book => {
      if(book.userId != req.auth.userId){res.status(401).json({message:'Non autorisé'})}
      else{
         Book.updateOne({_id: req.params.id },{...bookObject,_id:req.params.id})
         .then(() => res.status(200).json({message: 'Object modifié'}))
         .catch( error => res.status(401).json({error}))
            }
   })
   .catch(error=> res.status(400).json({error}))


   
}
exports.modifyBook2= async (req,res,next) =>{
   if (req.file){
   const ref = `resized-${Date.now()}-${req.file.originalname}`
   const compressedImageFilePath = path.join(__dirname,'../','images',ref)
   const resizedImage = await sharp(req.file.buffer)
   .resize({width:900})
   .jpeg({
      quality: 80
   })
   .toFile(compressedImageFilePath)
   .then((info)=> console.log(info));

   const bookObject =  {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`
   }
   delete bookObject._userId;

   Book.findOne({_id: req.params.id })
   .then(book => {
      if(book.userId != req.auth.userId) {
         res.status(401).json({message:'Non autorisé'})
      }else{
         const filename = book.imageUrl.split('/images/')[1];
         fs.unlink(`images/${filename}`, ()=>{
            Book.updateOne({_id: req.params.id },{...bookObject,_id:req.params.id})
         .then(() => res.status(200).json({message: 'Object modifié'}))
         .catch( error => res.status(401).json({error}))
         })
      }
   })
   .catch(error=> res.status(400).json({error}));
}else {
   const bookObject = {...req.body}
   delete bookObject._userId;
   Book.findOne({_id: req.params.id })
   .then(book => {
      if(book.userId != req.auth.userId){res.status(401).json({message:'Non autorisé'})}
      else{
         Book.updateOne({_id: req.params.id },{...bookObject,_id:req.params.id})
         .then(() => res.status(200).json({message: 'Object modifié'}))
         .catch( error => res.status(401).json({error}))
            }
   })
   .catch(error=> res.status(400).json({error}));
}
}

exports.addRating = (req,res,next)=>{
   console.log(req.params);
   console.log(req.body);
   console.log(req.auth);
   const newRating = {
      userId: req.auth.userId,
      grade: req.body.rating
   }
   Book.findOne({_id: req.params.id})
   .then(book =>{
      const userRating = book.ratings.find(rating=>{
         rating.userId === req.auth.userId 
      })
      if(userRating){
         res.status(403).json({message:'Désolé, Vous ne pouvez pas notez ce livre plus plusieurs fois.'})
      }
      book.ratings.push(newRating);
      book.averageRating = book.ratings.reduce((sum,rating)=> sum + rating.grade,0)/ book.ratings.length
      console.log(book);
      return book.save()
   
   .then(book => res.status(200).json(book))
   .catch(error => res.status(400).json({error}))
      
      
      
   })
   .catch(error => res.status(400).json({error}))
}

exports.deleteBook = (req,res,next) => {
   Book.findOne({_id: req.params.id })
   .then(book => {
      if(book.userId != req.auth.userId) {
         res.status(401).json({message:'Non autorisé'})
      }else{
         const filename = book.imageUrl.split('/images/')[1];
         fs.unlink(`images/${filename}`, ()=>{
            Book.deleteOne({_id: req.params.id})
            .then(()=> res.status(200).json({message: 'Object supprimé'}))
            .catch(error=> res.status(401).json({error}))
         })
      }
   })
   .catch( error => res.status(500).json({error}))
}

exports.bestRating = (req,res,next) => {
   Book.find()
   .then(books => {
      books.sort((a, b) => b.averageRating - a.averageRating);
        const bestRatedBooks = books.slice(0, 3);
        res.status(200).json(bestRatedBooks);
   })
   .catch(error=> res.status(400).json({error}))
}