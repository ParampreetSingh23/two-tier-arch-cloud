const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

const prisma = new PrismaClient();

// GET /api/export/pdf?groupId=xxx
exports.exportPDF = async (req, res) => {
    try {
        const { groupId } = req.query;

        let attendanceData;
        if (groupId) {
            const students = await prisma.student.findMany({
                where: { groupId, userId: req.userId },
                select: { id: true }
            });
            const studentIds = students.map(s => s.id);
            attendanceData = await prisma.attendance.findMany({
                where: { studentId: { in: studentIds } },
                include: { student: true },
                orderBy: { date: 'desc' }
            });
        } else {
            const userStudents = await prisma.student.findMany({
                where: { userId: req.userId }, select: { id: true }
            });
            attendanceData = await prisma.attendance.findMany({
                where: { studentId: { in: userStudents.map(s => s.id) } },
                include: { student: true },
                orderBy: { date: 'desc' }
            });
        }

        const templatePath = path.join(__dirname, '../../templates/pdfTemplate.ejs');
        const html = await ejs.renderFile(templatePath, { data: attendanceData });

        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=attendance-report.pdf'
        });
        res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF export error:', err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
