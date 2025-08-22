'use client'

import { PostEditor } from '@/components/admin/posts/PostEditor'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { RequirePermission } from '@/components/auth/ProtectedRoute'

export default function CreatePostPage() {
  return (
    <RequirePermission permissions={['posts:create']}>
      <AdminLayout>
        <PostEditor />
      </AdminLayout>
    </RequirePermission>
  )
}
