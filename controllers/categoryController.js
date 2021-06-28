const db = require('../models')
const Category = db.Category

const categoryService = require('../services/categoryServices')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },

  postCategories: (req, res) => {
    categoryService.postCategories(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/categories')
    })
  },

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

  deleteCategories: (req, res) => {
    Category.destroy({ where: { id: req.params.id } })
      .then(() => {
        req.flash('success_messages', 'The category has been successfully deleted!')
        return res.redirect('/admin/categories')
      })
  }
}

module.exports = categoryController