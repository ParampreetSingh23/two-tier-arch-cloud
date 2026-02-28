const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function generateEmailHTML(studentName, date, status, isUpdate = false) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const color = status === 'present' ? 'green' : status === 'absent' ? 'red' : 'orange';
    const title = isUpdate ? 'Attendance Update Notification' : 'Attendance Notification';

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px;">${title}</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your attendance has been ${isUpdate ? '<strong>updated</strong> to' : 'marked as'} <strong style="color:${color};">${statusText}</strong> for <strong>${formattedDate}</strong>.</p>
        <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin:20px 0;">
            <p style="margin:5px 0;"><strong>Student:</strong> ${studentName}</p>
            <p style="margin:5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin:5px 0;"><strong>Status:</strong> ${statusText}</p>
        </div>
        <p>If you believe there is an error, please contact the administration office.</p>
        <p style="margin-top:30px;">Regards,<br>Student Attendance System</p>
    </div>`;
}

exports.sendAttendanceNotification = async (email, studentName, date, status) => {
    try {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Attendance Marked: ${statusText} on ${formattedDate}`,
            html: generateEmailHTML(studentName, date, status, false)
        });
    } catch (err) {
        console.error('Email send error:', err.message);
    }
};

exports.sendAttendanceUpdateNotification = async (email, studentName, date, status) => {
    try {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Attendance Updated: ${statusText} on ${formattedDate}`,
            html: generateEmailHTML(studentName, date, status, true)
        });
    } catch (err) {
        console.error('Email update send error:', err.message);
    }
};
