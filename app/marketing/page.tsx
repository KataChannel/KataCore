'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BarChart3, Users, Shield, Zap, Star, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50">
        <div className="container px-4 py-24 md:py-32">
          <div 
            className="flex flex-col items-center text-center space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <div variants={fadeInUp}>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Powered by Next.js 15 & React 19
              </Badge>
            </div>
            
            <h1 
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              TazaCore Platform
            </h1>
            
            <p 
              className="max-w-2xl text-xl text-muted-foreground leading-relaxed"
              variants={fadeInUp}
            >
              Hệ thống quản lý doanh nghiệp toàn diện được xây dựng với công nghệ hiện đại nhất. 
              Tối ưu hóa quy trình, nâng cao hiệu quả và phát triển bền vững.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeInUp}
            >
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Quản trị hệ thống
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container px-4">
          <div 
            className="text-center space-y-4 mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Khám phá những tính năng mạnh mẽ giúp doanh nghiệp của bạn phát triển vượt trội
            </p>
          </div>
          
          <div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: BarChart3,
                title: "Báo cáo thông minh",
                description: "Dashboard trực quan với analytics real-time và insights kinh doanh chuyên sâu"
              },
              {
                icon: Users,
                title: "Quản lý nhân sự",
                description: "Hệ thống HR toàn diện từ tuyển dụng, đào tạo đến đánh giá hiệu suất"
              },
              {
                icon: Shield,
                title: "Bảo mật cao cấp",
                description: "Bảo vệ dữ liệu với mã hóa AES-256 và xác thực đa yếu tố (MFA)"
              }
            ].map((feature, index) => (
              <div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-muted/50">
        <div className="container px-4">
          <div 
            className="grid gap-8 md:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { value: "99.9%", label: "Uptime đảm bảo" },
              { value: "500+", label: "Doanh nghiệp tin tùng" },
              { value: "24/7", label: "Hỗ trợ kỹ thuật" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div 
            className="text-center space-y-8 max-w-3xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sẵn sàng để bắt đầu?
            </h2>
            <p className="text-xl text-muted-foreground">
              Tham gia cùng hàng trăm doanh nghiệp đã tin tưởng TazaCore để phát triển kinh doanh
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Dùng thử miễn phí
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Liên hệ tư vấn
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
