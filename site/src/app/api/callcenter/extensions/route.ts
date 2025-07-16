import { NextRequest, NextResponse } from 'next/server';

// Types
interface Extension {
    id: string;
    extcode: string;
    password: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    userId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Mock data - in production, this would come from a database
let extensions: Extension[] = [
    {
        id: '1',
        extcode: '2001',
        password: 'pass123',
        name: 'Agent 001',
        description: 'Customer Service Agent',
        status: 'active',
        userId: 'user1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: '2',
        extcode: '2002',
        password: 'pass456',
        name: 'Agent 002',
        description: 'Technical Support Agent',
        status: 'inactive',
        userId: 'user2',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    }
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        let filteredExtensions = extensions;

        // Apply search filter
        if (search) {
            filteredExtensions = filteredExtensions.filter(ext =>
                ext.name.toLowerCase().includes(search.toLowerCase()) ||
                ext.extcode.includes(search) ||
                ext.description?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply status filter
        if (status && status !== 'all') {
            filteredExtensions = filteredExtensions.filter(ext => ext.status === status);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedExtensions = filteredExtensions.slice(startIndex, endIndex);

        return NextResponse.json({
            data: paginatedExtensions,
            pagination: {
                page,
                limit,
                total: filteredExtensions.length,
                totalPages: Math.ceil(filteredExtensions.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching extensions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch extensions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { extcode, password, name, description, userId } = body;

        // Validate required fields
        if (!extcode || !password || !name) {
            return NextResponse.json(
                { error: 'Missing required fields: extcode, password, name' },
                { status: 400 }
            );
        }

        // Check if extension code already exists
        const existingExtension = extensions.find(ext => ext.extcode === extcode);
        if (existingExtension) {
            return NextResponse.json(
                { error: 'Extension code already exists' },
                { status: 409 }
            );
        }

        // Create new extension
        const newExtension: Extension = {
            id: Date.now().toString(),
            extcode,
            password,
            name,
            description: description || '',
            status: 'active',
            userId: userId || null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        extensions.push(newExtension);

        return NextResponse.json(newExtension, { status: 201 });
    } catch (error) {
        console.error('Error creating extension:', error);
        return NextResponse.json(
            { error: 'Failed to create extension' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, extcode, password, name, description, status, userId } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Extension ID is required' },
                { status: 400 }
            );
        }

        const extensionIndex = extensions.findIndex(ext => ext.id === id);
        if (extensionIndex === -1) {
            return NextResponse.json(
                { error: 'Extension not found' },
                { status: 404 }
            );
        }

        // Check if new extension code conflicts with existing ones (excluding current)
        if (extcode) {
            const existingExtension = extensions.find(ext => ext.extcode === extcode && ext.id !== id);
            if (existingExtension) {
                return NextResponse.json(
                    { error: 'Extension code already exists' },
                    { status: 409 }
                );
            }
        }

        // Update extension
        const updatedExtension = {
            ...extensions[extensionIndex],
            ...(extcode && { extcode }),
            ...(password && { password }),
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            ...(userId !== undefined && { userId }),
            updatedAt: new Date()
        };

        extensions[extensionIndex] = updatedExtension;

        return NextResponse.json(updatedExtension);
    } catch (error) {
        console.error('Error updating extension:', error);
        return NextResponse.json(
            { error: 'Failed to update extension' },
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
                { error: 'Extension ID is required' },
                { status: 400 }
            );
        }

        const extensionIndex = extensions.findIndex(ext => ext.id === id);
        if (extensionIndex === -1) {
            return NextResponse.json(
                { error: 'Extension not found' },
                { status: 404 }
            );
        }

        const deletedExtension = extensions.splice(extensionIndex, 1)[0];

        return NextResponse.json({
            message: 'Extension deleted successfully',
            data: deletedExtension
        });
    } catch (error) {
        console.error('Error deleting extension:', error);
        return NextResponse.json(
            { error: 'Failed to delete extension' },
            { status: 500 }
        );
    }
}
