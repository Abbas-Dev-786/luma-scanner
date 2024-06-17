require("dotenv").config();
// __ Importing jimp __ \\
const Jimp = require("jimp");

// __ Importing filesystem = __ \\
const fs = require("fs");
const url = require("url");

// __ Importing qrcode-reader __ \\
const qrCodeReader = require("qrcode-reader");
const { default: axios } = require("axios");

// __ Read the image and create a buffer __ \\
const buffer = fs.readFileSync("./test.png");

const EVENT_ID = process.env.EVENT_ID;
const COOKIE = process.env.LOGIN_COOKIE;

// __ Parse the image using Jimp.read() __ \\
Jimp.read(buffer, function (err, image) {
  if (err) {
    console.error(err.message);
  }
  // __ Creating an instance of qrcode-reader __ \\

  const qrCodeInstance = new qrCodeReader();

  qrCodeInstance.callback = async function (err, value) {
    if (err) {
      console.error(err.message);
    }

    // __ Printing the decrypted value __ \\
    const { pk } = url.parse(value?.result, true)?.query;

    try {
      const res = await axios.get("https://api.lu.ma/event/admin/get-guest", {
        params: { event_api_id: EVENT_ID, proxy_key: pk },
        headers: { Cookie: COOKIE },
      });

      const { guest } = res.data;

      const response = await axios.post(
        "https://api.lu.ma/event/admin/update-check-in",
        {
          check_in_method: "scanner",
          check_in_status: "checked-in",
          type: "guest",
          event_api_id: EVENT_ID,
          rsvp_api_id: guest.api_id,
        },
        { headers: { Cookie: COOKIE } }
      );

      console.log(response);
    } catch (error) {
      console.log(error.message);
      //   console.log(error);
    }
  };

  // __ Decoding the QR code __ \\
  qrCodeInstance.decode(image.bitmap);
});
