const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    }).then(comment => res.redirect(`/restaurants/${req.body.restaurantId}`))
  },

  deleteComment: (req, res) => {

  }
}

module.exports = commentController