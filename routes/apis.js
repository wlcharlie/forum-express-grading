const express = require('express')
const passport = require('../config/passport')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const router = express.Router()

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController.js')
const restController = require('../controllers/api/restController')
const commentController = require('../controllers/api/commentController')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)

router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id/toggleAdmin', authenticated, authenticatedAdmin, adminController.toggleAdmin)

router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticatedAdmin, authenticated, adminController.deleteRestaurant)

router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
router.get('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategories)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategories)
router.delete('/admin/categories/:id', authenticatedAdmin, authenticated, categoryController.deleteCategories)



// restaurants
router.get('/restaurants', authenticated, authenticatedAdmin, restController.getRestaurants)
router.get('/restaurants/top', authenticated, authenticatedAdmin, restController.getTopRestaurants)
router.get('/restaurants/:id/dashboard', authenticated, authenticatedAdmin, restController.getDashboard)
router.get('/restaurants/feeds', authenticated, authenticatedAdmin, restController.getFeeds)
router.get('/restaurants/:id', authenticated, authenticatedAdmin, restController.getRestaurant)

// router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
// router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
// router.post('/like/:restaurantId', authenticated, userController.addLike)
// router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.post('/comments', authenticated, authenticatedAdmin, commentController.postComment)
router.delete('/comments/:id', authenticated, authenticatedAdmin, commentController.deleteComment)

//user profile


module.exports = router