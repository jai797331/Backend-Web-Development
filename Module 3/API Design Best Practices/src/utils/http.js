
function sendOk(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data
  });
}

function sendCreated(res, data) {
  return sendOk(res, data, 201);
}

function sendList(res, posts, pagination) {
  return sendOk(res, {
    posts,
    pagination
  });
}

function sendError(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message
    }
  });
}

module.exports = {
  sendOk,
  sendCreated,
  sendList,
  sendError
};
