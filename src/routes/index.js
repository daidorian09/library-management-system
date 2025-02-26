import { Router } from 'express';

import user from './RouteUsers';
import book from './RouteBooks';

const router = new Router();

router.use('/users', user);
router.use('/books', book);

export default router;
