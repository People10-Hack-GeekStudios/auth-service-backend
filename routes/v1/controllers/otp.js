require('dotenv').config();
const axios = require('axios')

const redis = require('../../../services/redis_db');

// Response
const { resp } = require('../data/response');

const otpSender = (phone, otp) => {
  return new Promise((resolve, reject) => {
    let url = process.env.OTP_URL + otp + '%7C&numbers=' + phone
    axios.get(url)
      .then((response) => {
        if (response.data.return) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
      .catch((error) => {
        console.log(error)
        return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null })
      })
  })
}

function cacheOTP(req, otp, res) {
  if (redis.IsReady) {
    var left;
    redis.get(req.body.country_code + '-' + req.body.phone + '-limit')
      .then((reply) => {
        if (reply == null) {
          redis.set(req.body.country_code + '-' + req.body.phone + '-limit', 600, 'ex', 10) //PUT 3 AS LIMIT IN PROD
            .then((reply) => {
              redis.set(req.body.country_code + '-' + req.body.phone + '-otp', otp, 'ex', 180)
                .then(async (reply) => {
                  const otpSent = await otpSender(req.body.phone, otp)
                  if (otpSent) {
                    return res.status(200).json({ "response_code": 200, "message": resp["otp-generation-success"], "response": null/*{ "otp" : otp}*/ });
                  } else {
                    redis.del(req.body.country_code + '-' + req.body.phone + '-limit')
                      .then(reply => {
                        return res.status(200).json({ "response_code": 500, "message": resp["otp-generation-failed"], "response": null });
                      })
                      .catch(err => {
                        console.log(error);
                        return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
                      })
                  }
                })
                .catch(error => {
                  console.log(error);
                  return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
                });
            })
            .catch(error => {
              console.log(error);
              return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
            });
        } else if (reply > 0) {
          redis.decr(req.body.country_code + '-' + req.body.phone + '-limit')
            .then((reply) => {
              redis.set(req.body.country_code + '-' + req.body.phone + '-otp', otp, 'ex', 180)
                .then(async (reply) => {
                  const otpSent = await otpSender(req.body.phone, otp)
                  if (otpSent) {
                    return res.status(200).json({ "response_code": 200, "message": resp["otp-generation-success"], "response": null/*{ "otp" : otp}*/ });
                  } else {
                    redis.incr(req.body.country_code + '-' + req.body.phone + '-limit')
                      .then(reply => {
                        return res.status(200).json({ "response_code": 500, "message": resp["otp-generation-failed"], "response": null });
                      })
                      .catch(err => {
                        console.log(error);
                        return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
                      })
                  }
                })
                .catch(error => {
                  console.log(error);
                  return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
                });
            })
            .catch(error => {
              console.log(error);
              return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
            });
        } else {
          redis.ttl(req.body.country_code + '-' + req.body.phone + '-limit')
            .then((reply) => {
              var ttl = parseInt(parseInt(reply) / 60);
              return res.status(200).json({ "response_code": 429, "message": "Max OTP Limit reached. Try after " + ttl + "hrs.", "response": null });
            })
            .catch(error => {
              console.log(error);
              return res.status(200).json({ "response_code": 429, "message": resp["max-otp-reached"], "response": null });
            });
        }
      })
      .catch(error => {
        console.log(error);
        return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
      });
  } else {
    console.log("Redis not connected error");
    return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
  }
}

async function uncacheOTP(req, res, data) {
  if (redis.IsReady) {
    redis.del(req.body.country_code + '-' + req.body.phone + '-otp')
      .then((reply) => {
        data.device = undefined;
        return res.status(200).json({ "response_code": 200, "message": resp["logged-in-success"], "response": { "user": data, "accessToken": req.accesstoken, "refreshToken": req.refreshtoken } });
      })
      .catch(error => {
        console.log(error);
        return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
      })
  } else {
    console.log("Redis not connected error");
    return res.status(200).json({ "response_code": 500, "message": resp[500], "response": null });
  }
}

module.exports = {
  cacheOTP,
  uncacheOTP
};