import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { validateStudentId, validateGmail } from '../utils/validation';

export const register = async (req: Request, res: Response) => {
  const { studentId, fullName, email, password, role, isRetake } = req.body;

  try {
    // 1. Validation
    if (!validateGmail(email)) {
      return res.status(400).json({ message: 'Only Gmail addresses are allowed.' });
    }

    const studentIdResult = validateStudentId(studentId);
    if (!studentIdResult.isValid) {
      return res.status(400).json({ message: studentIdResult.message });
    }

    // 2. Class Rep Limit Check (Application Level)
    if (role === 'class_rep') {
      const classRepCount = await prisma.user.count({ where: { role: 'class_rep' } });
      if (classRepCount >= 2) {
        return res.status(400).json({ message: 'Maximum limit of 2 Class Representatives reached.' });
      }
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        studentId,
        fullName,
        email,
        password: hashedPassword,
        role: role || 'student',
        isRetake: isRetake || false,
      },
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, fullName: user.fullName, role: user.role }
    });
  } catch (error: any) {
    console.error('[AUTH] Registration Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'User with this Email or Student ID already exists.' });
    }
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export const getStudentByStudentId = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { studentId },
      select: { id: true, fullName: true, studentId: true },
    });
    if (!user) return res.status(404).json({ message: 'Student not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
