'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Save,
  Settings,
  Globe,
  MessageCircle,
  Search,
  FileText,
  Users,
  Shield,
  Mail,
  Rss,
} from 'lucide-react';

const GET_BLOG_SETTINGS = gql`
  query GetBlogSettings {
    blogSettings {
      id
      siteName
      siteDescription
      siteUrl
      logo
      favicon
      postsPerPage
      enableComments
      moderateComments
      enableSearch
      enableRss
      enableNewsletter
      defaultPostStatus
      allowGuestComments
      requireCommentApproval
      enableSeo
      googleAnalyticsId
      facebookPixelId
      disqusShortname
      mailchimpApiKey
      mailchimpListId
      socialLinks
      footerText
      customCss
      customJs
    }
  }
`;

const UPDATE_BLOG_SETTINGS = gql`
  mutation UpdateBlogSettings($input: BlogSettingsUpdateInput!) {
    updateBlogSettings(input: $input) {
      id
      siteName
      siteDescription
    }
  }
`;

export default function BlogSettings() {
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    logo: '',
    favicon: '',
    postsPerPage: 10,
    enableComments: true,
    moderateComments: true,
    enableSearch: true,
    enableRss: true,
    enableNewsletter: false,
    defaultPostStatus: 'draft',
    allowGuestComments: false,
    requireCommentApproval: true,
    enableSeo: true,
    googleAnalyticsId: '',
    facebookPixelId: '',
    disqusShortname: '',
    mailchimpApiKey: '',
    mailchimpListId: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    },
    footerText: '',
    customCss: '',
    customJs: '',
  });

  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const { data, loading } = useQuery(GET_BLOG_SETTINGS);
  
  const [updateBlogSettings, { loading: updating }] = useMutation(UPDATE_BLOG_SETTINGS, {
    onCompleted: () => {
      setHasChanges(false);
      alert('Cài đặt đã được lưu thành công!');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      alert('Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại.');
    },
  });

  useEffect(() => {
    if (data?.blogSettings) {
      const settings = data.blogSettings;
      setFormData({
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        siteUrl: settings.siteUrl || '',
        logo: settings.logo || '',
        favicon: settings.favicon || '',
        postsPerPage: settings.postsPerPage || 10,
        enableComments: settings.enableComments !== undefined ? settings.enableComments : true,
        moderateComments: settings.moderateComments !== undefined ? settings.moderateComments : true,
        enableSearch: settings.enableSearch !== undefined ? settings.enableSearch : true,
        enableRss: settings.enableRss !== undefined ? settings.enableRss : true,
        enableNewsletter: settings.enableNewsletter || false,
        defaultPostStatus: settings.defaultPostStatus || 'draft',
        allowGuestComments: settings.allowGuestComments || false,
        requireCommentApproval: settings.requireCommentApproval !== undefined ? settings.requireCommentApproval : true,
        enableSeo: settings.enableSeo !== undefined ? settings.enableSeo : true,
        googleAnalyticsId: settings.googleAnalyticsId || '',
        facebookPixelId: settings.facebookPixelId || '',
        disqusShortname: settings.disqusShortname || '',
        mailchimpApiKey: settings.mailchimpApiKey || '',
        mailchimpListId: settings.mailchimpListId || '',
        socialLinks: settings.socialLinks || {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          linkedin: '',
        },
        footerText: settings.footerText || '',
        customCss: settings.customCss || '',
        customJs: settings.customJs || '',
      });
    }
  }, [data]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    try {
      await updateBlogSettings({
        variables: {
          input: formData,
        },
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cài đặt Blog
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý cài đặt và cấu hình cho blog
          </p>
        </div>
        
        {hasChanges && (
          <Button
            onClick={handleSubmit}
            disabled={updating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                Chung
              </TabsTrigger>
              <TabsTrigger value="posts">
                <FileText className="w-4 h-4 mr-2" />
                Bài viết
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageCircle className="w-4 h-4 mr-2" />
                Bình luận
              </TabsTrigger>
              <TabsTrigger value="seo">
                <Search className="w-4 h-4 mr-2" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="social">
                <Users className="w-4 h-4 mr-2" />
                Mạng xã hội
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Shield className="w-4 h-4 mr-2" />
                Nâng cao
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên website
                  </label>
                  <Input
                    value={formData.siteName}
                    onChange={(e) => handleFormChange('siteName', e.target.value)}
                    placeholder="Tên blog của bạn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL website
                  </label>
                  <Input
                    value={formData.siteUrl}
                    onChange={(e) => handleFormChange('siteUrl', e.target.value)}
                    placeholder="https://yourblog.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả website
                </label>
                <textarea
                  value={formData.siteDescription}
                  onChange={(e) => handleFormChange('siteDescription', e.target.value)}
                  placeholder="Mô tả ngắn gọn về blog của bạn..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo
                  </label>
                  <Input
                    value={formData.logo}
                    onChange={(e) => handleFormChange('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Favicon
                  </label>
                  <Input
                    value={formData.favicon}
                    onChange={(e) => handleFormChange('favicon', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text footer
                </label>
                <Input
                  value={formData.footerText}
                  onChange={(e) => handleFormChange('footerText', e.target.value)}
                  placeholder="© 2024 Blog của bạn. Tất cả quyền được bảo lưu."
                />
              </div>
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số bài viết trên trang
                  </label>
                  <Select
                    value={formData.postsPerPage.toString()}
                    onValueChange={(value) => handleFormChange('postsPerPage', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 bài viết</SelectItem>
                      <SelectItem value="10">10 bài viết</SelectItem>
                      <SelectItem value="15">15 bài viết</SelectItem>
                      <SelectItem value="20">20 bài viết</SelectItem>
                      <SelectItem value="25">25 bài viết</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trạng thái mặc định
                  </label>
                  <Select
                    value={formData.defaultPostStatus}
                    onValueChange={(value) => handleFormChange('defaultPostStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="scheduled">Lên lịch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Tính năng bài viết
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enableSearch}
                      onChange={(e) => handleFormChange('enableSearch', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Bật tìm kiếm bài viết</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enableRss}
                      onChange={(e) => handleFormChange('enableRss', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Bật RSS feed</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enableNewsletter}
                      onChange={(e) => handleFormChange('enableNewsletter', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Bật đăng ký nhận tin</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cài đặt bình luận
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enableComments}
                      onChange={(e) => handleFormChange('enableComments', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Cho phép bình luận</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.moderateComments}
                      onChange={(e) => handleFormChange('moderateComments', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Kiểm duyệt bình luận</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.allowGuestComments}
                      onChange={(e) => handleFormChange('allowGuestComments', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Cho phép khách bình luận</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.requireCommentApproval}
                      onChange={(e) => handleFormChange('requireCommentApproval', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Yêu cầu phê duyệt bình luận</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disqus Shortname
                </label>
                <Input
                  value={formData.disqusShortname}
                  onChange={(e) => handleFormChange('disqusShortname', e.target.value)}
                  placeholder="your-disqus-shortname"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để trống nếu không sử dụng Disqus
                </p>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.enableSeo}
                    onChange={(e) => handleFormChange('enableSeo', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Bật tối ưu SEO</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Analytics ID
                </label>
                <Input
                  value={formData.googleAnalyticsId}
                  onChange={(e) => handleFormChange('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook Pixel ID
                </label>
                <Input
                  value={formData.facebookPixelId}
                  onChange={(e) => handleFormChange('facebookPixelId', e.target.value)}
                  placeholder="1234567890123456"
                />
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Liên kết mạng xã hội
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Facebook
                    </label>
                    <Input
                      value={formData.socialLinks.facebook}
                      onChange={(e) => handleSocialChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Twitter
                    </label>
                    <Input
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/youraccount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instagram
                    </label>
                    <Input
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/youraccount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      YouTube
                    </label>
                    <Input
                      value={formData.socialLinks.youtube}
                      onChange={(e) => handleSocialChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/yourchannel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <Input
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Email Marketing
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mailchimp API Key
                  </label>
                  <Input
                    value={formData.mailchimpApiKey}
                    onChange={(e) => handleFormChange('mailchimpApiKey', e.target.value)}
                    placeholder="your-mailchimp-api-key"
                    type="password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mailchimp List ID
                  </label>
                  <Input
                    value={formData.mailchimpListId}
                    onChange={(e) => handleFormChange('mailchimpListId', e.target.value)}
                    placeholder="your-list-id"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CSS tùy chỉnh
                </label>
                <textarea
                  value={formData.customCss}
                  onChange={(e) => handleFormChange('customCss', e.target.value)}
                  placeholder="/* CSS tùy chỉnh của bạn */"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  JavaScript tùy chỉnh
                </label>
                <textarea
                  value={formData.customJs}
                  onChange={(e) => handleFormChange('customJs', e.target.value)}
                  placeholder="// JavaScript tùy chỉnh của bạn"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Lưu ý
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Việc thêm CSS/JavaScript tùy chỉnh có thể ảnh hưởng đến hiệu suất và bảo mật của website. 
                  Hãy chắc chắn bạn hiểu rõ những gì mình đang làm.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
