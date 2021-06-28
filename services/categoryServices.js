const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, cb) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        return Category.findByPk(req.params.id, { raw: true, nest: true })
          .then(category => cb({ categories, category }))
      }
      return cb({ categories: categories })
    })
  },


  postCategories: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: "name is not exist" })
    }
    return Category.create({ name: req.body.name })
      .then((category) => cb({ status: 'success', message: 'category was added' }))
  },

  putCategories: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: "name is not exist" })
    }

    Category.update({ name: req.body.name }, { where: { id: req.params.id } })
      .then(() => {
        return cb({ status: 'success', message: 'category was updated' })
      })
  },

  deleteCategories: (req, res, cb) => {
    Category.destroy({ where: { id: req.params.id } })
      .then(() => {
        return cb({ status: 'success', message: 'category was deleted' })
      })
      .catch(err => cb({ status: 'error', message: "please try again" }))
  }
}

module.exports = categoryService