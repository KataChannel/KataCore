import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { PrismaClient } from '@prisma/client';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function seedRoles() {
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Quản trị viên hệ thống',
      permissions: ['READ', 'WRITE', 'DELETE', 'MANAGE_USERS']
    }
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: 'MODERATOR',
      description: 'Điều hành viên',
      permissions: ['READ', 'WRITE', 'MODERATE']
    }
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      description: 'Người dùng thông thường',
      permissions: ['READ', 'WRITE']
    }
  });

  const guestRole = await prisma.role.create({
    data: {
      name: 'GUEST',
      description: 'Khách',
      permissions: ['READ']
    }
  });

  return { adminRole, moderatorRole, userRole, guestRole };
}

async function seedUsers(roles: any) {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nextjs-chat.com',
      username: 'admin',
      displayName: 'System Admin',
      password: await bcrypt.hash('admin123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff',
      isVerified: true,
      roleId: roles.adminRole.id
    }
  });

  const developer1 = await prisma.user.create({
    data: {
      email: 'minh.dev@example.com',
      username: 'minh_dev',
      displayName: 'Minh Developer',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Minh+Dev&background=3b82f6&color=fff',
      isVerified: true,
      roleId: roles.userRole.id
    }
  });

  const developer2 = await prisma.user.create({
    data: {
      email: 'linh.frontend@example.com',
      username: 'linh_fe',
      displayName: 'Linh Frontend',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Linh+FE&background=10b981&color=fff',
      isVerified: true,
      roleId: roles.userRole.id
    }
  });

  const mentor = await prisma.user.create({
    data: {
      email: 'mentor@nextjs-chat.com',
      username: 'nextjs_mentor',
      displayName: 'Next.js Mentor',
      password: await bcrypt.hash('mentor123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Mentor&background=8b5cf6&color=fff',
      isVerified: true,
      roleId: roles.moderatorRole.id
    }
  });

  const newbie = await prisma.user.create({
    data: {
      email: 'newbie@example.com',
      username: 'newbie_dev',
      displayName: 'Newbie Developer',
      password: await bcrypt.hash('newbie123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Newbie&background=f59e0b&color=fff',
      isVerified: false,
      roleId: roles.userRole.id
    }
  });

  return { admin, developer1, developer2, mentor, newbie };
}

async function seedConversations(users: any) {
  const conversation = await prisma.conversation.create({
    data: {
      title: 'Next.js Project File Structure',
      description: 'Thảo luận về cấu trúc thư mục và tổ chức file trong dự án Next.js',
      isPublic: true,
      createdById: users.mentor.id,
      participants: {
        connect: [
          { id: users.mentor.id },
          { id: users.developer1.id },
          { id: users.developer2.id },
          { id: users.newbie.id },
          { id: users.admin.id }
        ]
      }
    }
  });

  const generalConversation = await prisma.conversation.create({
    data: {
      title: 'General Discussion',
      description: 'Thảo luận chung về development',
      isPublic: true,
      createdById: users.admin.id,
      participants: {
        connect: [
          { id: users.admin.id },
          { id: users.developer1.id },
          { id: users.developer2.id }
        ]
      }
    }
  });

  return { conversation, generalConversation };
}

async function seedMessages(conversation: any, users: any) {
  const messages = [
    {
      content: 'Chào mọi người! Hôm nay chúng ta sẽ thảo luận về cấu trúc file trong Next.js. Ai có thể chia sẻ cấu trúc folder mà bạn thường sử dụng?',
      userId: users.mentor.id,
      timestamp: new Date('2024-01-15T09:00:00Z')
    },
    {
      content: 'Xin chào! Mình thường dùng cấu trúc này:\n```\n/src\n  /app\n    /api\n    /components\n    /lib\n    /styles\n  /public\n```',
      userId: users.developer1.id,
      timestamp: new Date('2024-01-15T09:05:00Z')
    },
    // ... rest of messages
  ];

  for (const msg of messages) {
    await prisma.message.create({
      data: {
        content: msg.content,
        conversationId: conversation.id,
        userId: msg.userId,
        createdAt: msg.timestamp
      }
    });
  }
}

export async function GET() {
  try {
    await prisma.$transaction(async (tx) => {
      // Clear existing data
      await tx.message.deleteMany();
      await tx.conversation.deleteMany();
      await tx.user.deleteMany();
      await tx.role.deleteMany();

      // Seed data
      const roles = await seedRoles();
      const users = await seedUsers(roles);
      const conversations = await seedConversations(users);
      await seedMessages(conversations.conversation, users);
      
      // Add general message
      await tx.message.create({
        data: {
          content: 'Chào mọi người! Đây là kênh thảo luận chung. Hãy chia sẻ những gì bạn đang học nhé!',
          conversationId: conversations.generalConversation.id,
          userId: users.admin.id
        }
      });
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json({ error: 'Seeding failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
