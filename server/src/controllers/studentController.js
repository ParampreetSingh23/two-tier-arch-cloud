const { PrismaClient } = require('@prisma/client');
const csv = require('csv-parser');
const stream = require('stream');

const prisma = new PrismaClient();

// GET /api/students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            where: { userId: req.userId },
            orderBy: { name: 'asc' },
            include: { group: { select: { id: true, name: true } } }
        });
        res.json(students);
    } catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

// GET /api/students/:id
exports.getStudentById = async (req, res) => {
    try {
        const student = await prisma.student.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: { group: { select: { id: true, name: true } } }
        });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch student' });
    }
};

// POST /api/students
exports.createStudent = async (req, res) => {
    try {
        const { rollNumber, name, email, phone, course, semester, groupId } = req.body;

        const errors = [];
        if (!groupId) errors.push('Class/Group is required');
        if (!rollNumber) errors.push('Roll number is required');
        if (!name) errors.push('Name is required');
        if (!email) errors.push('Email is required');
        if (!phone) errors.push('Phone is required');
        if (!course) errors.push('Course is required');
        if (!semester) errors.push('Semester is required');
        if (errors.length > 0) return res.status(400).json({ errors });

        const existing = await prisma.student.findUnique({ where: { rollNumber } });
        if (existing) {
            return res.status(409).json({ errors: ['A student with this roll number already exists'] });
        }

        // Verify the group belongs to this user
        const group = await prisma.group.findFirst({
            where: { id: groupId, userId: req.userId }
        });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const student = await prisma.student.create({
            data: {
                rollNumber, name, email, phone, course,
                semester: parseInt(semester),
                groupId,
                userId: req.userId
            }
        });
        res.status(201).json(student);
    } catch (err) {
        console.error('Create student error:', err);
        res.status(500).json({ error: 'Failed to create student' });
    }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
    try {
        const { rollNumber, name, email, phone, course, semester, groupId } = req.body;

        const errors = [];
        if (!rollNumber) errors.push('Roll number is required');
        if (!name) errors.push('Name is required');
        if (!email) errors.push('Email is required');
        if (!phone) errors.push('Phone is required');
        if (!course) errors.push('Course is required');
        if (!semester) errors.push('Semester is required');
        if (errors.length > 0) return res.status(400).json({ errors });

        const existing = await prisma.student.findFirst({
            where: { rollNumber, NOT: { id: req.params.id } }
        });
        if (existing) {
            return res.status(409).json({ errors: ['This roll number is already assigned to another student'] });
        }

        const student = await prisma.student.updateMany({
            where: { id: req.params.id, userId: req.userId },
            data: { rollNumber, name, email, phone, course, semester: parseInt(semester), groupId: groupId || undefined }
        });

        if (student.count === 0) return res.status(404).json({ error: 'Student not found' });

        const updated = await prisma.student.findUnique({ where: { id: req.params.id } });
        res.json(updated);
    } catch (err) {
        console.error('Update student error:', err);
        res.status(500).json({ error: 'Failed to update student' });
    }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
    try {
        const result = await prisma.student.deleteMany({
            where: { id: req.params.id, userId: req.userId }
        });
        if (result.count === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete student' });
    }
};

// POST /api/students/import
exports.importStudents = async (req, res) => {
    const { groupId } = req.body;

    if (!groupId) return res.status(400).json({ error: 'Please select a class' });
    if (!req.file) return res.status(400).json({ error: 'Please upload a CSV file' });

    const group = await prisma.group.findFirst({ where: { id: groupId, userId: req.userId } });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const results = [];
    const errors = [];
    let successCount = 0;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const row of results) {
                const norm = {};
                Object.keys(row).forEach(k => { norm[k.trim().toLowerCase()] = row[k].trim(); });

                const rollNumber = norm['roll number'] || norm['rollnumber'] || norm['roll_number'];
                const name = norm['name'] || norm['student name'] || norm['full name'];
                const email = norm['email'] || norm['email address'];
                const phone = norm['phone'] || norm['phone number'] || norm['mobile'];
                const course = norm['course'];
                const semester = norm['semester'];

                if (!rollNumber || !name || !email) {
                    errors.push(`Skipped: Missing required fields (Roll: ${rollNumber || 'Missing'}, Name: ${name || 'Missing'})`);
                    continue;
                }

                try {
                    const existing = await prisma.student.findUnique({ where: { rollNumber } });
                    if (existing) { errors.push(`Skipped ${rollNumber}: Already exists`); continue; }

                    await prisma.student.create({
                        data: {
                            rollNumber, name, email,
                            phone: phone || 'N/A',
                            course: course || 'N/A',
                            semester: parseInt(semester) || 1,
                            groupId,
                            userId: req.userId
                        }
                    });
                    successCount++;
                } catch (e) {
                    errors.push(`Error adding ${rollNumber}: ${e.message}`);
                }
            }

            res.json({
                success: true,
                imported: successCount,
                errors: errors.slice(0, 10),
                message: `Successfully imported ${successCount} student(s)`
            });
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Failed to parse CSV file' });
        });
};
