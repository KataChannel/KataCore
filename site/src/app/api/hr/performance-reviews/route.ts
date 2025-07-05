import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

// GET /api/hr/performance-reviews - Lấy danh sách đánh giá hiệu suất
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const reviewerId = searchParams.get('reviewerId');
    const period = searchParams.get('period');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (employeeId && employeeId !== 'all') {
      where.employeeId = employeeId;
    }
    
    if (reviewerId && reviewerId !== 'all') {
      where.reviewerId = reviewerId;
    }
    
    if (period) {
      where.period = period;
    }

    const [reviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  displayName: true,
                  avatar: true
                }
              },
              position: {
                include: {
                  department: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          reviewer: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          }
        },
        orderBy: [
          { period: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.performanceReview.count({ where })
    ]);

    // Transform data for frontend
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      period: review.period,
      goals: review.goals,
      achievements: review.achievements,
      rating: review.rating,
      feedback: review.feedback,
      employee: {
        id: review.employee.id,
        fullName: review.employee.fullName,
        employeeId: review.employee.employeeId,
        position: {
          title: review.employee.position.title,
          department: {
            name: review.employee.position.department.name
          }
        },
        user: review.employee.user
      },
      reviewer: review.reviewer,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString()
    }));

    // Calculate summary statistics
    const summary = await prisma.performanceReview.aggregate({
      where,
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    });

    const ratingDistribution = await prisma.performanceReview.groupBy({
      by: ['rating'],
      where,
      _count: {
        rating: true
      }
    });

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalReviews: summary._count.id,
        averageRating: summary._avg.rating || 0,
        ratingDistribution: ratingDistribution.map((item: any) => ({
          rating: item.rating,
          count: item._count.rating
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách đánh giá hiệu suất' },
      { status: 500 }
    );
  }
}

// POST /api/hr/performance-reviews - Tạo đánh giá hiệu suất
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, reviewerId, period, goals, achievements, rating, feedback } = body;

    if (!employeeId || !reviewerId || !period) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra employee có tồn tại không
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Nhân viên không tồn tại' },
        { status: 404 }
      );
    }

    // Kiểm tra reviewer có tồn tại không
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId }
    });

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Người đánh giá không tồn tại' },
        { status: 404 }
      );
    }

    // Kiểm tra đã có đánh giá cho kỳ này chưa
    const existingReview = await prisma.performanceReview.findUnique({
      where: {
        employeeId_period: {
          employeeId,
          period
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Đã có đánh giá cho kỳ này' },
        { status: 409 }
      );
    }

    // Validate rating nếu có
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Điểm đánh giá phải từ 1 đến 5' },
        { status: 400 }
      );
    }

    const review = await prisma.performanceReview.create({
      data: {
        employeeId,
        reviewerId,
        userId: employee.userId,
        period,
        goals,
        achievements,
        rating,
        feedback
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                displayName: true,
                avatar: true
              }
            },
            position: {
              include: {
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Tạo đánh giá hiệu suất thành công'
    });

  } catch (error) {
    console.error('Error creating performance review:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo đánh giá hiệu suất' },
      { status: 500 }
    );
  }
}

// PUT /api/hr/performance-reviews - Cập nhật đánh giá hiệu suất
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, goals, achievements, rating, feedback } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID đánh giá' },
        { status: 400 }
      );
    }

    const existingReview = await prisma.performanceReview.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Đánh giá hiệu suất không tồn tại' },
        { status: 404 }
      );
    }

    // Validate rating nếu có
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Điểm đánh giá phải từ 1 đến 5' },
        { status: 400 }
      );
    }

    const review = await prisma.performanceReview.update({
      where: { id },
      data: {
        goals: goals !== undefined ? goals : existingReview.goals,
        achievements: achievements !== undefined ? achievements : existingReview.achievements,
        rating: rating !== undefined ? rating : existingReview.rating,
        feedback: feedback !== undefined ? feedback : existingReview.feedback
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                displayName: true,
                avatar: true
              }
            },
            position: {
              include: {
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Cập nhật đánh giá hiệu suất thành công'
    });

  } catch (error) {
    console.error('Error updating performance review:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật đánh giá hiệu suất' },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/performance-reviews - Xóa đánh giá hiệu suất
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID đánh giá' },
        { status: 400 }
      );
    }

    const existingReview = await prisma.performanceReview.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Đánh giá hiệu suất không tồn tại' },
        { status: 404 }
      );
    }

    await prisma.performanceReview.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa đánh giá hiệu suất thành công'
    });

  } catch (error) {
    console.error('Error deleting performance review:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa đánh giá hiệu suất' },
      { status: 500 }
    );
  }
}
