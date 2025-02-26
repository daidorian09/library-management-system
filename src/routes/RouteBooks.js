import { Router } from 'express';
import { book } from '../controllers/index';

import catchErrors from '../helpers/catchErrors';

const router = Router();

router.get('/', catchErrors(book.get));
router.post('/',  catchErrors(book.create));
router.get('/:id/', catchErrors(book.getById));

export default router;
