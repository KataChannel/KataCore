import { NextRequest, NextResponse } from 'next/server';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    isActive: boolean;
}

// Mock user data - in production, this would come from your user database
let users: User[] = [
    {
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Customer Service',
        role: 'Agent',
        isActive: true
    },
    {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        department: 'Technical Support',
        role: 'Senior Agent',
        isActive: true
    },
    {
        id: 'user3',
        name: 'Bob Wilson',
        email: 'bob.wilson@company.com',
        department: 'Sales',
        role: 'Sales Agent',
        isActive: false
    },
    {
        id: 'user4',
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        department: 'Customer Service',
        role: 'Supervisor',
        isActive: true
    }
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const department = searchParams.get('department');
        const isActive = searchParams.get('isActive');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        let filteredUsers = users;

        // Apply search filter
        if (search) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.department.toLowerCase().includes(search.toLowerCase()) ||
                user.role.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply department filter
        if (department && department !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.department === department);
        }

        // Apply active status filter
        if (isActive !== null && isActive !== undefined && isActive !== 'all') {
            const activeStatus = isActive === 'true';
            filteredUsers = filteredUsers.filter(user => user.isActive === activeStatus);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        return NextResponse.json({
            data: paginatedUsers,
            pagination: {
                page,
                limit,
                total: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, department, role, isActive = true } = body;

        // Validate required fields
        if (!name || !email || !department || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, department, role' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            department,
            role,
            isActive
        };

        users.push(newUser);

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, email, department, role, isActive } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if new email conflicts with existing ones (excluding current)
        if (email) {
            const existingUser = users.find(user => user.email === email && user.id !== id);
            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 409 }
                );
            }
        }

        // Update user
        const updatedUser = {
            ...users[userIndex],
            ...(name && { name }),
            ...(email && { email }),
            ...(department && { department }),
            ...(role && { role }),
            ...(isActive !== undefined && { isActive })
        };

        users[userIndex] = updatedUser;

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const deletedUser = users.splice(userIndex, 1)[0];

        return NextResponse.json({
            message: 'User deleted successfully',
            data: deletedUser
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
