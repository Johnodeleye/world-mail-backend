const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/stats', async (req, res) => {
    try {
      const [sentCount, usersCount, trashCount] = await Promise.all([
        prisma.email.count({ where: { status: 'sent' }}),
        prisma.user.count(),
        prisma.email.count({ where: { status: 'trash' }})
      ]);
      
      res.json({ sent: sentCount, users: usersCount, trash: trashCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    } finally {
      await prisma.$disconnect();
    }
});

module.exports = router;