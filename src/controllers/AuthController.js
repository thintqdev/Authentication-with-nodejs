const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const token = require("../models/Token");
const { sendEmail } = require("../../utils/mailer");
const { isJwtExpired } = require("jwt-check-expiration");
const Token = require("../models/Token");
// const bcrypt = require('bcrypt')
class AuthController {
  async register(req, res, next) {
    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser) {
      return res.status(409).json({
        msg: `email đã tồn tại`,
      });
    }

    const user = await new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
    }).save();
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    try {
      sendEmail(
        req.body.email,
        "Activation Your Account",
        `
      Click here to activation your account: ${process.env.BASE_URL}/api/auth/verify/${user.id}/${token.token}
      `
      )
        .then(() =>
          // console.log(`successfully sent validation code to ${req.body.email}`)
           res.redirect("http://localhost:3000/verify-register-success")
        )
        .catch((error) => {
          console.log(
            `error while sending verification code to email ${req.body.email}`
          );
        });
      return res.status(200).json({
        msg: "Đăng ký thành công, vui lòng xác thực email để đăng nhập",
      });
    } catch (err) {
      await User.deleteOne({ email: req.body.email });
      next(err);
    }
  }

  async verify(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.id });
      console.log(req.params.id);
      if (!user) {
        return res.status(400).json({ msg: "Link lỗi" });
      }
      const token = await Token.findOne({
        token: req.params.token,
        userId: user._id,
      });
      console.log(token);
      if (!token) {
        return res.status(400).json({ msg: "Link lỗi" });
      }
      await User.findByIdAndUpdate(
        user._id,
        {
          isVerified: 1,
        },
        {
          new: true,
        }
      );
      await Token.findByIdAndRemove(token._id);
      return res.redirect("http://localhost:3000/verify-register-success");
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Chưa xác thực được email" });
    }
  }

  async login(req, res) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user.isVerified === 0) {
        res.status(401).json({ msg: "Vui lòng xác thực email" });
      }
      if (!user) {
        return res.status(400).json({ msg: "Sai email hoặc mật khẩu" });
      }
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
      if (originalPassword !== req.body.password) {
        return res.status(400).json({ msg: "Sai email hoặc mật khẩu" });
      }
      const accessToken = jwt.sign(
        {
          id: user._id,
          fullName: user.fullName,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        },
        process.env.SECRET_KEY,
        { expiresIn: 600 }
      );

      const { password, ...info } = user._doc;
      return res.status(200).json({ user: info, accessToken: accessToken, msg:"Đăng nhập thành công" });
    } catch (error) {
      return res.status(500).json({msg:"Lỗi server"});
    }
  }
  async isTokenExpired(req, res) {
    const headers = req.headers.token;
    try {
      if (headers) {
        const token = headers.split(" ")[1];
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        var dateNow = new Date();
        if (decode.exp > dateNow.getTime() / 1000) {
          const user = await User.findById(decode.id);
          res.status(200).json({ data: user });
        }
      }
    } catch (error) {
      return res.status(400).json({
        msg: "Token hết hạn, mời bạn đăng nhập lại",
      });
    }
  }
}

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

module.exports = new AuthController();
