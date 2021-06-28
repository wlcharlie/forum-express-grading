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

  // 尚未refactor
  postCategories: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name can\'t be blank')
      return res.redirect('back')
    }
    return Category.create({ name: req.body.name })
      .then((category) => { res.redirect('/admin/categories') })
  },

  // 尚未refactor
  putCategories: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name can\'t be blank')
      return res.redirect('back')
    }

    Category.update({ name: req.body.name }, { where: { id: req.params.id } })
      .then(() => {
        req.flash('success_messages', 'The category has been successfully updated!')
        return res.redirect('/admin/categories')
      })
  },

  // 尚未refactor
  deleteCategories: (req, res) => {
    Category.destroy({ where: { id: req.params.id } })
      .then(() => {
        req.flash('success_messages', 'The category has been successfully deleted!')
        return res.redirect('/admin/categories')
      })
  }
}

module.exports = categoryService