const request = require("request");

const CAPTCHA_SECRET_KEY = "6LdwaO0UAAAAAAzU6d79VVKYDSJM-i0QBNeo8t5J";

exports.processRegistrationRequest = (req, res) => {
  console.log("[POST]: @api/registration");
  let response = { captcha: false, success: false };

  if (
    req.body.token === undefined ||
    req.body.token === "" ||
    req.body.token === null
  ) {
    return res.json(response);
  }

  const verifyCaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET_KEY}&response=${req.body.token}`;
  request(verifyCaptchaURL, (err, res, body) => {
    const resBody = JSON.parse(body);
    if (resBody.success !== undefined && resBody.success) {
      response.captcha = true;
    }
    if (err) {
      console.error(
        "[ERROR]: @api/registration\nAn unknown error has occurred while attempting to make a reCAPTCHA API call.",
        err
      );
    }
  });

  //database call
  response.success = true;
  res.json(response);
};
