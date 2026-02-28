const { PrismaClient } = require('@prisma/client');
const mailer = require('../utils/mailer');

const prisma = new PrismaClient();

// GET /api/attendance/mark?groupId=xxx
exports.getMarkAttendancePage = async (req, res) => {
    try {
        const { groupId } = req.query;
        if (!groupId) return res.status(400).json({ error: 'groupId is required' });

        const group = await prisma.group.findFirst({ where: { id: groupId, userId: req.userId } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const students = await prisma.student.findMany({
            where: { groupId },
            orderBy: { name: 'asc' }
        });

        res.json({ group, students, date: new Date().toISOString().split('T')[0] });
    } catch (err) {
        console.error('Get attendance page error:', err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};

// POST /api/attendance/mark
exports.markAttendance = async (req, res) => {
    try {
        const { date, markedBy, attendanceData } = req.body;
        const parsedData = typeof attendanceData === 'string'
            ? JSON.parse(attendanceData)
            : attendanceData;

        if (!date || !markedBy || !parsedData || !Array.isArray(parsedData)) {
            return res.status(400).json({ error: 'Invalid attendance data' });
        }

        const emailPromises = [];

        for (const record of parsedData) {
            const { studentId, status, notes } = record;

            await prisma.attendance.upsert({
                where: {
                    studentId_date: {
                        studentId,
                        date: new Date(date)
                    }
                },
                update: { status, notes: notes || '', markedBy },
                create: {
                    studentId,
                    date: new Date(date),
                    status,
                    notes: notes || '',
                    markedBy
                }
            });

            const student = await prisma.student.findUnique({ where: { id: studentId } });
            if (student) {
                emailPromises.push(
                    mailer.sendAttendanceNotification(student.email, student.name, date, status)
                );
            }
        }

        await Promise.allSettled(emailPromises);
        res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (err) {
        console.error('Mark attendance error:', err);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

// GET /api/attendance/view?groupId=xxx&date=xxx&studentId=xxx
exports.getAttendance = async (req, res) => {
    try {
        const { groupId, date, studentId } = req.query;
        if (!groupId) return res.status(400).json({ error: 'groupId is required' });

        const group = await prisma.group.findFirst({ where: { id: groupId, userId: req.userId } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const students = await prisma.student.findMany({
            where: { groupId },
            orderBy: { name: 'asc' }
        });
        const studentIds = students.map(s => s.id);

        const where = {
            studentId: studentId
                ? (studentIds.includes(studentId) ? studentId : '')
                : { in: studentIds }
        };

        if (date) {
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date);   end.setHours(23, 59, 59, 999);
            where.date = { gte: start, lte: end };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: { student: true },
            orderBy: { date: 'desc' }
        });

        res.json({ group, students, attendance, selectedDate: date || '', selectedStudent: studentId || '' });
    } catch (err) {
        console.error('Get attendance error:', err);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};

// PUT /api/attendance/:id
exports.updateAttendance = async (req, res) => {
    try {
        const { status, notes } = req.body;
        if (!status) return res.status(400).json({ error: 'Status is required' });

        const attendance = await prisma.attendance.update({
            where: { id: req.params.id },
            data: { status, notes },
            include: { student: true }
        });

        await mailer.sendAttendanceUpdateNotification(
            attendance.student.email, attendance.student.name, attendance.date, status
        ).catch(err => console.error('Email error:', err));

        res.json({ success: true, message: 'Attendance updated', attendance });
    } catch (err) {
        console.error('Update attendance error:', err);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
};

// DELETE /api/attendance/:id
exports.deleteAttendance = async (req, res) => {
    try {
        await prisma.attendance.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Attendance record deleted' });
    } catch (err) {
        console.error('Delete attendance error:', err);
        res.status(500).json({ error: 'Failed to delete attendance record' });
    }
};

// GET /api/attendance/stats
exports.getStats = async (req, res) => {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);

        const totalStudents = await prisma.student.count({ where: { userId: req.userId } });
        const totalGroups = await prisma.group.count({ where: { userId: req.userId } });

        const userStudentIds = await prisma.student.findMany({
            where: { userId: req.userId }, select: { id: true }
        }).then(s => s.map(x => x.id));

        const todayRecords = await prisma.attendance.groupBy({
            by: ['status'],
            where: { studentId: { in: userStudentIds }, date: { gte: today } },
            _count: { status: true }
        });

        const stats = { totalStudents, totalGroups, present: 0, absent: 0, late: 0 };
        todayRecords.forEach(r => { stats[r.status] = r._count.status; });

        res.json({ success: true, stats });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
