const User = require("../models/User");
const CryptoJS = require("crypto-js");
const checkExpires = require("../../utils/checkExpires");
const verifyToken = require('../../utils/verifyToken')
class UserController {
  async create(req, res) {
    console.log(checkExpires(req, res));
    if (!checkExpires(req, res)) {
      return res.json({
        status: 456,
        error: "Bạn đã hết phiên đăng nhập, vui lòng đăng nhập lại",
      });
    }
    const newUser = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
      isAdmin: req.body.isAdmin,
      isVerified: 1
    });
    
    try {
      const user = await newUser.save();
      return res.status(200).json({ success: "Thêm thành công", data: user });
    } catch (err) {
      return res.status(500).json({ error: "Thêm thất bại" });
    }
  }

  async update(req, res) {
    if (!checkExpires(req, res)) {
      return res.json({
        status: 456,
        error: "Bạn đã hết phiên đăng nhập, vui lòng đăng nhập lại",
      });
    }
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        {
          new: true,
        }
      );
      res.json({
        success: "Sửa thành công!",
        data: updatedUser,
      });
    } catch (err) {
      res.status(500).json({
        error: "Sửa thất bại",
      });
    }
  }
  async delete(req, res) {
    if (!checkExpires(req, res)) {
      return res.json({
        status: 456,
        error: "Bạn đã hết phiên đăng nhập, vui lòng đăng nhập lại",
      });
    }
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: "Xóa thành công" });
    } catch (err) {
      res.status(500).json({
        error: "Xóa  thất bại",
      });
    }
  }
  async show(req, res) {
    if (!checkExpires(req, res)) {
      return res.json({
        status: 456,
        error: "Bạn đã hết phiên đăng nhập, vui lòng đăng nhập lại",
      });
    }
    try {
      const user = await User.findById(req.params.id);
      const { password, ...info } = user._doc;
      res.status(200).json(info);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  }
  async showAll(req, res) {
    if (!checkExpires(req, res)) {
      return res.status(456).json({
        status: 456,
        error: "Bạn đã hết phiên đăng nhập, vui lòng đăng nhập lại",
      });
    }
    try {
      var page = req.query.page;
      var limit = req.query.limit;
      const user = await User.find({});
      const total = user.length;
      if (page) {
        page = parseInt(page);
        if(page < 1)
          page = 1
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
        const users = await User.find({}).skip(skip).limit(limit);
        return res.status(200).json({
          userList: users,
          total: total,
        });
      }
    } catch (err) {
      res.status(500).json({
        error: "Hiển thị thất bại",
      });
    }
  }
  async getInfoFromToken(req, res){
    verifyToken(req, res)
  }
}
module.exports = new UserController();
