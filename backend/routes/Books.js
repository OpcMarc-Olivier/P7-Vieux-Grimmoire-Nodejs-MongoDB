const express = require ('express')
const router = express.Router()
const booksCtrl = require('../controllers/Books')
const auth = require('../midlewares/auth')
const multer = require ('../midlewares/multer-config')
const multer2 = require ('../midlewares/multer-config2')

router.get('/', booksCtrl.getAllBooks)
router.get('/bestrating', booksCtrl.bestRating)
router.get('/:id', booksCtrl.getOneBook)
router.post('/',auth, multer2, booksCtrl.addBook)
router.put('/:id',auth, multer2, booksCtrl.modifyBook2)
router.post('/:id/rating',auth,booksCtrl.addRating)
router.delete('/:id',auth, booksCtrl.deleteBook)


module.exports = router ;