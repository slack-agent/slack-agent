const { isVerified } = require('../services/authService.js');
const { addParkingPlace } = require('../dao/parkingPlace.js');
const { success, unauthorized } = require('../utilities/reponseBuilder.js');
const { isCity } = require('../utilities/requestValidator.js');
const { parseBodyToObject } = require('../utilities/requestParser.js');
const { generateResponseBody } = require('../utilities/responseBody.js');

const { CAN_NOT_ADD_PARKING_PLACE, ADD_PARKING_PLACE } = require('../utilities/responseMessages.js');
const { SIGNING_SECRET, ENV_STAGE } = require('../../config/all.js');

module.exports.add = async (event) => {
  if (!await isVerified(event, SIGNING_SECRET, ENV_STAGE)) {
    return unauthorized();
  }

  const { message, isValid } = parseBodyToObject(event.body, {
    city: {
      required: (city) => !!city,
      pattern: isCity
    },
    placeId: {
      required: (date) => !!date
    }
  });

  if (!isValid) {
    return success(generateResponseBody(message));
  }

  await addParkingPlace(message).catch(() => {
    return success(generateResponseBody(CAN_NOT_ADD_PARKING_PLACE));
  });

  const { city, placeId } = message;

  return success(
    generateResponseBody(ADD_PARKING_PLACE(city, placeId))
  );
};
