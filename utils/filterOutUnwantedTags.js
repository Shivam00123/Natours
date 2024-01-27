const filterOutUnwantedTags = (reqBody, options) => {
  return cleanReqBody.apply(reqBody, options);
};

function cleanReqBody(...filters) {
  const objectCopy = { ...this };
  filters.forEach((el) => delete objectCopy[el]);
  return objectCopy;
}

module.exports = filterOutUnwantedTags;
