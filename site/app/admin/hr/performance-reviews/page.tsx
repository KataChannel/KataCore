'use client';

import { useState, useEffect } from 'react';
import { 
  StarIcon, 
  TrophyIcon, 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PlusIcon,
  UserIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';

interface PerformanceReview {
  id: string;
  employee: {
    id: string;
    fullName: string;
    employeeId: string;
    position: {
      title: string;
      department: {
        name: string;
      };
    };
  };
  reviewer: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  period: string;
  goals?: string;
  achievements?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  id: string;
  fullName: string;
  employeeId: string;
}

interface Reviewer {
  id: string;
  displayName: string;
}

interface Summary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

const PerformanceReviewManagement = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [reviewerFilter, setReviewerFilter] = useState('all');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<Summary>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: []
  });

  const [formData, setFormData] = useState({
    employeeId: '',
    reviewerId: '',
    period: '',
    goals: '',
    achievements: '',
    rating: '',
    feedback: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchEmployees();
    fetchReviewers();
  }, []);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (periodFilter) params.append('period', periodFilter);
      if (reviewerFilter !== 'all') params.append('reviewerId', reviewerFilter);

      const response = await fetch(`/api/hr/performance-reviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
        setSummary(data.summary || {});
      } else {
        setError('Không thể tải danh sách đánh giá hiệu suất');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hr/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/hr/users');
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = selectedReview ? 'PUT' : 'POST';
      const url = '/api/hr/performance-reviews';
      
      const payload: any = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
      };

      if (selectedReview) {
        payload.id = selectedReview.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchReviews();
        setShowModal(false);
        resetForm();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving review:', error);
      setError('Lỗi kết nối đến server');
    }
  };

  const handleEdit = (review: PerformanceReview) => {
    setSelectedReview(review);
    setFormData({
      employeeId: review.employee.id,
      reviewerId: review.reviewer.id,
      period: review.period,
      goals: review.goals || '',
      achievements: review.achievements || '',
      rating: review.rating?.toString() || '',
      feedback: review.feedback || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (review: PerformanceReview) => {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá hiệu suất này?')) {
      try {
        const response = await fetch(`/api/hr/performance-reviews?id=${review.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchReviews();
          setError('');
        } else {
          const data = await response.json();
          setError(data.error || 'Không thể xóa đánh giá hiệu suất');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        setError('Lỗi kết nối đến server');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      reviewerId: '',
      period: '',
      goals: '',
      achievements: '',
      rating: '',
      feedback: ''
    });
    setSelectedReview(null);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Xuất sắc';
    if (rating >= 3.5) return 'Tốt';
    if (rating >= 2.5) return 'Trung bình';
    return 'Cần cải thiện';
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && <StarIcon className="h-4 w-4 text-yellow-400 fill-current opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý đánh giá hiệu suất</h1>
          <p className="text-gray-600">Theo dõi và đánh giá hiệu suất làm việc của nhân viên</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Tạo đánh giá mới
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số đánh giá</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalReviews}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.averageRating.toFixed(1)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hiệu suất cao</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary.ratingDistribution.filter(item => item.rating >= 4).reduce((acc, item) => acc + item.count, 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrophyIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả kỳ đánh giá</option>
              <option value="2024-Q1">Q1 2024</option>
              <option value="2024-Q2">Q2 2024</option>
              <option value="2024-Q3">Q3 2024</option>
              <option value="2024-Q4">Q4 2024</option>
              <option value="2024">Năm 2024</option>
            </select>
            <select
              value={reviewerFilter}
              onChange={(e) => setReviewerFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả người đánh giá</option>
              {reviewers.map(reviewer => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kỳ đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm số
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phản hồi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {review.employee.fullName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {review.employee.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.employee.employeeId} • {review.employee.position.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.reviewer.displayName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {review.rating ? (
                      <div className="flex flex-col">
                        {renderStars(review.rating)}
                        <span className={`text-xs font-medium ${getRatingColor(review.rating)}`}>
                          {getRatingText(review.rating)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Chưa có điểm</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {review.feedback ? review.feedback : 'Chưa có phản hồi'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedReview ? 'Chỉnh sửa đánh giá' : 'Tạo đánh giá mới'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhân viên *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    required
                    disabled={!!selectedReview}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} - {employee.employeeId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người đánh giá *
                  </label>
                  <select
                    value={formData.reviewerId}
                    onChange={(e) => setFormData({...formData, reviewerId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn người đánh giá</option>
                    {reviewers.map(reviewer => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kỳ đánh giá *
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    required
                    disabled={!!selectedReview}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn kỳ đánh giá</option>
                    <option value="2024-Q1">Q1 2024</option>
                    <option value="2024-Q2">Q2 2024</option>
                    <option value="2024-Q3">Q3 2024</option>
                    <option value="2024-Q4">Q4 2024</option>
                    <option value="2024">Năm 2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm số (1-5)
                  </label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mục tiêu
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả mục tiêu của nhân viên..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thành tích
                </label>
                <textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả thành tích đạt được..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phản hồi
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhận xét và phản hồi về hiệu suất..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {selectedReview ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceReviewManagement;
