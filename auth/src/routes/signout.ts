import { SIGNOUT_API } from '../api-constants';
import express from 'express';

const router = express.Router();

router.post(SIGNOUT_API, (req, res) => {
  req.session = null;

  res.send({});
});

export { router as signoutRouter };
