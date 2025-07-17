import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types
interface Extension {
    id: string;
    extCode: string;
    password?: string | null;
    name: string;
    description?: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build where clause
        const where: any = {};
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { extCode: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        // Get total count for pagination
        const total = await prisma.callExtension.count({ where });

        // Get paginated extensions
        const extensions = await prisma.callExtension.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                users: true
            }
        });

        return NextResponse.json({
            data: extensions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching extensions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch extensions' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { extCode, password, name, description } = body;

        // Validate required fields
        if (!extCode || !name) {
            return NextResponse.json(
                { error: 'Missing required fields: extCode, name' },
                { status: 400 }
            );
        }

        // Check if extension code already exists
        const existingExtension = await prisma.callExtension.findUnique({
            where: { extCode }
        });

        if (existingExtension) {
            return NextResponse.json(
                { error: 'Extension code already exists' },
                { status: 409 }
            );
        }

        // Create new extension
        const newExtension = await prisma.callExtension.create({
            data: {
                extCode,
                password: password || null,
                name,
                description: description || null,
                status: 'active'
            },
            include: {
                users: true
            }
        });

        return NextResponse.json(newExtension, { status: 201 });
    } catch (error) {
        console.error('Error creating extension:', error);
        return NextResponse.json(
            { error: 'Failed to create extension' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, extCode, password, name, description, status } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Extension ID is required' },
                { status: 400 }
            );
        }

        // Check if extension exists
        const existingExtension = await prisma.callExtension.findUnique({
            where: { id }
        });

        if (!existingExtension) {
            return NextResponse.json(
                { error: 'Extension not found' },
                { status: 404 }
            );
        }

        // Check if new extension code conflicts with existing ones (excluding current)
        if (extCode && extCode !== existingExtension.extCode) {
            const conflictingExtension = await prisma.callExtension.findUnique({
                where: { extCode }
            });
            
            if (conflictingExtension) {
                return NextResponse.json(
                    { error: 'Extension code already exists' },
                    { status: 409 }
                );
            }
        }

        // Update extension
        const updatedExtension = await prisma.callExtension.update({
            where: { id },
            data: {
                ...(extCode && { extCode }),
                ...(password !== undefined && { password }),
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(status && { status })
            },
            include: {
                users: true
            }
        });

        return NextResponse.json(updatedExtension);
    } catch (error) {
        console.error('Error updating extension:', error);
        return NextResponse.json(
            { error: 'Failed to update extension' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
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

        // Check if extension exists
        const existingExtension = await prisma.callExtension.findUnique({
            where: { id },
            include: {
                users: true
            }
        });

        if (!existingExtension) {
            return NextResponse.json(
                { error: 'Extension not found' },
                { status: 404 }
            );
        }

        // Delete the extension
        const deletedExtension = await prisma.callExtension.delete({
            where: { id },
            include: {
                users: true
            }
        });

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
    } finally {
        await prisma.$disconnect();
    }
}
