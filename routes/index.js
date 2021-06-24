const helpers = require('../_helpers')

const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController')
const passport = require('passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {

  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  // login, reg, logout
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signup',
    failureFlash: true
  }), userController.signIn)
  app.get('/logout', userController.logout)

  // after login
  // user page
  app.get('/users/:id', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

  // restaurants
  app.get('/', authenticated, (req, res) => {
    res.redirect('restaurants')
  })
  app.get('/restaurants', authenticated, restController.getRestaurants)
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)

  // leave comment & delete for admin
  app.post('/comments', authenticated, commentController.postComment)
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

  // admin > restaurants
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  // admin > users 
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

  // admin > categories
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategories)
  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategories)
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategories)
}
