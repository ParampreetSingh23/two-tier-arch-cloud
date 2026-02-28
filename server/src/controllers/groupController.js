const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/groups
exports.getGroups = async (req, res) => {
    try {
        const groups = await prisma.group.findMany({
            where: { userId: req.userId },
            orderBy: { name: 'asc' },
            include: { _count: { select: { students: true } } }
        });

        const result = groups.map(g => ({
            ...g,
            studentCount: g._count.students,
            _count: undefined
        }));

        res.json(result);
    } catch (err) {
        console.error('Get groups error:', err);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
};

// POST /api/groups
exports.createGroup = async (req, res) => {
    try {
        const { name, description, schedule } = req.body;
        if (!name) return res.status(400).json({ error: 'Group name is required' });

        const group = await prisma.group.create({
            data: {
                name,
                description: description || null,
                schedule: schedule
                    ? (Array.isArray(schedule) ? schedule : [schedule])
                    : [],
                userId: req.userId
            }
        });
        res.status(201).json(group);
    } catch (err) {
        console.error('Create group error:', err);
        res.status(500).json({ error: 'Failed to create group' });
    }
};

// GET /api/groups/:id
exports.getGroupById = async (req, res) => {
    try {
        const group = await prisma.group.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: {
                students: { orderBy: { name: 'asc' } }
            }
        });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.json(group);
    } catch (err) {
        console.error('Get group error:', err);
        res.status(500).json({ error: 'Failed to fetch group' });
    }
};

// DELETE /api/groups/:id
exports.deleteGroup = async (req, res) => {
    try {
        const group = await prisma.group.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        await prisma.group.delete({ where: { id: req.params.id } });
        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        console.error('Delete group error:', err);
        res.status(500).json({ error: 'Failed to delete group' });
    }
};
