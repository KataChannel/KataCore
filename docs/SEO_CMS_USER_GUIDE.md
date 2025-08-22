# Hướng dẫn sử dụng SEO CMS trong TazaGroup

## 📖 Tổng quan

Hệ thống SEO CMS đã được tích hợp hoàn toàn vào TazaGroup, cung cấp các tính năng quản lý nội dung và tối ưu hóa SEO chuyên nghiệp.

## 🚀 Cách truy cập SEO CMS

### 1. Truy cập qua Admin Panel
```
http://your-domain.com/admin/seo
```

### 2. Menu Navigation
Trong admin panel, bạn sẽ thấy menu **"SEO & CMS"** với các mục con:
- **Dashboard** - Tổng quan SEO và analytics
- **Posts** - Quản lý bài viết
- **Categories** - Quản lý danh mục
- **Tags** - Quản lý thẻ từ khóa

## 📊 Dashboard SEO

### Tính năng chính:
- **Overview Cards**: Thống kê tổng quan (posts, views, categories, tags)
- **Analytics Charts**: Biểu đồ bài viết theo thời gian
- **Top Posts**: Danh sách bài viết có lượt xem cao nhất
- **SEO Analysis**: Phân tích SEO realtime cho từng bài viết

### Cách sử dụng:
1. Truy cập `/admin/seo`
2. Chọn khoảng thời gian analytics (1m, 3m, 6m, 1y, all)
3. Chọn bài viết để phân tích SEO
4. Xem điểm SEO và các khuyến nghị

## ✍️ Quản lý Bài viết

### Tạo bài viết mới:
1. Truy cập `/admin/seo/posts`
2. Click **"Create New Post"**
3. Điền thông tin:
   - **Title**: Tiêu đề bài viết
   - **Content**: Nội dung chính
   - **Excerpt**: Tóm tắt ngắn
   - **Status**: Draft/Published/Archived
   - **Featured Image**: URL hình ảnh đại diện

### SEO Optimization:
Hệ thống tự động phân tích và đưa ra gợi ý:
- **Title**: 30-60 ký tự
- **Meta Description**: 150-160 ký tự
- **URL Slug**: SEO-friendly, lowercase, hyphens
- **Content**: Tối thiểu 300 từ, có heading structure

### Preview Search:
Xem trước cách bài viết hiển thị trên Google search results

## 🏷️ Quản lý Categories

### Tạo danh mục:
1. Truy cập `/admin/seo/categories`
2. Click **"Add Category"**
3. Điền:
   - **Name**: Tên danh mục
   - **Slug**: URL-friendly identifier
   - **Description**: Mô tả danh mục

### Tính năng:
- Hiển thị số lượng bài viết trong mỗi danh mục
- Edit/Delete categories
- Auto-generate slug từ tên

## 🏷️ Quản lý Tags

### Tạo tag:
1. Truy cập `/admin/seo/tags`
2. Click **"Add Tag"**
3. Điền thông tin tương tự categories

### Best practices:
- Sử dụng tags để mô tả chủ đề cụ thể
- Tránh tạo quá nhiều tags tương tự
- Tags giúp cải thiện SEO và navigation

## 🔍 Tìm kiếm và Filter

### Search Posts:
- Tìm kiếm theo title, excerpt, content
- Filter theo status, category, tag, author
- Sắp xếp theo relevance score

### API Endpoints:
```
GET /api/search/posts?q=keyword&category=id&status=PUBLISHED
```

## 📈 Analytics và Báo cáo

### Metrics có sẵn:
- **Total Views**: Tổng lượt xem
- **Posts Per Month**: Bài viết theo tháng
- **Top Performing Posts**: Bài viết hiệu quả nhất
- **Category/Tag Performance**: Hiệu suất theo danh mục

### Export Data:
```javascript
// Lấy analytics data
const response = await fetch('/api/analytics/cms?period=6m')
const data = await response.json()
```

## 🛠️ API Endpoints

### SEO Analysis:
```javascript
// Phân tích SEO của bài viết
GET /api/seo/analyze?postId={id}

// Response: Score 0-100, issues, recommendations
{
  "score": 85,
  "issues": [...],
  "recommendations": [...],
  "summary": {
    "metaScore": 90,
    "contentScore": 80,
    "technicalScore": 85,
    "performanceScore": 90
  }
}
```

### Content Management:
```javascript
// Posts CRUD
GET /api/cms/posts
POST /api/cms/posts
GET /api/cms/posts/{id}
PUT /api/cms/posts/{id}
DELETE /api/cms/posts/{id}

// Categories & Tags
GET /api/cms/categories
POST /api/cms/categories
GET /api/cms/tags
POST /api/cms/tags
```

### Search:
```javascript
// Advanced search
GET /api/search/posts?q=keyword&filters=...

// Response với pagination
{
  "results": [...],
  "totalCount": 150,
  "page": 1,
  "totalPages": 15
}
```

## 🎯 SEO Best Practices

### 1. Content Optimization:
- **Minimum 300 words** per post
- Use **H2, H3 headings** for structure
- Include **relevant keywords** naturally
- Write **compelling meta descriptions**

### 2. Technical SEO:
- **Clean URLs** (lowercase, hyphens)
- **Alt text** for all images
- **Canonical URLs** to prevent duplicates
- **Proper heading hierarchy**

### 3. Performance:
- **Optimize images** before upload
- **Break up long content** with headings
- **Use excerpts** for better previews
- **Monitor reading time**

## 🔧 Customization

### Extend Components:
```typescript
import { SEOOptimization } from '@/components/seo'

// Sử dụng trong custom forms
<SEOOptimization
  content={{
    title: formData.title,
    description: formData.metaDescription,
    content: formData.content,
    slug: formData.slug
  }}
  onChange={handleSEOChange}
/>
```

### Custom Analytics:
```typescript
// Lấy analytics cho specific author
const response = await fetch('/api/analytics/cms?authorId=user-id&period=1y')
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Post not found"**
   - Kiểm tra post ID trong URL
   - Đảm bảo post tồn tại trong database

2. **SEO score thấp**
   - Kiểm tra title length (30-60 chars)
   - Thêm meta description
   - Cải thiện content structure

3. **Slug conflicts**
   - Slug phải unique
   - Sử dụng auto-generate slug
   - Check existing slugs

4. **API errors**
   - Kiểm tra network connection
   - Verify API endpoints
   - Check authentication

### Debug Commands:
```bash
# Check Prisma connection
npx prisma studio

# Regenerate Prisma client
npx prisma generate

# View database schema
npx prisma db pull
```

## 📱 Mobile Responsive

Tất cả components đều được thiết kế responsive:
- **Mobile-first design**
- **Touch-friendly interfaces**
- **Adaptive layouts**
- **Optimized performance**

## 🔐 Permissions

### Default Permissions:
- `read:seo` - Xem SEO dashboard
- `read:posts` - Xem danh sách posts
- `write:posts` - Tạo/edit posts
- `delete:posts` - Xóa posts
- `read:categories` - Quản lý categories
- `read:tags` - Quản lý tags

### Role Integration:
Hệ thống tích hợp với existing role system của TazaGroup.

## 🎉 Kết luận

SEO CMS đã được tích hợp hoàn toàn vào TazaGroup, cung cấp:
- ✅ **Complete content management system**
- ✅ **Advanced SEO optimization tools**
- ✅ **Real-time analytics and reporting**
- ✅ **Search functionality**
- ✅ **Mobile-responsive interface**
- ✅ **API-first architecture**

Bắt đầu sử dụng ngay bằng cách truy cập `/admin/seo` trong admin panel!
