/**
 * ============================================================================
 * WITHDRAWALS TAB - AFFILIATE DASHBOARD
 * ============================================================================
 * Withdrawal requests and payment history management
 */

'use client';

import React, { useState } from 'react';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface WithdrawalRequest {
  id: string;
  amount: number;
  method: 'bank' | 'paypal' | 'momo' | 'zalopay';
  accountInfo: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: string;
  processedDate?: string;
  fees: number;
  netAmount: number;
  notes?: string;
  rejectionReason?: string;
}

interface WithdrawalSummary {
  availableBalance: number;
  pendingWithdrawals: number;
  totalWithdrawn: number;
  minimumWithdrawal: number;
  withdrawalFeeRate: number;
  processingTime: string;
}

interface WithdrawalsTabProps {
  withdrawals: WithdrawalRequest[];
  summary: WithdrawalSummary;
  onRequestWithdrawal: (request: Partial<WithdrawalRequest>) => void;
  onCancelWithdrawal: (withdrawalId: string) => void;
}

export function WithdrawalsTab({ withdrawals, summary, onRequestWithdrawal, onCancelWithdrawal }: WithdrawalsTabProps) {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    method: 'bank' as const,
    accountInfo: '',
    notes: ''
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'rejected', label: 'Đã từ chối' }
  ];

  const withdrawalMethods = [
    { 
      value: 'bank', 
      label: 'Chuyển khoản ngân hàng',
      icon: BuildingLibraryIcon,
      placeholder: 'Số tài khoản - Tên ngân hàng - Chủ tài khoản'
    },
    { 
      value: 'paypal', 
      label: 'PayPal',
      icon: CreditCardIcon,
      placeholder: 'Email PayPal'
    },
    { 
      value: 'momo', 
      label: 'Ví MoMo',
      icon: DevicePhoneMobileIcon,
      placeholder: 'Số điện thoại MoMo'
    },
    { 
      value: 'zalopay', 
      label: 'ZaloPay',
      icon: DevicePhoneMobileIcon,
      placeholder: 'Số điện thoại ZaloPay'
    }
  ];

  const filteredWithdrawals = withdrawals.filter((withdrawal: { status: string; }) =>
    selectedStatus === 'all' || withdrawal.status === selectedStatus
  );

  const calculateFees = (amount: number) => {
    return amount * (summary.withdrawalFeeRate / 100);
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculateFees(amount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Đã hoàn thành',
      rejected: 'Đã từ chối'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{statusLabels[status as keyof typeof statusLabels]}</span>
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    const methodConfig = withdrawalMethods.find(m => m.value === method);
    if (!methodConfig) return null;
    
    const IconComponent = methodConfig.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getMethodLabel = (method: string) => {
    const methodConfig = withdrawalMethods.find(m => m.value === method);
    return methodConfig?.label || method;
  };

  const handleSubmitWithdrawal = () => {
    const amount = parseFloat(withdrawalForm.amount);
    
    if (amount < summary.minimumWithdrawal) {
      alert(`Số tiền rút tối thiểu là ${formatCurrency(summary.minimumWithdrawal)}`);
      return;
    }

    if (amount > summary.availableBalance) {
      alert('Số tiền rút vượt quá số dư khả dụng');
      return;
    }

    if (!withdrawalForm.accountInfo.trim()) {
      alert('Vui lòng nhập thông tin tài khoản');
      return;
    }

    const fees = calculateFees(amount);
    const netAmount = calculateNetAmount(amount);

    onRequestWithdrawal({
      amount,
      method: withdrawalForm.method,
      accountInfo: withdrawalForm.accountInfo,
      fees,
      netAmount,
      notes: withdrawalForm.notes
    });

    setWithdrawalForm({
      amount: '',
      method: 'bank',
      accountInfo: '',
      notes: ''
    });
    setShowWithdrawalForm(false);
  };

  const canWithdraw = summary.availableBalance >= summary.minimumWithdrawal;

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Số dư khả dụng</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.availableBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Đang chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(summary.pendingWithdrawals)}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Tổng đã rút</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalWithdrawn)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Thông tin rút tiền</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <span className="font-medium">Số tiền tối thiểu:</span> {formatCurrency(summary.minimumWithdrawal)}
          </div>
          <div>
            <span className="font-medium">Phí rút tiền:</span> {summary.withdrawalFeeRate}%
          </div>
          <div>
            <span className="font-medium">Thời gian xử lý:</span> {summary.processingTime}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowWithdrawalForm(true)}
          disabled={!canWithdraw}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            canWithdraw
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Yêu cầu rút tiền
        </button>
      </div>

      {/* Withdrawal Form */}
      {showWithdrawalForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Yêu cầu rút tiền</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền rút</label>
              <input
                type="number"
                value={withdrawalForm.amount}
                onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value})}
                max={summary.availableBalance}
                min={summary.minimumWithdrawal}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Tối thiểu ${formatCurrency(summary.minimumWithdrawal)}`}
              />
              {withdrawalForm.amount && (
                <div className="mt-2 text-sm text-gray-600">
                  <div>Phí rút tiền: {formatCurrency(calculateFees(parseFloat(withdrawalForm.amount) || 0))}</div>
                  <div className="font-medium">Số tiền thực nhận: {formatCurrency(calculateNetAmount(parseFloat(withdrawalForm.amount) || 0))}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức rút tiền</label>
              <select
                value={withdrawalForm.method}
                onChange={(e) => setWithdrawalForm({...withdrawalForm, method: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {withdrawalMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin tài khoản</label>
              <input
                type="text"
                value={withdrawalForm.accountInfo}
                onChange={(e) => setWithdrawalForm({...withdrawalForm, accountInfo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={withdrawalMethods.find(m => m.value === withdrawalForm.method)?.placeholder}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
              <textarea
                value={withdrawalForm.notes}
                onChange={(e) => setWithdrawalForm({...withdrawalForm, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ghi chú thêm cho yêu cầu rút tiền..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowWithdrawalForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitWithdrawal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gửi yêu cầu
            </button>
          </div>
        </div>
      )}

      {/* Withdrawals History */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Lịch sử rút tiền</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày yêu cầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWithdrawals.map((withdrawal: WithdrawalRequest) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                      <div className="text-xs text-gray-500">
                        Phí: {formatCurrency(withdrawal.fees)} | Thực nhận: {formatCurrency(withdrawal.netAmount)}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMethodIcon(withdrawal.method)}
                      <span className="ml-2 text-sm text-gray-900">{getMethodLabel(withdrawal.method)}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(withdrawal.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(withdrawal.requestDate)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{withdrawal.accountInfo}</div>
                    {withdrawal.notes && (
                      <div className="text-xs text-gray-500 mt-1">{withdrawal.notes}</div>
                    )}
                    {withdrawal.rejectionReason && (
                      <div className="text-xs text-red-600 mt-1">Lý do từ chối: {withdrawal.rejectionReason}</div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {withdrawal.status === 'pending' && (
                      <button
                        onClick={() => onCancelWithdrawal(withdrawal.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hủy yêu cầu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWithdrawals.length === 0 && (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có yêu cầu rút tiền nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus !== 'all' 
                ? 'Không tìm thấy yêu cầu rút tiền với trạng thái đã chọn.'
                : 'Bắt đầu bằng cách tạo yêu cầu rút tiền đầu tiên của bạn.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
