const ns = '[user.controller]';
const logger = require('applogger');
const { BadRequestError } = require('../modules/error');
const { UserBackend } = require('./user.backend');

const getMyself = (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[getMyself]`;
  const user = req.userInfo;
  logger.info(fn, 'user:', user);

  try {
    res.status(200).json({
      error: false,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const setUserLanguages = async (req, res, next) => {
  const fn = `[${req.requestId}]${ns}[setUserLanguages]`;
  const user = req.userInfo;
  const {SecUserModel} = require('../../models/UserModel');
  logger.info(fn, 'user:', user.userId, 'username:', user.username);
  const data = req.body;
  try {
    if (!user || !user.userId || !data || !data.languages || !data.languages.length) {
      throw new BadRequestError();
    }
    var userUpdated = await UserBackend.setUserLanguages({ _id: user.userId }, {
      requestId: req.requestId,
      localizer: req.localizer,
      ...data
    });
    
    req.session.userInfo = SecUserModel.FromAccountSchema(userUpdated);
    
    res.status(200).json({
      error: false,
      data: userUpdated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyself,
  setUserLanguages,
};
