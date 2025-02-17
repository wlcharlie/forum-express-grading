const categoryService = require('../../services/categoryServices')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      if (req.params.id) { return res.json(data.category) }
      return res.json(data)
    })
  },

  postCategories: (req, res) => {
    categoryService.postCategories(req, res, (data) => {
      return res.json(data)
    })
  },

  putCategories: (req, res) => {
    categoryService.putCategories(req, res, (data) => {
      return res.json(data)
    })
  },

  deleteCategories: (req, res) => {
    categoryService.deleteCategories(req, res, (data) => {
      return res.json(data)
    })
  },
}

module.exports = categoryController