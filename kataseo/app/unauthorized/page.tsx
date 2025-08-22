'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ShieldX, Home, LogIn } from 'lucide-react'
import { Button } from '@/components/ui'

export default function UnauthorizedPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <ShieldX className="mx-auto h-24 w-24 text-red-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            You don't have permission to access this page.
          </p>
          
          {user && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Your current role: <span className="font-semibold">{user.role}</span>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Contact your administrator to request access.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {user ? (
            <>
              <Link href="/admin">
                <Button className="w-full flex items-center justify-center">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Website
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button className="w-full flex items-center justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Website
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
