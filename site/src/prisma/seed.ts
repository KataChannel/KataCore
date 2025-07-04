import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...')

  // Xóa dữ liệu cũ (theo thứ tự để tránh lỗi foreign key)
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()

  // Tạo roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Quản trị viên hệ thống',
      permissions: ['READ', 'WRITE', 'DELETE', 'MANAGE_USERS']
    }
  })

  const moderatorRole = await prisma.role.create({
    data: {
      name: 'MODERATOR',
      description: 'Điều hành viên',
      permissions: ['READ', 'WRITE', 'MODERATE']
    }
  })

  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      description: 'Người dùng thông thường',
      permissions: ['READ', 'WRITE']
    }
  })

  const guestRole = await prisma.role.create({
    data: {
      name: 'GUEST',
      description: 'Khách',
      permissions: ['READ']
    }
  })

  // Tạo users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nextjs-chat.com',
      username: 'admin',
      displayName: 'System Admin',
      password: await bcrypt.hash('admin123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff',
      isVerified: true,
      roleId: adminRole.id
    }
  })

  const developer1 = await prisma.user.create({
    data: {
      email: 'minh.dev@example.com',
      username: 'minh_dev',
      displayName: 'Minh Developer',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Minh+Dev&background=3b82f6&color=fff',
      isVerified: true,
      roleId: userRole.id
    }
  })

  const developer2 = await prisma.user.create({
    data: {
      email: 'linh.frontend@example.com',
      username: 'linh_fe',
      displayName: 'Linh Frontend',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Linh+FE&background=10b981&color=fff',
      isVerified: true,
      roleId: userRole.id
    }
  })

  const mentor = await prisma.user.create({
    data: {
      email: 'mentor@nextjs-chat.com',
      username: 'nextjs_mentor',
      displayName: 'Next.js Mentor',
      password: await bcrypt.hash('mentor123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Mentor&background=8b5cf6&color=fff',
      isVerified: true,
      roleId: moderatorRole.id
    }
  })

  const newbie = await prisma.user.create({
    data: {
      email: 'newbie@example.com',
      username: 'newbie_dev',
      displayName: 'Newbie Developer',
      password: await bcrypt.hash('newbie123', 10),
      avatar: 'https://ui-avatars.com/api/?name=Newbie&background=f59e0b&color=fff',
      isVerified: false,
      roleId: userRole.id
    }
  })

  // Tạo conversation chính về Next.js Project Structure
  const conversation = await prisma.conversation.create({
    data: {
      title: 'Next.js Project File Structure',
      description: 'Thảo luận về cấu trúc thư mục và tổ chức file trong dự án Next.js',
      isPublic: true,
      createdById: mentor.id,
      participants: {
        connect: [
          { id: mentor.id },
          { id: developer1.id },
          { id: developer2.id },
          { id: newbie.id },
          { id: admin.id }
        ]
      }
    }
  })

  // Tạo messages cho cuộc trò chuyện
  const messages = [
    {
      content: 'Chào mọi người! Hôm nay chúng ta sẽ thảo luận về cấu trúc file trong Next.js. Ai có thể chia sẻ cấu trúc folder mà bạn thường sử dụng?',
      userId: mentor.id,
      timestamp: new Date('2024-01-15T09:00:00Z')
    },
    {
      content: 'Xin chào! Mình thường dùng cấu trúc này:\n```\n/src\n  /app\n    /api\n    /components\n    /lib\n    /styles\n  /public\n```',
      userId: developer1.id,
      timestamp: new Date('2024-01-15T09:05:00Z')
    },
    {
      content: 'Mình có hơi khác một chút:\n```\n/components\n  /ui\n  /layout\n  /features\n/lib\n/hooks\n/utils\n/types\n/app\n```\nMình thích tách components theo tính năng',
      userId: developer2.id,
      timestamp: new Date('2024-01-15T09:10:00Z')
    },
    {
      content: 'Các bạn có thể giải thích tại sao lại tổ chức như vậy không? Mình mới học Next.js nên chưa hiểu lắm 😅',
      userId: newbie.id,
      timestamp: new Date('2024-01-15T09:15:00Z')
    },
    {
      content: 'Tốt! Để mình giải thích:\n\n**App Router Structure (Next.js 13+):**\n- `/app` - Chứa routes và layouts\n- `/components` - UI components tái sử dụng\n- `/lib` - Utilities, configs\n- `/hooks` - Custom React hooks\n- `/types` - TypeScript definitions',
      userId: mentor.id,
      timestamp: new Date('2024-01-15T09:20:00Z')
    },
    {
      content: 'Bổ sung thêm:\n- `/public` - Static assets (images, icons)\n- `/styles` - Global CSS, Tailwind config\n- `/middleware.ts` - Next.js middleware\n- `next.config.js` - Next.js configuration',
      userId: developer1.id,
      timestamp: new Date('2024-01-15T09:25:00Z')
    },
    {
      content: 'Còn về naming convention thì sao? Mình thấy có người dùng kebab-case, có người dùng camelCase...',
      userId: newbie.id,
      timestamp: new Date('2024-01-15T09:30:00Z')
    },
    {
      content: 'Good question! Theo best practices:\n- **Folders**: kebab-case (`user-profile`)\n- **Components**: PascalCase (`UserProfile.tsx`)\n- **Files**: kebab-case hoặc camelCase\n- **API routes**: kebab-case',
      userId: mentor.id,
      timestamp: new Date('2024-01-15T09:35:00Z')
    },
    {
      content: 'Mình hay dùng barrel exports trong folder components:\n```typescript\n// components/index.ts\nexport { Header } from "./Header"\nexport { Footer } from "./Footer"\nexport { Sidebar } from "./Sidebar"\n```\nVậy import sẽ clean hơn',
      userId: developer2.id,
      timestamp: new Date('2024-01-15T09:40:00Z')
    },
    {
      content: 'Còn ai có tip gì về absolute imports không? Mình thấy `../../../` rất khó đọc',
      userId: newbie.id,
      timestamp: new Date('2024-01-15T09:45:00Z')
    },
    {
      content: 'Setup trong `tsconfig.json`:\n```json\n{\n  "compilerOptions": {\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"],\n      "@/components/*": ["./src/components/*"],\n      "@/lib/*": ["./src/lib/*"]\n    }\n  }\n}\n```',
      userId: developer1.id,
      timestamp: new Date('2024-01-15T09:50:00Z')
    },
    {
      content: 'Perfect! Vậy là có thể import: `import { Button } from "@/components/ui"` thay vì `import { Button } from "../../../components/ui"`',
      userId: newbie.id,
      timestamp: new Date('2024-01-15T09:55:00Z')
    },
    {
      content: 'Exactly! Còn một tip nữa: dùng `_` prefix cho private folders trong app router để Next.js ignore chúng khi routing',
      userId: mentor.id,
      timestamp: new Date('2024-01-15T10:00:00Z')
    },
    {
      content: 'Cảm ơn mọi người! Mình đã hiểu hơn về project structure. Có tài liệu nào recommend để đọc thêm không?',
      userId: newbie.id,
      timestamp: new Date('2024-01-15T10:05:00Z')
    },
    {
      content: 'Recommend:\n- Next.js official docs\n- Bulletproof React guide\n- Josh Comeau\'s blog về React patterns\n- Epic React by Kent C. Dodds',
      userId: mentor.id,
      timestamp: new Date('2024-01-15T10:10:00Z')
    }
  ]

  // Tạo từng message
  for (const msg of messages) {
    await prisma.message.create({
      data: {
        content: msg.content,
        conversationId: conversation.id,
        userId: msg.userId,
        createdAt: msg.timestamp
      }
    })
  }

  // Tạo thêm một conversation khác
  const generalConversation = await prisma.conversation.create({
    data: {
      title: 'General Discussion',
      description: 'Thảo luận chung về development',
      isPublic: true,
      createdById: admin.id,
      participants: {
        connect: [
          { id: admin.id },
          { id: developer1.id },
          { id: developer2.id }
        ]
      }
    }
  })

  await prisma.message.create({
    data: {
      content: 'Chào mọi người! Đây là kênh thảo luận chung. Hãy chia sẻ những gì bạn đang học nhé!',
      conversationId: generalConversation.id,
      userId: admin.id
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
📊 Dữ liệu đã tạo:
- ${await prisma.role.count()} roles
- ${await prisma.user.count()} users  
- ${await prisma.conversation.count()} conversations
- ${await prisma.message.count()} messages

👥 Tài khoản test:
- Admin: admin@nextjs-chat.com / admin123
- Mentor: mentor@nextjs-chat.com / mentor123  
- Dev1: minh.dev@example.com / password123
- Dev2: linh.frontend@example.com / password123
- Newbie: newbie@example.com / newbie123
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })