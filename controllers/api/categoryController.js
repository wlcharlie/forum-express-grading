const categoryService = require('../../services/categoryServices')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      if (req.params.id) { return res.json(data.category) }
      return res.json(data)
    })
  }
}

module.exports = categoryController