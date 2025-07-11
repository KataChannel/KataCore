import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Initialize Prisma client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  const globalWithPrisma = globalThis as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export async function GET() {
  try {
    console.log('Starting HRM data seeding...');
    return NextResponse.json({ message: 'GET endpoint working' });
  } catch (error) {
    console.error('Error seeding HRM data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('Starting HRM data seeding...');

    // Clear existing HRM data
    await prisma.performanceReview.deleteMany();
    await prisma.payroll.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.position.deleteMany();
    await prisma.department.deleteMany();

    // Clear existing users and roles for fresh start
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    console.log('Existing data cleared');

    // Create Roles
    const hrManagerRole = await prisma.role.create({
      data: {
        name: 'HR_MANAGER',
        description: 'HR Manager with full access to HRM system',
        permissions: JSON.stringify([
          'READ',
          'WRITE',
          'DELETE',
          'READ_EMPLOYEES',
          'WRITE_EMPLOYEES',
          'DELETE_EMPLOYEES',
          'READ_DEPARTMENTS',
          'WRITE_DEPARTMENTS',
          'DELETE_DEPARTMENTS',
          'READ_ROLES',
          'WRITE_ROLES',
          'DELETE_ROLES',
          'MANAGE_EMPLOYEES',
          'MANAGE_PAYROLL',
          'APPROVE_LEAVE',
        ]),
      },
    });

    const departmentManagerRole = await prisma.role.create({
      data: {
        name: 'DEPARTMENT_MANAGER',
        description: 'Department Manager with team management access',
        permissions: JSON.stringify([
          'READ',
          'WRITE',
          'READ_EMPLOYEES',
          'WRITE_EMPLOYEES',
          'READ_DEPARTMENTS',
          'MANAGE_TEAM',
          'APPROVE_LEAVE',
        ]),
      },
    });

    const employeeRole = await prisma.role.create({
      data: {
        name: 'EMPLOYEE',
        description: 'Regular employee with basic access',
        permissions: JSON.stringify([
          'READ',
          'READ_EMPLOYEES',
          'READ_DEPARTMENTS',
        ]),
      },
    });

    console.log('Roles created');

    // Create Users
    const hrManager = await prisma.user.create({
      data: {
        email: 'hr.manager@company.com',
        username: 'hr_manager',
        phone: '+84901234567',
        displayName: 'HR Manager',
        password: await bcrypt.hash('hr123456', 10),
        avatar:
          'https://ui-avatars.com/api/?name=HR+Manager&background=e11d48&color=fff',
        isVerified: true,
        isActive: true,
        roleId: hrManagerRole.id,
      },
    });

    const itManager = await prisma.user.create({
      data: {
        email: 'it.manager@company.com',
        username: 'it_manager',
        phone: '+84901234568',
        displayName: 'IT Manager',
        password: await bcrypt.hash('it123456', 10),
        avatar:
          'https://ui-avatars.com/api/?name=IT+Manager&background=3b82f6&color=fff',
        isVerified: true,
        isActive: true,
        roleId: departmentManagerRole.id,
      },
    });

    const salesManager = await prisma.user.create({
      data: {
        email: 'sales.manager@company.com',
        username: 'sales_manager',
        phone: '+84901234569',
        displayName: 'Sales Manager',
        password: await bcrypt.hash('sales123456', 10),
        avatar:
          'https://ui-avatars.com/api/?name=Sales+Manager&background=10b981&color=fff',
        isVerified: true,
        isActive: true,
        roleId: departmentManagerRole.id,
      },
    });

    const developer1 = await prisma.user.create({
      data: {
        email: 'john.doe@company.com',
        username: 'john_doe',
        phone: '+84901234570',
        displayName: 'John Doe',
        password: await bcrypt.hash('john123456', 10),
        avatar:
          'https://ui-avatars.com/api/?name=John+Doe&background=8b5cf6&color=fff',
        isVerified: true,
        isActive: true,
        roleId: employeeRole.id,
      },
    });

    const developer2 = await prisma.user.create({
      data: {
        email: 'jane.smith@company.com',
        username: 'jane_smith',
        phone: '+84901234571',
        displayName: 'Jane Smith',
        password: await bcrypt.hash('jane123456', 10),
        avatar:
          'https://ui-avatars.com/api/?name=Jane+Smith&background=f59e0b&color=fff',
        isVerified: true,
        isActive: true,
        roleId: employeeRole.id,
      },
    });

    const salesRep1 = await prisma.user.create({
      data: {
        email: 'mike.wilson@company.com',
        username: 'mike_wilson',
        phone: '+84901234572',
        displayName: 'Mike Wilson',
        password: await bcrypt.hash('mike123456', 10),
        avatar:
          'https://ui-avatars.com/api/?name=Mike+Wilson&background=06b6d4&color=fff',
        isVerified: true,
        isActive: true,
        roleId: employeeRole.id,
      },
    });

    const salesRep2 = await prisma.user.create({
      data: {
        email: 'sarah.jones@company.com',
        username: 'sarah_jones',
        phone: '+84901234573',
        displayName: 'Sarah Jones',
        password: await bcrypt.hash('sarah123456', 10),
        avatar:
          'https://ui-avatars.com/api/?name=Sarah+Jones&background=ec4899&color=fff',
        isVerified: true,
        isActive: true,
        roleId: employeeRole.id,
      },
    });

    console.log('Users created');

    // Create Departments
    const hrDepartment = await prisma.department.create({
      data: {
        name: 'Human Resources',
        description: 'Manages employee relations, recruitment, and HR policies',
        code: 'HR',
        budget: 500000,
        location: 'Floor 2, Building A',
        phone: '+84123456789',
        email: 'hr@company.com',
        managerId: hrManager.id,
        isActive: true,
      },
    });

    const itDepartment = await prisma.department.create({
      data: {
        name: 'Information Technology',
        description:
          'Manages IT infrastructure, software development, and technical support',
        code: 'IT',
        budget: 1000000,
        location: 'Floor 3, Building A',
        phone: '+84123456790',
        email: 'it@company.com',
        managerId: itManager.id,
        isActive: true,
      },
    });

    const salesDepartment = await prisma.department.create({
      data: {
        name: 'Sales & Marketing',
        description:
          'Manages sales operations, customer relations, and marketing campaigns',
        code: 'SALES',
        budget: 800000,
        location: 'Floor 1, Building A',
        phone: '+84123456791',
        email: 'sales@company.com',
        managerId: salesManager.id,
        isActive: true,
      },
    });

    console.log('Departments created');

    // Create Positions
    const hrManagerPosition = await prisma.position.create({
      data: {
        title: 'HR Manager',
        description: 'Oversees all HR operations and employee management',
        level: 5,
        minSalary: 25000000,
        maxSalary: 35000000,
        requirements:
          'Bachelor degree in HR or related field, 5+ years experience',
        departmentId: hrDepartment.id,
        isActive: true,
      },
    });

    const itManagerPosition = await prisma.position.create({
      data: {
        title: 'IT Manager',
        description: 'Leads IT department and manages technical projects',
        level: 5,
        minSalary: 30000000,
        maxSalary: 40000000,
        requirements:
          'Bachelor degree in IT or related field, 5+ years experience',
        departmentId: itDepartment.id,
        isActive: true,
      },
    });

    const salesManagerPosition = await prisma.position.create({
      data: {
        title: 'Sales Manager',
        description: 'Manages sales team and develops sales strategies',
        level: 5,
        minSalary: 28000000,
        maxSalary: 38000000,
        requirements:
          'Bachelor degree in Business or related field, 5+ years experience',
        departmentId: salesDepartment.id,
        isActive: true,
      },
    });

    const seniorDeveloperPosition = await prisma.position.create({
      data: {
        title: 'Senior Software Developer',
        description: 'Develops and maintains software applications',
        level: 4,
        minSalary: 20000000,
        maxSalary: 30000000,
        requirements:
          'Bachelor degree in Computer Science, 3+ years experience',
        departmentId: itDepartment.id,
        isActive: true,
      },
    });

    const softwareDeveloperPosition = await prisma.position.create({
      data: {
        title: 'Software Developer',
        description: 'Develops and maintains software applications',
        level: 3,
        minSalary: 15000000,
        maxSalary: 25000000,
        requirements:
          'Bachelor degree in Computer Science, 1+ years experience',
        departmentId: itDepartment.id,
        isActive: true,
      },
    });

    const salesRepPosition = await prisma.position.create({
      data: {
        title: 'Sales Representative',
        description: 'Manages client relationships and sales activities',
        level: 2,
        minSalary: 12000000,
        maxSalary: 20000000,
        requirements: 'Bachelor degree in Business or related field',
        departmentId: salesDepartment.id,
        isActive: true,
      },
    });

    console.log('Positions created');

    // Create Employees
    const hrManagerEmployee = await prisma.employee.create({
      data: {
        employeeId: 'EMP001',
        firstName: 'HR',
        lastName: 'Manager',
        fullName: 'HR Manager',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'Female',
        nationality: 'Vietnamese',
        idNumber: '123456789',
        address: '123 Main Street, Ho Chi Minh City',
        phone: '+84901234567',
        emergencyContact: '+84901234500',
        hireDate: new Date('2020-01-15'),
        salary: 30000000,
        status: 'ACTIVE' as const,
        contractType: 'FULL_TIME' as const,
        notes: 'Experienced HR professional',
        userId: hrManager.id,
        departmentId: hrDepartment.id,
        positionId: hrManagerPosition.id,
      },
    });

    const itManagerEmployee = await prisma.employee.create({
      data: {
        employeeId: 'EMP002',
        firstName: 'IT',
        lastName: 'Manager',
        fullName: 'IT Manager',
        dateOfBirth: new Date('1982-07-22'),
        gender: 'Male',
        nationality: 'Vietnamese',
        idNumber: '123456790',
        address: '456 Tech Street, Ho Chi Minh City',
        phone: '+84901234568',
        emergencyContact: '+84901234501',
        hireDate: new Date('2019-08-10'),
        salary: 35000000,
        status: 'ACTIVE' as const,
        contractType: 'FULL_TIME' as const,
        notes: 'Strong technical leadership',
        userId: itManager.id,
        departmentId: itDepartment.id,
        positionId: itManagerPosition.id,
      },
    });

    const salesManagerEmployee = await prisma.employee.create({
      data: {
        employeeId: 'EMP003',
        firstName: 'Sales',
        lastName: 'Manager',
        fullName: 'Sales Manager',
        dateOfBirth: new Date('1988-11-05'),
        gender: 'Male',
        nationality: 'Vietnamese',
        idNumber: '123456791',
        address: '789 Business Ave, Ho Chi Minh City',
        phone: '+84901234569',
        emergencyContact: '+84901234502',
        hireDate: new Date('2021-03-01'),
        salary: 32000000,
        status: 'ACTIVE' as const,
        contractType: 'FULL_TIME' as const,
        notes: 'Excellent sales track record',
        userId: salesManager.id,
        departmentId: salesDepartment.id,
        positionId: salesManagerPosition.id,
      },
    });

    const johnDoeEmployee = await prisma.employee.create({
      data: {
        employeeId: 'EMP004',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        dateOfBirth: new Date('1990-05-12'),
        gender: 'Male',
        nationality: 'Vietnamese',
        idNumber: '123456792',
        address: '101 Developer Lane, Ho Chi Minh City',
        phone: '+84901234570',
        emergencyContact: '+84901234503',
        hireDate: new Date('2022-06-15'),
        salary: 22000000,
        status: 'ACTIVE' as const,
        contractType: 'FULL_TIME' as const,
        notes: 'Skilled React developer',
        userId: developer1.id,
        departmentId: itDepartment.id,
        positionId: seniorDeveloperPosition.id,
      },
    });

    const janeSmithEmployee = await prisma.employee.create({
      data: {
        employeeId: 'EMP005',
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
        dateOfBirth: new Date('1992-09-28'),
        gender: 'Female',
        nationality: 'Vietnamese',
        idNumber: '123456793',
        address: '202 Code Street, Ho Chi Minh City',
        phone: '+84901234571',
        emergencyContact: '+84901234504',
        hireDate: new Date('2023-01-20'),
        salary: 18000000,
        status: 'ACTIVE' as const,
        contractType: 'FULL_TIME' as const,
        notes: 'Full-stack developer',
        userId: developer2.id,
        departmentId: itDepartment.id,
        positionId: softwareDeveloperPosition.id,
      },
    });

    const mikeWilsonEmployee = await prisma.employee.create({
      data: {
        employeeId: 'EMP006',
        firstName: 'Mike',
        lastName: 'Wilson',
        fullName: 'Mike Wilson',
        dateOfBirth: new Date('1987-12-14'),
        gender: 'Male',
        nationality: 'Vietnamese',
        idNumber: '123456794',
        address: '303 Sales Plaza, Ho Chi Minh City',
        phone: '+84901234572',
        emergencyContact: '+84901234505',
        hireDate: new Date('2021-09-10'),
        salary: 16000000,
        status: 'ACTIVE' as const,
        contractType: 'FULL_TIME' as const,
        notes: 'Top sales performer',
        userId: salesRep1.id,
        departmentId: salesDepartment.id,
        positionId: salesRepPosition.id,
      },
    });

    const sarahJonesEmployee = await prisma.employee.create({
      data: {
        employeeId: 'EMP007',
        firstName: 'Sarah',
        lastName: 'Jones',
        fullName: 'Sarah Jones',
        dateOfBirth: new Date('1994-04-03'),
        gender: 'Female',
        nationality: 'Vietnamese',
        idNumber: '123456795',
        address: '404 Client Road, Ho Chi Minh City',
        phone: '+84901234573',
        emergencyContact: '+84901234506',
        hireDate: new Date('2022-11-15'),
        salary: 14000000,
        status: 'ACTIVE' as const,
        contractType: 'FULL_TIME' as const,
        notes: 'Excellent customer service',
        userId: salesRep2.id,
        departmentId: salesDepartment.id,
        positionId: salesRepPosition.id,
      },
    });

    console.log('Employees created');

    // Create Attendance Records (last 30 days)
    const employees = [
      johnDoeEmployee,
      janeSmithEmployee,
      mikeWilsonEmployee,
      sarahJonesEmployee,
    ];

    const users = [developer1, developer2, salesRep1, salesRep2];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (let j = 0; j < employees.length; j++) {
        const employee = employees[j];
        const user = users[j];

        const timeIn = new Date(date);
        timeIn.setHours(
          8 + Math.floor(Math.random() * 2),
          Math.floor(Math.random() * 60)
        );

        const timeOut = new Date(date);
        timeOut.setHours(
          17 + Math.floor(Math.random() * 2),
          Math.floor(Math.random() * 60)
        );

        const breakStart = new Date(date);
        breakStart.setHours(12, 0);

        const breakEnd = new Date(date);
        breakEnd.setHours(13, 0);

        const totalHours =
          (timeOut.getTime() -
            timeIn.getTime() -
            (breakEnd.getTime() - breakStart.getTime())) /
          (1000 * 60 * 60);

        await prisma.attendance.create({
          data: {
            date: date,
            timeIn: timeIn,
            timeOut: timeOut,
            breakStart: breakStart,
            breakEnd: breakEnd,
            totalHours: Math.round(totalHours * 100) / 100,
            overtime: totalHours > 8 ? totalHours - 8 : 0,
            status:
              Math.random() > 0.95 ? ('LATE' as const) : ('PRESENT' as const),
            notes: Math.random() > 0.9 ? 'Working on important project' : null,
            employeeId: employee.id,
            userId: user.id,
          },
        });
      }
    }

    console.log('Attendance records created');

    // Create Leave Requests
    const leaveRequests = [
      {
        employeeId: johnDoeEmployee.id,
        userId: developer1.id,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-17'),
        days: 3,
        type: 'PERSONAL' as const,
        reason: 'Family wedding',
        status: 'APPROVED' as const,
        approvedBy: itManager.id,
        approvedAt: new Date('2024-02-10'),
      },
      {
        employeeId: janeSmithEmployee.id,
        userId: developer2.id,
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-03-12'),
        days: 3,
        type: 'SICK' as const,
        reason: 'Medical treatment',
        status: 'APPROVED' as const,
        approvedBy: itManager.id,
        approvedAt: new Date('2024-03-08'),
      },
      {
        employeeId: mikeWilsonEmployee.id,
        userId: salesRep1.id,
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-03-22'),
        days: 3,
        type: 'ANNUAL' as const,
        reason: 'Vacation with family',
        status: 'PENDING' as const,
      },
    ];

    for (const leaveRequest of leaveRequests) {
      await prisma.leaveRequest.create({
        data: leaveRequest,
      });
    }

    console.log('Leave requests created');

    // Create Payroll Records
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const payrollEmployees = [
      { employee: hrManagerEmployee, user: hrManager, basicSalary: 30000000 },
      { employee: itManagerEmployee, user: itManager, basicSalary: 35000000 },
      {
        employee: salesManagerEmployee,
        user: salesManager,
        basicSalary: 32000000,
      },
      { employee: johnDoeEmployee, user: developer1, basicSalary: 22000000 },
      { employee: janeSmithEmployee, user: developer2, basicSalary: 18000000 },
      { employee: mikeWilsonEmployee, user: salesRep1, basicSalary: 16000000 },
      { employee: sarahJonesEmployee, user: salesRep2, basicSalary: 14000000 },
    ];

    for (const payrollEmployee of payrollEmployees) {
      const overtime = Math.floor(Math.random() * 20) * 100000; // Random overtime
      const bonus = Math.floor(Math.random() * 5) * 500000; // Random bonus
      const deductions = Math.floor(Math.random() * 3) * 200000; // Random deductions
      const netSalary =
        payrollEmployee.basicSalary + overtime + bonus - deductions;

      await prisma.payroll.create({
        data: {
          period: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
          basicSalary: payrollEmployee.basicSalary,
          overtime: overtime,
          bonus: bonus,
          deductions: deductions,
          netSalary: netSalary,
          notes: 'Monthly payroll',
          employeeId: payrollEmployee.employee.id,
          userId: payrollEmployee.user.id,
        },
      });
    }

    console.log('Payroll records created');

    // Create Performance Reviews
    const performanceReviews = [
      {
        employeeId: johnDoeEmployee.id,
        userId: developer1.id,
        reviewerId: itManager.id,
        period: '2024-Q1',
        goals: 'Complete React migration project, improve code quality',
        achievements:
          'Successfully migrated 80% of components to React, implemented testing framework',
        rating: 4.5,
        feedback:
          'Excellent performance, showing strong technical skills and leadership potential',
      },
      {
        employeeId: janeSmithEmployee.id,
        userId: developer2.id,
        reviewerId: itManager.id,
        period: '2024-Q1',
        goals: 'Learn new technologies, contribute to team projects',
        achievements:
          'Completed Next.js certification, delivered 3 major features',
        rating: 4.0,
        feedback:
          'Good progress, showing steady improvement and team collaboration',
      },
      {
        employeeId: mikeWilsonEmployee.id,
        userId: salesRep1.id,
        reviewerId: salesManager.id,
        period: '2024-Q1',
        goals: 'Increase sales by 20%, expand client base',
        achievements: 'Achieved 25% sales increase, acquired 15 new clients',
        rating: 4.8,
        feedback: 'Outstanding sales performance, exceeded all targets',
      },
      {
        employeeId: sarahJonesEmployee.id,
        userId: salesRep2.id,
        reviewerId: salesManager.id,
        period: '2024-Q1',
        goals: 'Improve customer satisfaction, learn new sales techniques',
        achievements:
          'Maintained 95% customer satisfaction, completed sales training',
        rating: 4.2,
        feedback:
          'Great customer service skills, showing continuous improvement',
      },
    ];

    for (const review of performanceReviews) {
      await prisma.performanceReview.create({
        data: review,
      });
    }

    console.log('Performance reviews created');

    console.log('HRM data seeding completed successfully!');

    const summary = {
      message: 'HRM data seeding completed successfully!',
      summary: {
        roles: 3,
        users: 7,
        departments: 3,
        positions: 6,
        employees: 7,
        attendanceRecords: '~120',
        leaveRequests: 3,
        payrollRecords: 7,
        performanceReviews: 4,
      },
      credentials: {
        hrManager: 'hr.manager@company.com / hr123456',
        itManager: 'it.manager@company.com / it123456',
        salesManager: 'sales.manager@company.com / sales123456',
        johnDoe: 'john.doe@company.com / john123456',
        janeSmith: 'jane.smith@company.com / jane123456',
        mikeWilson: 'mike.wilson@company.com / mike123456',
        sarahJones: 'sarah.jones@company.com / sarah123456',
      },
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error seeding HRM data:', error);
    return NextResponse.json(
      {
        error: 'Seeding failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
