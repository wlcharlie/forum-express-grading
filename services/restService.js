const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10

const restController = {
  getRestaurants: (req, res, cb) => {
    const offset = (req.query.page - 1) * pageLimit || 0

    const whereQuery = {}
    const categoryId = Number(req.query.categoryId) || ''

    if (categoryId) {
      whereQuery.CategoryId = categoryId
    }

    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      raw: true, nest: true,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? false : page - 1
      const next = page + 1 > pages ? false : page + 1

      const data = result.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))

      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return cb({
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },

  getRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category,
        { model: User, as: 'LikedUsers' },
        { model: User, as: 'FavoritedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      restaurant.increment('viewCounts')
      return cb({ isFavorited, isLiked, restaurant: restaurant.toJSON() })
    })
  },

  getFeeds: (req, res, cb) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return cb({ restaurants, comments })
    })
  },

  getDashboard: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id, { include: [Category, Comment] })
      .then(restaurant => {
        const commentsNum = restaurant.Comments.length
        return cb({ restaurant: restaurant.toJSON(), commentsNum })
      })
  },

  getTopRestaurants: (req, res, cb) => {
    Restaurant.findAll({
      include: [
        {
          model: User,
          as: 'FavoritedUsers',
          where: true
        }
      ]
    })
      .then(data => {
        let restaurants = data.map(d => ({
          ...d.dataValues,
          isFavorited: req.user.FavoritedRestaurants.map(f => f.id).includes(d.id),
          description: d.dataValues.description.substring(0, 20),
          FavoriteCount: d.FavoritedUsers.length
        }))
        restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount).slice(0, 11)

        cb({ restaurants })
      })
  }

}

module.exports = restController