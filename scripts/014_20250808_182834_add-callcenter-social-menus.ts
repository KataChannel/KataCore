#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Icon mapping
const iconMap = {
  ChartBarIcon: 'chart-bar',
  UsersIcon: 'users',
  BellIcon: 'bell',
  ComputerDesktopIcon: 'computer-desktop',
  UserIcon: 'user',
  PhoneIcon: 'phone',
  ChatBubbleLeftRightIcon: 'chat-bubble-left-right',
};

async function addCallCenterAndSocialMenus() {
  console.log('🔄 Adding Call Center and Social Facebook menus...');

  try {
    // 1. Add Call Center submenu to CRM
    const crmParent = await prisma.menu_items.findFirst({
      where: { 
        title: 'CRM',
        parentId: null 
      }
    });

    if (crmParent) {
      // Check if Call Center already exists
      const existingCallCenter = await prisma.menu_items.findFirst({
        where: {
          title: 'Call Center',
          parentId: crmParent.id
        }
      });

      if (!existingCallCenter) {
        const callCenterMenu = await prisma.menu_items.create({
          data: {
            title: 'Call Center',
            titleVi: 'Trung tâm cuộc gọi',
            path: '/admin/crm/callcenter',
            icon: iconMap.PhoneIcon,
            permission: 'read:call_center',
            sortOrder: 5, // After campaigns
            parentId: crmParent.id,
            isActive: true,
          },
        });

        console.log('✅ Added Call Center menu to CRM');

        // Add permissions for all roles
        const roles = await prisma.roles.findMany();
        for (const role of roles) {
          let canAccess = false;
          let canView = false;

          // Super Admin and Admin get full access
          if (role.name === 'Super Administrator' || role.level >= 8) {
            canAccess = true;
            canView = true;
          }
          // Managers and HR get access to call center
          else if (role.level >= 6 || role.name.includes('Manager') || role.name.includes('HR')) {
            canAccess = true;
            canView = true;
          }
          // Sales roles get access
          else if (role.name.includes('Sales')) {
            canAccess = true;
            canView = true;
          }
          // Other roles limited access
          else if (role.level >= 3) {
            canAccess = false;
            canView = true;
          }

          await prisma.role_menu_items.create({
            data: {
              roleId: role.id,
              menuItemId: callCenterMenu.id,
              canView: canView,
              canAccess: canAccess,
            },
          });
        }
      } else {
        console.log('📋 Call Center menu already exists');
      }
    }

    // 2. Add Social Media parent menu if not exists
    let socialParent = await prisma.menu_items.findFirst({
      where: { 
        OR: [
          { title: 'Social Media' },
          { title: 'Digital Marketing' }
        ],
        parentId: null 
      }
    });

    if (!socialParent) {
      // Find Digital Marketing menu to add social as submenu
      const marketingParent = await prisma.menu_items.findFirst({
        where: { 
          title: 'Digital Marketing',
          parentId: null 
        }
      });

      if (marketingParent) {
        // Add Social Media as submenu under Digital Marketing
        const existingSocialSubmenu = await prisma.menu_items.findFirst({
          where: {
            title: 'Social Media',
            parentId: marketingParent.id
          }
        });

        if (!existingSocialSubmenu) {
          // Check if there's already a social media submenu
          const existingSocial = await prisma.menu_items.findFirst({
            where: {
              OR: [
                { path: '/marketing/social-media' },
                { titleVi: 'Mạng xã hội' }
              ],
              parentId: marketingParent.id
            }
          });

          if (existingSocial) {
            socialParent = existingSocial;
            console.log('📋 Found existing Social Media submenu');
          }
        }
      }

      // If still no social parent, create standalone Social Media menu
      if (!socialParent) {
        socialParent = await prisma.menu_items.create({
          data: {
            title: 'Social Media',
            titleVi: 'Mạng xã hội',
            path: '/admin/social',
            icon: iconMap.UserIcon,
            permission: 'read:social',
            sortOrder: 16, // After e-commerce
            isActive: true,
          },
        });
        console.log('✅ Created standalone Social Media menu');

        // Add permissions for all roles
        const roles = await prisma.roles.findMany();
        for (const role of roles) {
          let canAccess = false;
          let canView = false;

          // Super Admin and Admin get full access
          if (role.name === 'Super Administrator' || role.level >= 8) {
            canAccess = true;
            canView = true;
          }
          // Marketing managers and social media roles
          else if (role.level >= 6 || role.name.includes('Marketing')) {
            canAccess = true;
            canView = true;
          }
          // Other roles limited access
          else if (role.level >= 3) {
            canAccess = false;
            canView = true;
          }

          await prisma.role_menu_items.create({
            data: {
              roleId: role.id,
              menuItemId: socialParent.id,
              canView: canView,
              canAccess: canAccess,
            },
          });
        }
      }
    } else {
      console.log('📋 Social Media parent menu already exists');
    }

    // 3. Add Facebook submenu to Social Media
    if (socialParent) {
      const existingFacebook = await prisma.menu_items.findFirst({
        where: {
          title: 'Facebook',
          parentId: socialParent.id
        }
      });

      if (!existingFacebook) {
        const facebookMenu = await prisma.menu_items.create({
          data: {
            title: 'Facebook',
            titleVi: 'Facebook',
            path: '/admin/social/facebook',
            icon: iconMap.ComputerDesktopIcon,
            permission: 'manage:social',
            sortOrder: 2, // After dashboard
            parentId: socialParent.id,
            isActive: true,
          },
        });

        console.log('✅ Added Facebook menu to Social Media');

        // Add permissions for all roles
        const roles = await prisma.roles.findMany();
        for (const role of roles) {
          let canAccess = false;
          let canView = false;

          // Super Admin and Admin get full access
          if (role.name === 'Super Administrator' || role.level >= 8) {
            canAccess = true;
            canView = true;
          }
          // Marketing managers get access
          else if (role.level >= 6 || role.name.includes('Marketing')) {
            canAccess = true;
            canView = true;
          }
          // Social media specialists
          else if (role.name.includes('Social')) {
            canAccess = true;
            canView = true;
          }
          // Other roles view only
          else if (role.level >= 3) {
            canAccess = false;
            canView = true;
          }

          await prisma.role_menu_items.create({
            data: {
              roleId: role.id,
              menuItemId: facebookMenu.id,
              canView: canView,
              canAccess: canAccess,
            },
          });
        }
      } else {
        console.log('📋 Facebook menu already exists');
      }

      // 4. Also add other social media platforms if they don't exist
      const socialPlatforms = [
        {
          title: 'Instagram',
          titleVi: 'Instagram',
          path: '/admin/social/instagram',
          sortOrder: 3,
        },
        {
          title: 'Twitter',
          titleVi: 'Twitter',
          path: '/admin/social/twitter',
          sortOrder: 4,
        },
        {
          title: 'LinkedIn',
          titleVi: 'LinkedIn',
          path: '/admin/social/linkedin',
          sortOrder: 5,
        },
        {
          title: 'TikTok',
          titleVi: 'TikTok',
          path: '/admin/social/tiktok',
          sortOrder: 6,
        }
      ];

      for (const platform of socialPlatforms) {
        const existing = await prisma.menu_items.findFirst({
          where: {
            title: platform.title,
            parentId: socialParent.id
          }
        });

        if (!existing) {
          const platformMenu = await prisma.menu_items.create({
            data: {
              title: platform.title,
              titleVi: platform.titleVi,
              path: platform.path,
              icon: iconMap.ComputerDesktopIcon,
              permission: 'manage:social',
              sortOrder: platform.sortOrder,
              parentId: socialParent.id,
              isActive: true,
            },
          });

          console.log(`✅ Added ${platform.title} menu`);

          // Add permissions for all roles (same as Facebook)
          const roles = await prisma.roles.findMany();
          for (const role of roles) {
            let canAccess = false;
            let canView = false;

            if (role.name === 'Super Administrator' || role.level >= 8) {
              canAccess = true;
              canView = true;
            }
            else if (role.level >= 6 || role.name.includes('Marketing')) {
              canAccess = true;
              canView = true;
            }
            else if (role.name.includes('Social')) {
              canAccess = true;
              canView = true;
            }
            else if (role.level >= 3) {
              canAccess = false;
              canView = true;
            }

            await prisma.role_menu_items.create({
              data: {
                roleId: role.id,
                menuItemId: platformMenu.id,
                canView: canView,
                canAccess: canAccess,
              },
            });
          }
        }
      }
    }

    // Summary
    const totalMenus = await prisma.menu_items.count();
    const totalPermissions = await prisma.role_menu_items.count();
    
    // Check CRM menus
    const crmMenuCount = await prisma.menu_items.count({
      where: {
        OR: [
          { parentId: crmParent?.id },
          { id: crmParent?.id }
        ]
      }
    });

    // Check Social menus
    const socialMenuCount = await prisma.menu_items.count({
      where: {
        OR: [
          { parentId: socialParent?.id },
          { id: socialParent?.id }
        ]
      }
    });

    console.log('\n✅ Call Center and Social menus update completed!');
    console.log('======================================');
    console.log(`📊 Total menu items: ${totalMenus}`);
    console.log(`🔐 Total permissions: ${totalPermissions}`);
    console.log(`📂 CRM menu items: ${crmMenuCount}`);
    console.log(`📱 Social menu items: ${socialMenuCount}`);

    console.log('\n📋 Added/Updated menus:');
    console.log('CRM/');
    console.log('└── Call Center (/admin/crm/callcenter) - Permission: read:call_center');
    console.log('');
    console.log('Social Media/');
    console.log('├── Facebook (/admin/social/facebook) - Permission: manage:social');
    console.log('├── Instagram (/admin/social/instagram) - Permission: manage:social');
    console.log('├── Twitter (/admin/social/twitter) - Permission: manage:social');
    console.log('├── LinkedIn (/admin/social/linkedin) - Permission: manage:social');
    console.log('└── TikTok (/admin/social/tiktok) - Permission: manage:social');

    console.log('\n🎯 Permissions Summary:');
    console.log('- Super Administrator: Full access to all');
    console.log('- Administrator: Full access to all');
    console.log('- Managers/Marketing: Full access to social media');
    console.log('- HR/Sales: Access to call center');
    console.log('- Employees: View access only');

  } catch (error) {
    console.error('❌ Error adding Call Center and Social menus:', error);
    throw error;
  }
}

// Execute the function
addCallCenterAndSocialMenus()
  .then(() => {
    console.log('\n🎉 Call Center and Social menus added successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
