import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  return res.json({ status: 'ok' });
});

// TODO: retornar status das dependencias ex: redis,database, etc
// router.get("/health/dependencies", (req, res) => {
//   return res.json({});
// });

export default router;
