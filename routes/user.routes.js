const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    } finally {
      await prisma.$disconnect();
    }
});

router.delete('/:id', async (req, res) => {
    try {
      await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete user' });
    } finally {
      await prisma.$disconnect();
    }
});

module.exports = router;