'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Home, ArrowLeft, Users, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AccessDeniedPageProps {
  module?: string;
  requiredPermission?: string;
  userRole?: string;
  suggestedActions?: string[];
}

export default function AccessDeniedPage({
  module = 'this resource',
  requiredPermission = 'access',
  userRole = 'current role',
  suggestedActions = [],
}: AccessDeniedPageProps) {
  const router = useRouter();

  const defaultActions = [
    'Contact your system administrator to request access',
    'Check if you have the correct user role assigned',
    'Try logging in with a different account',
    'Return to the homepage and navigate to accessible modules',
  ];

  const actions = suggestedActions.length > 0 ? suggestedActions : defaultActions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Error Card */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Access Denied</CardTitle>
            <CardDescription className="text-red-700">
              You don't have permission to access {module}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Details */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Permission Required</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">Required Permission:</span>
                  <Badge variant="destructive">{requiredPermission}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">Your Current Role:</span>
                  <Badge variant="outline">{userRole}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">Requested Module:</span>
                  <Badge variant="secondary">{module}</Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </Button>
              <Button asChild className="flex items-center space-x-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  <span>Return Home</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex items-center space-x-2">
                <Link href="/auth-demo">
                  <Users className="h-4 w-4" />
                  <span>Try Demo</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>What can you do?</span>
            </CardTitle>
            <CardDescription>
              Here are some steps you can take to resolve this issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {actions.map((action, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Additional resources and support options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/auth-demo" className="flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Demo System</div>
                    <div className="text-xs text-muted-foreground">Test different roles</div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/docs/auth" className="flex flex-col items-center space-y-2">
                  <HelpCircle className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Documentation</div>
                    <div className="text-xs text-muted-foreground">Learn about permissions</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>TazaCore Enterprise Authentication System v2.0.0</p>
          <p>If you believe this is an error, please contact your system administrator.</p>
        </div>
      </div>
    </div>
  );
}
