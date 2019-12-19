const {Router} = require('express');

const errorHandler = require('../middlewares/errorHandler');
const undefRoutesHandler = require('../middlewares/undefRoutesHandler');
const userRouter = require('../controllers/user');
const postRouter = require('../controllers/post');
const authRouter = require('../controllers/auth');
const commentRouter = require('../controllers/comment');

const router = Router();
router.use('/', userRouter);
router.use('/', postRouter);
router.use('/', authRouter);
router.use('/', commentRouter);

router.use('*', undefRoutesHandler);
router.use(errorHandler);

module.exports = router;