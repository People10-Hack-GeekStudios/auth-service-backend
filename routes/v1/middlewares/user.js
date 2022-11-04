const bcrypt = require('bcrypt');
const user = require('../../../models/user');
const delivery_user = require('../../../models/delivery_user');

// Response
const { resp } = require("../data/response");

function createUserIfNotExist(req, res, next) {

  user.findOne({ phone: req.body.phone })
    .then(data => {
      if (data == null) {
        var usernew = new user({
          phone: req.body.phone,
          account_type: req.body.type
        })
        usernew.save()
          .then(data => {
            next();
          })
          .catch(err => {
            if (err.name == 'ValidationError') {
              return res.status(200).json({ "response_code": 400, "message": resp[400], "response": null });
            } else {
              console.log(err);
              return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
            }
          })
      } else {
        if (data.is_blocked) {
          return res.status(200).json({ "response_code": 403, "message": resp["you-are-blocked"], "response": null });
        }
        if(data.account_type != req.body.type){
          return res.status(200).json({ "response_code": 400, "message": "User already registered as "+data.account_type+".", "response": null });
        }
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function validateUserExist(req, res, next) {

  user.findOne({ phone: req.body.phone })
    .then(data => {
      if (data == null) {
        return res.status(200).json({ "response_code": 404, "message": resp["account-not-found"], "response": null });
      } else {
        if (data.is_blocked) {
          return res.status(200).json({ "response_code": 403, "message": resp["you-are-blocked"], "response": null });
        }
        req.temp_user = data;
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function validateUserByID(req, res, next) {

  user.findById(req.token.id)
    .then(data => {
      if (data == null) {
        return res.status(200).json({ "response_code": 404, "message": resp["account-not-found"], "response": null });
      } else {
        if (data.is_blocked) {
          return res.status(200).json({ "response_code": 403, "message": resp["you-are-blocked"], "response": null });
        }
        req.temp_user = data;
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function validateDeliveryUserLogin(req, res, next) {

  delivery_user.findOne({ uid: req.body.uid })
    .then(async (data) => {
      if (data == null) {
        return res.status(200).json({ "response_code": 404, "message": resp["account-not-found"], "response": null });
      } else {
        if (data.is_blocked) {
          return res.status(200).json({ "response_code": 403, "message": resp["you-are-blocked"], "response": null });
        }
        if (await bcrypt.compare(req.body.password, data.password)) {
          req.temp_user = data;
          next();
        } else {
          return res.status(200).json({ "response_code": 401, "message": resp["uid-pass-wrong"], "response": null });
        }
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function validateDeliveryUser(req, res, next) {

  delivery_user.findOne({ uid: req.body.uid })
    .then(async (data) => {
      if (data == null) {
        return res.status(200).json({ "response_code": 404, "message": resp["account-not-found"], "response": null });
      } else {
        if (data.is_blocked) {
          return res.status(200).json({ "response_code": 403, "message": resp["you-are-blocked"], "response": null });
        }
        req.temp_user = data;
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function validateShopUserByID(req, res, next) {

  user.findById(req.token.id)
    .then(data => {
      if (data == null) {
        return res.status(200).json({ "response_code": 404, "message": resp["account-not-found"], "response": null });
      } else {
        if (data.is_blocked) {
          return res.status(200).json({ "response_code": 403, "message": resp["you-are-blocked"], "response": null });
        }
        if (data.account_type != "admin") {
          return res.status(200).json({ "response_code": 400, "message": resp["you-are-not-allowed"], "response": null });
        }
        req.temp_user = data;
        next();
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function checkIsBalanceRemaining(req, res, next) {

  delivery_user.find({ owner: req.token.id })
    .then(data => {
      if (data.length >= 3) {
        return res.status(200).json({ "response_code": 404, "message": resp["max-delivery-account-reached"], "response": null });
      } else {
        let new_delivery_agent = new delivery_user()
        new_delivery_agent.uid = req.temp_user.phone + '_emp_' + (req.temp_user.current_delivery_agent_number + 1)
        new_delivery_agent.password = req.body.password
        new_delivery_agent.owner = req.temp_user._id
        req.temp_user.current_delivery_agent_number += 1
        new_delivery_agent.save()
          .then(data => {
            next();
          })
          .catch(err => {
            console.log(err);
            return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
          })
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function removeGuestFCM(req, res, next) {

  guest_user.deleteOne({ fcm: req.body.device.fcm })
    .then(data => {
      next();
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function removeGuestFCMFromToken(req, res, next) {

  guest_user.deleteOne({ fcm: req.token.device_id })
    .then(data => {
      next();
    })
    .catch(err => {
      console.log(err);
      return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
    })
}

function maxDeviceCheck(req, res, next) {

  if (req.temp_user.device.length >= 5) {
    return res.status(200).json({ "response_code": 400, "message": resp["max-device-reached"], "response": null });
  }
  next();
}

module.exports = {
  createUserIfNotExist,
  validateUserExist,
  validateUserByID,
  validateDeliveryUser,
  validateDeliveryUserLogin,
  validateShopUserByID,
  removeGuestFCM,
  removeGuestFCMFromToken,
  maxDeviceCheck,
  checkIsBalanceRemaining
};