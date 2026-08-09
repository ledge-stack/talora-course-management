import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';

/**
 * Group Management Controller
 */

// Get groups for a course
export const getGroupsByCourse = async (req: AuthRequest, res: Response) => {
  const { courseUnitId } = req.params;
  try {
    const groups = await prisma.group.findMany({
      where: { courseUnitId },
      include: {
        memberships: {
          include: { user: { select: { id: true, fullName: true, studentId: true } } }
        }
      },
      orderBy: { groupNumber: 'asc' },
    });
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
};

// Create a new group for a course unit
export const createGroup = async (req: AuthRequest, res: Response) => {
  const { courseUnitId, groupNumber, useTemplate } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if course exists
      const course = await tx.courseUnit.findUnique({ where: { id: courseUnitId } });
      if (!course) throw new Error('Course unit not found');

      // 2. Create the group
      const group = await tx.group.create({
        data: {
          courseUnitId,
          groupNumber,
          leaderId: userId,
        },
      });

      // 3. Add leader as member
      await tx.groupMembership.create({
        data: {
          groupId: group.id,
          userId,
        },
      });

      // 4. Optionally populate from default template
      if (useTemplate) {
        const template = await tx.defaultGroupTemplate.findUnique({
          where: { leaderId: userId },
          include: { members: true },
        });

        if (template && template.members.length > 0) {
          const membersToInsert = template.members
            .filter(m => m.userId !== userId) // Skip leader
            .map(m => ({
              groupId: group.id,
              userId: m.userId,
            }));

          if (membersToInsert.length + 1 > course.maxGroupSize) {
             throw new Error(`Template exceeds max group size (${course.maxGroupSize}) for this course.`);
          }

          await tx.groupMembership.createMany({
            data: membersToInsert,
          });
        }
      }

      return group;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get pending applications for groups led by the user
export const getPendingApplications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const applications = await prisma.groupApplication.findMany({
      where: {
        status: 'pending',
        group: { leaderId: userId },
      },
      include: {
        applicant: { select: { fullName: true, studentId: true, isRetake: true } },
        group: { include: { courseUnit: { select: { code: true } } } },
      },
      orderBy: { appliedAt: 'asc' },
    });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Update WhatsApp Link
export const updateWhatsAppLink = async (req: AuthRequest, res: Response) => {
  const { groupId } = req.params;
  const { whatsappLink } = req.body;
  const userId = req.user?.id;

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leaderId !== userId && req.user?.role !== 'class_rep') {
      return res.status(403).json({ message: 'Only the Group Leader or Class Rep can update this link.' });
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: { whatsappLink },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
};

// Apply to a group
export const applyToGroup = async (req: AuthRequest, res: Response) => {
  const { groupId } = req.body;
  const applicantId = req.user?.id;

  if (!applicantId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const application = await prisma.groupApplication.create({
      data: {
        groupId,
        applicantId,
        status: 'pending',
      },
    });
    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Application already exists for this group.' });
    res.status(400).json({ message: 'Application failed', error: error.message });
  }
};

// Respond to application (Approve/Reject)
export const respondToApplication = async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  const userId = req.user?.id;

  try {
    const application = await prisma.groupApplication.findUnique({
      where: { id: applicationId },
      include: { group: { include: { courseUnit: true, _count: { select: { memberships: true } } } }, applicant: true },
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.group.leaderId !== userId) return res.status(403).json({ message: 'Only the Group Leader can respond.' });

    if (status === 'approved') {
      if (application.group._count.memberships >= application.group.courseUnit.maxGroupSize) {
        return res.status(400).json({ message: 'Group is already full.' });
      }

      await prisma.$transaction([
        prisma.groupMembership.create({
          data: {
            groupId: application.groupId,
            userId: application.applicantId,
            isRetake: application.applicant.isRetake,
          },
        }),
        prisma.groupApplication.update({
          where: { id: applicationId },
          data: { status: 'approved', respondedAt: new Date() },
        }),
      ]);
    } else {
      await prisma.groupApplication.update({
        where: { id: applicationId },
        data: { status: 'rejected', respondedAt: new Date() },
      });
    }

    res.json({ message: `Application ${status}` });
  } catch (error: any) {
    res.status(400).json({ message: 'Action failed', error: error.message });
  }
};

// Direct add member (Leader Only)
export const directAddMember = async (req: AuthRequest, res: Response) => {
  const { groupId, targetStudentId } = req.body;
  const leaderId = req.user?.id;

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { courseUnit: true, _count: { select: { memberships: true } } },
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.leaderId !== leaderId) return res.status(403).json({ message: 'Only the Group Leader can add members directly.' });

    if (group._count.memberships >= group.courseUnit.maxGroupSize) {
      return res.status(400).json({ message: 'Group is already full.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { studentId: targetStudentId } });
    if (!targetUser) return res.status(404).json({ message: 'Student not found.' });

    const membership = await prisma.groupMembership.create({
      data: {
        groupId,
        userId: targetUser.id,
        isRetake: targetUser.isRetake,
      },
    });

    res.status(201).json(membership);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Student is already a member of this group.' });
    res.status(400).json({ message: 'Failed to add member', error: error.message });
  }
};

// Merge Groups (Class Rep Override)
export const mergeGroups = async (req: AuthRequest, res: Response) => {
  const { sourceGroupId, targetGroupId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sourceGroup = await tx.group.findUnique({
        where: { id: sourceGroupId },
        include: { memberships: true },
      });
      const targetGroup = await tx.group.findUnique({
        where: { id: targetGroupId },
        include: { courseUnit: true, _count: { select: { memberships: true } } },
      });

      if (!sourceGroup || !targetGroup) throw new Error('One or both groups not found.');
      if (sourceGroup.courseUnitId !== targetGroup.courseUnitId) throw new Error('Groups must belong to the same course unit.');

      const totalMembers = sourceGroup.memberships.length + targetGroup._count.memberships;
      if (totalMembers > targetGroup.courseUnit.maxGroupSize) {
        throw new Error(`Merged group would exceed max size (${targetGroup.courseUnit.maxGroupSize}).`);
      }

      // Move members
      for (const member of sourceGroup.memberships) {
        await tx.groupMembership.upsert({
          where: { groupId_userId: { groupId: targetGroupId, userId: member.userId } },
          update: {},
          create: {
            groupId: targetGroupId,
            userId: member.userId,
            isRetake: member.isRetake,
          },
        });
      }

      // Delete source group
      await tx.group.delete({ where: { id: sourceGroupId } });

      return { message: 'Groups merged successfully', targetGroupId };
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: 'Merge failed', error: error.message });
  }
};

// Get default template
export const getDefaultTemplate = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const template = await prisma.defaultGroupTemplate.findUnique({
      where: { leaderId: userId },
      include: {
        members: true, // members is DefaultTemplateMember[]
      },
    });

    if (!template) {
       return res.json({ templateName: "My Default Team", members: [] });
    }

    // Fetch member details
    const memberDetails = await prisma.user.findMany({
      where: { id: { in: template.members.map(m => m.userId) } },
      select: { id: true, fullName: true, studentId: true },
    });

    res.json({
      ...template,
      members: memberDetails.map(m => ({ userId: m.id, fullName: m.fullName, studentId: m.studentId })),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching template', error: error.message });
  }
};

// Default Template Management
export const manageDefaultTemplate = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { templateName, memberIds } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const template = await prisma.defaultGroupTemplate.upsert({
      where: { leaderId: userId },
      update: { templateName },
      create: { leaderId: userId, templateName },
    });

    if (memberIds) {
      await prisma.defaultTemplateMember.deleteMany({ where: { templateId: template.id } });
      await prisma.defaultTemplateMember.createMany({
        data: memberIds.map((id: string) => ({ templateId: template.id, userId: id })),
      });
    }

    const updatedTemplate = await prisma.defaultGroupTemplate.findUnique({
      where: { id: template.id },
      include: { members: { include: { template: true } } }, // Note: Adjusting include based on schema
    });

    res.json(updatedTemplate);
  } catch (error: any) {
    res.status(400).json({ message: 'Template management failed', error: error.message });
  }
};
