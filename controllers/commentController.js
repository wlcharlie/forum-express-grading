const commentService = require('../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect(`/restaurants/${data.id}`)
    })
  },

  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect(`/restaurants/${data.id}`)
    })
  }
}

module.exports = commentController