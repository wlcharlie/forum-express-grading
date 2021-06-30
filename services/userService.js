const fs = require('fs')
const bcrypt = require('bcryptjs')

const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userService = {
  signUp: (req, res, cb) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      return cb({ status: 'error', message: '兩次密碼不同' })
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          return cb({ status: 'error', message: '信箱已被註冊' })
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            return cb({ status: 'success', message: '成功註冊' })
          })
        }
      })
    }
  },

  logout: (req, res, cb) => {
    req.logout()
    cb({ status: 'success', message: 'logged out' })
  },

  getUser: (req, res, cb) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    })
      .then(user => {
        const viewUser = user.toJSON()
        viewUser.Comments = viewUser.Comments.filter((e, i) => viewUser.Comments.map(n => n.RestaurantId).indexOf(e.RestaurantId) === i)
        return cb({ currentUser: req.user.id, viewUser })
      })
  },

  editUser: (req, res, cb) => {
    if (req.user.id !== Number(req.params.id)) {
      return cb({ status: 'error', message: 'no access' })
    }
    return User.findByPk(req.params.id)
      .then(user => cb({ user: user.toJSON() }))
  },

  putUser: (req, res, cb) => {
    if (!req.body.name) {
      // req.flash('error_messages', 'Name can\'t be blank')
      // return res.redirect('back')
      return cb({ status: 'error', message: 'name can not be blank' })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) { console.log('Error:', err) }
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : user.image
            }).then(user => {
              // req.flash('success_messages', `${user.name}'s profile was successfully updated`)
              // res.redirect(`/users/${user.id}`)
              return cb({ status: 'success', message: 'user updated', userId: user.id })
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            email: req.body.email,
            image: user.image
          }).then(user => {
            // req.flash('success_messages', `${user.name}'s profile was successfully updated`)
            // res.redirect(`/users/${user.id}`)
            return cb({ status: 'success', message: 'user updated', userId: user.id })
          })
        })
    }
  },

  addFavorite: (req, res, cb) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(() => cb({ status: 'success', message: 'added!' }))
  },

  removeFavorite: (req, res, cb) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return cb({ status: 'success', message: 'removed!' })
          })
      })
  },

  addLike: (req, res, cb) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return cb({ status: 'success', message: 'Liked!' })
      })
  },

  removeLike: (req, res, cb) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then((restaurant) => {
            return cb({ status: 'success', message: 'removed!' })
          })
      })
  },

  getTopUser: (req, res, cb) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return cb({ users })
    })
  },

  addFollowing: (req, res, cb) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then(followship => cb({ status: 'success', message: 'followed!' }))
  },

  removeFollowing: (req, res, cb) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then((followship) => {
      followship.destroy()
        .then(followship => cb({ status: 'success', message: 'remove' }))
    })
  }
}

module.exports = userService