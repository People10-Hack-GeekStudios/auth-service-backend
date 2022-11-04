const Ajv = require("ajv")
const ajv = new Ajv()

// Response
const { resp } = require("../data/response");

// Validate Phone & OTP
const schemaPhoneOTP = {
  type: "object",
  properties: {
    phone: { type: "string", maxLength: 10, minLength: 4 },
    otp: { type: "string", maxLength: 6, minLength: 6 },
    device: {
      type: "object",
      properties: {
        fcm: { type: "string", maxLength: 500, minLength: 10 }
      },
      additionalProperties: false
    }
  },
  required: ["phone", "otp","device"],
  additionalProperties: false,
}

const validatePhoneOTP = ajv.compile(schemaPhoneOTP)

function isPhoneOTP(req, res, next) {
  const valid = validatePhoneOTP(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}


// Validate Phone
const schemaPhone = {
  type: "object",
  properties: {
    phone: { type: "string", maxLength: 10, minLength: 10 },
    type: { type: "string", enum: ["user","admin","donee"] }
  },
  required: ["phone", "type"],
  additionalProperties: false,
}

const validatePhone = ajv.compile(schemaPhone)

function isPhone(req, res, next) {
  const valid = validatePhone(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

// Validate Pass
const schemaPass = {
  type: "object",
  properties: {
    password: { type: "string", maxLength: 14, minLength: 6 }
  },
  required: ["password"],
  additionalProperties: false,
}

const validatePass = ajv.compile(schemaPass)

function isPass(req, res, next) {
  const valid = validatePass(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

// Validate Pass
const schemaDeliveryLogin = {
  type: "object",
  properties: {
    uid: { type: "string", maxLength: 16, minLength: 16 },
    password: { type: "string", maxLength: 14, minLength: 6 },
    device: {
      type: "object",
      properties: {
        fcm: { type: "string", maxLength: 500, minLength: 10 }
      },
      additionalProperties: false
    }
  },
  required: ["uid","password","device"],
  additionalProperties: false,
}

const validateDeliveryLogin = ajv.compile(schemaDeliveryLogin)

function isDeliveryLogin(req, res, next) {
  const valid = validateDeliveryLogin(req.body)
  if (!valid) {
    return res.status(200).json({ "response_code": 400, "message": resp[400], "response" : null })
  } else {
    next();
  }
}

module.exports = {
  isPhone,
  isPhoneOTP,
  isPass,
  isDeliveryLogin
};