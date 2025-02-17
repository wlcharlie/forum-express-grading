const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


const adminService = {
  getRestaurants: (req, res, cb) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    }).then(restaurants => {
      return cb({ restaurants })
    })
  },

  createRestaurant: (req, res, cb) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories =>
      cb({ categories })
    )
  },

  postRestaurant: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: 'name is not exist' })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          return cb({ status: 'success', message: 'restaurant was successfully created' })
        })
      })
    }
    else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {
        return cb({ status: 'success', message: 'restaurant was successfully created' })

      })
    }
  },

  getRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    }).then(restaurant => {
      return cb({ restaurant })
    })
  },

  editRestaurant: (req, res, cb) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return cb({
          categories: categories,
          restaurant: restaurant.toJSON()
        })
      })
    })
  },

  putRestaurant: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: "name is not exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            })
              .then((restaurant) => {
                return cb({ status: 'success', message: 'restaurant was successfully to update' })
              })
          })
      })
    }
    else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          })
            .then((restaurant) => {
              return cb({ status: 'success', message: 'restaurant was successfully to update' })
            })
        })
    }
  },


  deleteRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            cb({ status: 'success', message: '' })
          })
      })
  },


  getUsers: (req, res, cb) => {
    return User.findAll({ raw: true })
      .then(users => cb({ users }))
  },


  toggleAdmin: (req, res, cb) => {
    return User.findByPk(req.params.id)
      .then(user => {
        user.isAdmin = !user.isAdmin
        user.save().then(() => {
          return cb({ status: 'success', message: 'the user\'s role has updated' })
        })
      })
  }
}


module.exports = adminService