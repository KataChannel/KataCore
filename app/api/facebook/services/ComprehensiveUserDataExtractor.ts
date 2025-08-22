import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive User Data Extraction Service
export class ComprehensiveUserDataExtractor {
  private facebookApiBase = 'https://graph.facebook.com/v23.0';

  // 1. FACEBOOK LEAD ADS - Phương pháp HỢP PHÁP nhất
  async extractFromLeadAds(pageId?: string): Promise<UserDataSummary[]> {
    console.log('🎯 Extracting from Facebook Lead Ads...');
    
    const pages = pageId 
      ? await prisma.facebook_pages.findMany({ where: { facebookPageId: pageId } })
      : await prisma.facebook_pages.findMany({ where: { accessToken: { not: null } } });

    const extractedUsers: UserDataSummary[] = [];

    for (const page of pages) {
      try {
        // Lấy Lead Forms
        const leadFormsResponse = await this.makeApiRequest(
          `/${page.facebookPageId}/leadgen_forms`,
          page.accessToken || ''
        );

        for (const form of leadFormsResponse.data || []) {
          // Lấy Leads từ mỗi form
          const leadsResponse = await this.makeApiRequest(
            `/${form.id}/leads`,
            page.accessToken || '',
            { fields: 'id,created_time,field_data' }
          );

          for (const lead of leadsResponse.data || []) {
            const userData = this.parseLeadFieldData(lead.field_data || []);
            
            if (userData.email || userData.phone) {
              extractedUsers.push({
                source: 'FACEBOOK_LEAD_ADS',
                sourceId: lead.id,
                pageId: page.facebookPageId,
                pageName: page.name,
                userName: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                email: userData.email,
                phone: userData.phone,
                company: userData.company,
                location: userData.location,
                extractedAt: new Date(),
                confidence: 95, // Lead Ads có độ tin cậy cao nhất
                additionalData: {
                  formId: form.id,
                  formName: form.name,
                  jobTitle: userData.jobTitle,
                  rawData: userData
                }
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error extracting lead ads for page ${page.facebookPageId}:`, error);
      }
    }

    console.log(`✅ Lead Ads: Found ${extractedUsers.length} users with contact info`);
    return extractedUsers;
  }

  // 2. FACEBOOK COMMENTS & MESSAGES - Text mining
  async extractFromFacebookInteractions(pageId?: string): Promise<UserDataSummary[]> {
    console.log('💬 Extracting from Facebook Comments & Messages...');
    
    const extractedUsers: UserDataSummary[] = [];

    // Extract từ Comments
    const comments = await prisma.facebook_comments.findMany({
      where: pageId ? {
        facebook_posts: {
          facebookPageId: pageId
        }
      } : undefined,
      include: {
        facebook_posts: {
          include: {
            facebook_pages: true
          }
        }
      }
    });

    for (const comment of comments) {
      const extractedData = this.extractFromText(comment.message || '');
      
      if (extractedData.phone || extractedData.email) {
        extractedUsers.push({
          source: 'FACEBOOK_COMMENTS',
          sourceId: comment.facebookCommentId,
          pageId: comment.facebook_posts?.facebook_pages?.facebookPageId || '',
          pageName: comment.facebook_posts?.facebook_pages?.name || '',
          userName: comment.fromName,
          facebookUserId: comment.fromId,
          facebookProfileLink: `https://facebook.com/${comment.fromId}`,
          email: extractedData.email,
          phone: extractedData.phone,
          location: extractedData.location,
          age: extractedData.age,
          interests: extractedData.interests,
          extractedAt: new Date(),
          confidence: extractedData.confidence,
          additionalData: {
            commentText: comment.message,
            postId: comment.facebookPostId,
            createdTime: comment.createdTime
          }
        });
      }
    }

    // Extract từ Messages
    const messages = await prisma.facebook_messages.findMany({
      where: pageId ? { facebookPageId: pageId } : undefined,
      include: {
        facebook_pages: true
      }
    });

    for (const message of messages) {
      const extractedData = this.extractFromText(message.message || '');
      
      if (extractedData.phone || extractedData.email) {
        extractedUsers.push({
          source: 'FACEBOOK_MESSAGES',
          sourceId: message.facebookMessageId,
          pageId: message.facebookPageId,
          pageName: message.facebook_pages?.name || '',
          userName: message.fromName,
          facebookUserId: message.fromId,
          facebookProfileLink: `https://facebook.com/${message.fromId}`,
          email: extractedData.email,
          phone: extractedData.phone,
          location: extractedData.location,
          age: extractedData.age,
          interests: extractedData.interests,
          extractedAt: new Date(),
          confidence: extractedData.confidence + 10, // Messages có độ tin cậy cao hơn comments
          additionalData: {
            messageText: message.message,
            conversationId: message.conversationId,
            createdTime: message.createdTime
          }
        });
      }
    }

    console.log(`✅ Facebook Interactions: Found ${extractedUsers.length} users with contact info`);
    return extractedUsers;
  }

  // 3. INSTAGRAM BUSINESS - Comments mining
  async extractFromInstagram(pageId?: string): Promise<UserDataSummary[]> {
    console.log('📸 Extracting from Instagram Business...');
    
    const extractedUsers: UserDataSummary[] = [];
    const pages = pageId 
      ? await prisma.facebook_pages.findMany({ where: { facebookPageId: pageId } })
      : await prisma.facebook_pages.findMany({ where: { accessToken: { not: null } } });

    for (const page of pages) {
      try {
        // Lấy Instagram Business Account
        const igAccountResponse = await this.makeApiRequest(
          `/${page.facebookPageId}`,
          page.accessToken || '',
          { fields: 'instagram_business_account' }
        );

        if (igAccountResponse.instagram_business_account) {
          const igAccountId = igAccountResponse.instagram_business_account.id;
          
          // Lấy Media
          const mediaResponse = await this.makeApiRequest(
            `/${igAccountId}/media`,
            page.accessToken || '',
            { fields: 'id,caption', limit: 20 }
          );

          for (const media of mediaResponse.data || []) {
            try {
              // Lấy Comments từ media
              const commentsResponse = await this.makeApiRequest(
                `/${media.id}/comments`,
                page.accessToken || '',
                { fields: 'id,text,username,timestamp', limit: 50 }
              );

              for (const comment of commentsResponse.data || []) {
                const extractedData = this.extractFromText(comment.text || '');
                
                if (extractedData.phone || extractedData.email) {
                  extractedUsers.push({
                    source: 'INSTAGRAM_COMMENTS',
                    sourceId: comment.id,
                    pageId: page.facebookPageId,
                    pageName: page.name,
                    userName: comment.username,
                    instagramUsername: comment.username,
                    email: extractedData.email,
                    phone: extractedData.phone,
                    location: extractedData.location,
                    age: extractedData.age,
                    interests: extractedData.interests,
                    extractedAt: new Date(),
                    confidence: extractedData.confidence,
                    additionalData: {
                      commentText: comment.text,
                      mediaId: media.id,
                      timestamp: comment.timestamp,
                      platform: 'INSTAGRAM'
                    }
                  });
                }
              }
            } catch (error) {
              // Skip media nếu không có quyền truy cập comments
              continue;
            }
          }
        }
      } catch (error) {
        console.error(`Error extracting Instagram data for page ${page.facebookPageId}:`, error);
      }
    }

    console.log(`✅ Instagram: Found ${extractedUsers.length} users with contact info`);
    return extractedUsers;
  }

  // 4. FACEBOOK PIXEL & CONVERSIONS API - Tracking data
  async extractFromPixelConversions(): Promise<UserDataSummary[]> {
    console.log('🎯 Extracting from Facebook Pixel Conversions...');
    
    // TODO: Implement Pixel conversion data extraction
    // Đây sẽ là tracking data từ website conversions
    
    return [];
  }

  // 5. COMPREHENSIVE EXTRACTION - Tất cả phương pháp
  async extractAllUserData(pageId?: string): Promise<UserDataExtractionResult> {
    console.log('🚀 Starting Comprehensive User Data Extraction...');
    
    const startTime = Date.now();
    
    // Chạy song song tất cả các phương pháp
    const [
      leadAdsUsers,
      facebookUsers,
      instagramUsers,
      pixelUsers
    ] = await Promise.all([
      this.extractFromLeadAds(pageId),
      this.extractFromFacebookInteractions(pageId),
      this.extractFromInstagram(pageId),
      this.extractFromPixelConversions()
    ]);

    // Merge và deduplicate users
    const allUsers = [
      ...leadAdsUsers,
      ...facebookUsers,
      ...instagramUsers,
      ...pixelUsers
    ];

    const deduplicatedUsers = this.deduplicateUsers(allUsers);
    const enrichedUsers = await this.enrichUserData(deduplicatedUsers);

    // Lưu vào database
    await this.saveExtractedUsers(enrichedUsers);

    const executionTime = Date.now() - startTime;

    const result: UserDataExtractionResult = {
      success: true,
      totalUsersFound: enrichedUsers.length,
      bySource: {
        leadAds: leadAdsUsers.length,
        facebookComments: facebookUsers.filter(u => u.source === 'FACEBOOK_COMMENTS').length,
        facebookMessages: facebookUsers.filter(u => u.source === 'FACEBOOK_MESSAGES').length,
        instagram: instagramUsers.length,
        pixel: pixelUsers.length
      },
      highQualityLeads: enrichedUsers.filter(u => u.confidence >= 80).length,
      usersWithPhone: enrichedUsers.filter(u => u.phone).length,
      usersWithEmail: enrichedUsers.filter(u => u.email).length,
      usersWithBoth: enrichedUsers.filter(u => u.phone && u.email).length,
      executionTimeMs: executionTime,
      extractedAt: new Date(),
      users: enrichedUsers
    };

    console.log('✅ Comprehensive Extraction Complete!');
    console.log(`📊 Results: ${result.totalUsersFound} users, ${result.highQualityLeads} high-quality leads`);
    
    return result;
  }

  // Helper methods
  private async makeApiRequest(endpoint: string, accessToken: string, params: any = {}) {
    const url = new URL(`${this.facebookApiBase}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    url.searchParams.append('access_token', accessToken);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  private parseLeadFieldData(fieldData: any[]): any {
    const data: any = {};
    
    fieldData.forEach(field => {
      switch (field.name?.toLowerCase()) {
        case 'email':
          data.email = field.values[0];
          break;
        case 'phone_number':
        case 'phone':
          data.phone = field.values[0];
          break;
        case 'full_name':
        case 'name':
          data.name = field.values[0];
          break;
        case 'first_name':
          data.firstName = field.values[0];
          break;
        case 'last_name':
          data.lastName = field.values[0];
          break;
        case 'company_name':
        case 'company':
          data.company = field.values[0];
          break;
        case 'job_title':
          data.jobTitle = field.values[0];
          break;
        case 'city':
          data.city = field.values[0];
          break;
        case 'state':
          data.state = field.values[0];
          break;
        case 'country':
          data.country = field.values[0];
          break;
        default:
          data[field.name] = field.values[0];
      }
    });
    
    if (data.city || data.state || data.country) {
      data.location = [data.city, data.state, data.country].filter(Boolean).join(', ');
    }
    
    return data;
  }

  private extractFromText(text: string): ExtractedTextData {
    const data: ExtractedTextData = { confidence: 0 };

    // Phone extraction (Vietnamese patterns)
    const phonePatterns = [
      /(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/g,
      /0[1-9][0-9]{8,9}/g
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.phone = match[0];
        data.confidence += 30;
        break;
      }
    }

    // Email extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      data.email = emailMatch[0];
      data.confidence += 25;
    }

    // Age extraction
    const agePatterns = [
      /(?:tuổi|năm|age|years old)\s*(?:của)?\s*(\d{1,2})/gi,
      /(\d{1,2})\s*(?:tuổi|năm|years old)/gi
    ];

    for (const pattern of agePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.age = parseInt(match[1] || match[0]);
        data.confidence += 5;
        break;
      }
    }

    // Location extraction (Vietnamese cities)
    const locationPatterns = [
      /(?:ở|tại|from|live in|sống tại)\s*([A-Za-z\s]+?)(?:\s|$|,|\.)/gi,
      /(Hà Nội|TP\.?HCM|Hồ Chí Minh|Đà Nẵng|Hải Phòng|Cần Thơ|Nha Trang|Vũng Tàu|Huế|Quy Nhon)/gi
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.location = match[1] || match[0];
        data.confidence += 5;
        break;
      }
    }

    // Interest extraction (keywords)
    const interestKeywords = [
      'thời trang', 'du lịch', 'ăn uống', 'công nghệ', 'kinh doanh',
      'bất động sản', 'xe hơi', 'điện thoại', 'laptop', 'mỹ phẩm'
    ];

    data.interests = interestKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (data.interests.length > 0) {
      data.confidence += data.interests.length * 2;
    }

    return data;
  }

  private deduplicateUsers(users: UserDataSummary[]): UserDataSummary[] {
    const userMap = new Map<string, UserDataSummary>();

    for (const user of users) {
      // Tạo key duy nhất dựa trên phone/email/facebookUserId
      const key = user.phone || user.email || user.facebookUserId || `${user.userName}_${user.pageId}`;
      
      const existing = userMap.get(key);
      if (!existing || user.confidence > existing.confidence) {
        // Merge data nếu có
        if (existing) {
          user.additionalData = {
            ...existing.additionalData,
            ...user.additionalData,
            sources: [
              ...(existing.additionalData?.sources || [existing.source]),
              user.source
            ]
          };
        }
        userMap.set(key, user);
      }
    }

    return Array.from(userMap.values());
  }

  private async enrichUserData(users: UserDataSummary[]): Promise<UserDataSummary[]> {
    // TODO: Enrich with external APIs, social data, etc.
    return users.map(user => ({
      ...user,
      leadScore: this.calculateLeadScore(user),
      segment: this.determineUserSegment(user)
    }));
  }

  private calculateLeadScore(user: UserDataSummary): number {
    let score = 0;

    if (user.phone) score += 35;
    if (user.email) score += 30;
    if (user.company) score += 20;
    if (user.location) score += 10;
    if (user.age) score += 5;

    // Source bonus
    switch (user.source) {
      case 'FACEBOOK_LEAD_ADS': score += 25; break;
      case 'FACEBOOK_MESSAGES': score += 20; break;
      case 'FACEBOOK_COMMENTS': score += 15; break;
      case 'INSTAGRAM_COMMENTS': score += 10; break;
    }

    score += Math.round(user.confidence * 0.5);

    return Math.min(score, 100);
  }

  private determineUserSegment(user: UserDataSummary): string {
    const score = user.leadScore || this.calculateLeadScore(user);

    if (score >= 85) return 'HOT_LEAD';
    if (score >= 70) return 'WARM_LEAD';
    if (score >= 50) return 'COLD_LEAD';
    return 'PROSPECT';
  }

  private async saveExtractedUsers(users: UserDataSummary[]): Promise<void> {
    // Lưu vào facebook_leads table
    for (const user of users) {
      try {
        await prisma.facebook_leads.upsert({
          where: {
            facebookLeadId: user.sourceId
          },
          update: {
            updatedAt: new Date()
          },
          create: {
            facebookLeadId: user.sourceId,
            formId: user.additionalData?.formId || user.sourceId,
            formName: user.additionalData?.formName || user.source,
            pageId: user.pageId,
            pageName: user.pageName,
            userName: user.userName,
            email: user.email,
            phone: user.phone,
            company: user.company,
            location: user.location,
            rawData: JSON.stringify(user.additionalData),
            leadScore: user.leadScore || 0,
            leadSource: user.source,
            leadStatus: 'NEW',
            createdTime: user.extractedAt,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      } catch (error) {
        console.error(`Error saving user ${user.sourceId}:`, error);
      }
    }
  }
}

// Types
export interface UserDataSummary {
  source: string;
  sourceId: string;
  pageId: string;
  pageName: string;
  userName: string;
  facebookUserId?: string;
  facebookProfileLink?: string;
  instagramUsername?: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  age?: number;
  interests?: string[];
  extractedAt: Date;
  confidence: number;
  leadScore?: number;
  segment?: string;
  additionalData?: any;
}

export interface ExtractedTextData {
  phone?: string;
  email?: string;
  age?: number;
  location?: string;
  interests?: string[];
  confidence: number;
}

export interface UserDataExtractionResult {
  success: boolean;
  totalUsersFound: number;
  bySource: {
    leadAds: number;
    facebookComments: number;
    facebookMessages: number;
    instagram: number;
    pixel: number;
  };
  highQualityLeads: number;
  usersWithPhone: number;
  usersWithEmail: number;
  usersWithBoth: number;
  executionTimeMs: number;
  extractedAt: Date;
  users: UserDataSummary[];
}

// Export singleton instance
export const comprehensiveUserDataExtractor = new ComprehensiveUserDataExtractor();
