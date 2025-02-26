import { Router } from 'express';
import { user } from '../controllers/index';

import catchErrors from '../helpers/catchErrors';

const router = Router();

router.get('/', catchErrors(user.get));
router.post('/', catchErrors(user.create));
router.get('/:id/', catchErrors(user.getById));
router.post('/:id/borrow/:bookId', catchErrors(user.borrow));
router.post('/:id/return/:bookId', catchErrors(user.return));

export default router;
