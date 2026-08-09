import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import cloudinary from '../config/cloudinary';
// streamifier has no built-in types; use require to avoid TS compilation errors
// @ts-ignore
const streamifier: any = require('streamifier');
import nodemailer from 'nodemailer';

/**
 * Assignment Submission Controller
 */

export const uploadSubmission = async (req: AuthRequest, res: Response) => {
  const { groupId } = req.body;
  const userId = req.user?.id;
  const file = req.file;

  if (!userId || !file || !groupId) {
    return res.status(400).json({ message: 'Missing required fields (groupId or file)' });
  }

  try {
    // 1. Verify membership and leadership
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { leader: true, courseUnit: true },
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = await prisma.groupMembership.findFirst({
      where: { groupId, userId },
    });

    if (!isMember) return res.status(403).json({ message: 'You are not a member of this group' });

    // 2. Stream upload to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `talora/submissions/${group.courseUnit.code}`,
            resource_type: 'auto',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    const cloudinaryResult: any = await uploadToCloudinary();

    // 3. Save to database with versioning
    const lastSubmission = await prisma.submission.findFirst({
      where: { groupId },
      orderBy: { version: 'desc' },
    });

    const version = lastSubmission ? lastSubmission.version + 1 : 1;

    const submission = await prisma.submission.create({
      data: {
        groupId,
        submittedBy: userId,
        fileUrl: cloudinaryResult.secure_url,
        fileName: file.originalname,
        fileSizeBytes: BigInt(file.size),
        version,
      },
    });

    // 4. Send Email Receipt
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user && process.env.EMAIL_USER) {
      await transporter.sendMail({
        from: `"Talora University" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: `Assignment Receipt: ${group.courseUnit.code} - v${version}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #4f46e5;">Submission Received</h2>
            <p>Hello <b>${user.fullName}</b>,</p>
            <p>Your assignment for <b>${group.courseUnit.title} (${group.courseUnit.code})</b> has been successfully uploaded.</p>
            <ul>
              <li><b>File:</b> ${file.originalname}</li>
              <li><b>Version:</b> ${version}</li>
              <li><b>Timestamp:</b> ${new Date().toLocaleString()}</li>
              <li><b>Receipt ID:</b> ${submission.id}</li>
            </ul>
            <p><a href="${cloudinaryResult.secure_url}">View Submitted File</a></p>
            <hr/>
            <p style="font-size: 12px; color: #666;">This is an automated receipt for your academic records.</p>
          </div>
        `,
      });
    }

    res.status(201).json({
      message: 'Submission successful',
      submissionId: submission.id,
      version: submission.version,
      fileUrl: submission.fileUrl,
    });
  } catch (error: any) {
    console.error('[SUBMISSION] Error:', error);
    res.status(500).json({ message: 'Submission failed', error: error.message });
  }
};
