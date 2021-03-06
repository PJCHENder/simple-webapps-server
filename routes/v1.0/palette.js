const express = require('express')
const router = express.Router({mergeParams: true})
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const passport = require('passport')
const Model = require('../../models')

/**
 * GET /v1.0/palette/
 * 用來取得使用者的色票檔
 */

router.get('/', jsonParser, (req, res, next) => {
  // Custom Passport Response
  passport.authenticate('jwt', (err, user, info) => {
    if (err) { return next(err) }

    // 如果找不到使用者
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: info.message
      })
    }

    // 如果有找到使用者，找出使用者的色票
    const query = Model.Palette.findOne({user: user._id})

    query.exec((err, palette) => {
      if (err) {
        return next(err)
      }

      // 如果找不到 palette
      if (!palette) {
        return res.status(200).json({
          status: 400,
          message: 'Could not find the palette. Please create palette first.'
        })
      }

      return res.status(200).json({
        status: 200,
        message: 'get Palette',
        colors: palette.colors,
        updated_at: palette.updated_at
      })
    })
  })(req, res, next)/* /custom Passport Response */
})

/**
 * POST /v1.0/palette/
 * 用來建立使用者的色票檔
 */
router.post('/', jsonParser, (req, res, next) => {
  /* Custom Passport Response */
  passport.authenticate('jwt', (err, user, info) => {
    if (err) { return next(err) }

    // 如果找不到使用者
    if (!user) {
      return res.status(401).json({
        status: 400,
        message: info.message
      })
    }

    // 如果找到使用者，但色票檔尚未建立
    const query = Model.Palette.findOne({user: user._id})
    query.exec((err, palette) => {
      if (err) {
        return next(err)
      }

      if (!palette) {
        // 如果找不使用者的色票，則在資料庫中建立新的色票檔
        let newPalettes = new Model.Palette({
          colors: [],
          user: user._id
        })

        newPalettes.save(function (err, newPalette) {
          if (err) {
            return next(err)
          }

          res.status(200).json({
            status: 200,
            message: 'Create New Palette',
            newPalette
          })
        })
      } else {
        // 如果使用者色票檔已存在
        return res.status(200).json({
          status: 200,
          message: 'Palette Already Exists',
          palette
        })
      }
    })
  })(req, res, next)/* /Custom Passport Response */
})

/**
 * PUT /v1.0/palette/
 * 用來更新使用者的色票檔
 */
router.put('/', jsonParser, (req, res, next) => {
  /* Custom Passport Response */
  passport.authenticate('jwt', (err, user, info) => {
    if (err) { return next(err) }

    // 如果找不到使用者
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: info.message
      })
    }

    const query = Model.Palette.findOne({user: user._id})
    query.exec((err, palette) => {
      if (err) {
        return next(err)
      }
      // 找到使用者，但色票檔尚未建立
      if (!palette) {
        return res.status(200).json({
          status: 400,
          message: 'Palette not created yet'
        })
      }

      // 如果使用者色票檔已存在

      if (Array.isArray(req.body.colors)) {
        palette.colors = req.body.colors
        palette.save((err, palette) => {
          if (err) {
            return next(err)
          }

          return res.status(200).json({
            status: 200,
            message: 'Palette save successfully',
            updated_at: palette.updated_at,
            palette
          })
        })
      } else {
        return res.status(200).json({
          status: 400,
          message: 'Wrong format of colors'
        })
      }
    })
  })(req, res, next)/* /Custom Passport Response */
})

module.exports = router
