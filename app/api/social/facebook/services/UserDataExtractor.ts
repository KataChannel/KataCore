import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExtractedUserData {
  phone?: string;
  email?: string;
  age?: number;
  location?: string;
  interests?: string[];
  confidence: number;
}

export interface UserInteractionData {
  facebookUserId: string;
  facebookUserName: string;
  facebookProfileLink?: string;
  facebookPageId: string;
  interactionType: 'COMMENT' | 'MESSAGE' | 'LIKE' | 'SHARE';
  content?: string;
  sourceId: string;
  sourceType: string;
  interactionTime: Date;
  extractedData?: ExtractedUserData;
}

export class FacebookUserDataExtractor {
  // Phone number patterns (Vietnamese + International)
  private phonePatterns = [
    /(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/g,
    /(?:\(?[\+]?[0-9]*\)?)?[0-9_\- \(\)]*$/g,
    /0[1-9][0-9]{8,9}/g,
    /\+84[1-9][0-9]{8,9}/g
  ];

  // Email patterns
  private emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // Age patterns
  private agePatterns = [
    /(?:tuổi|năm|age|years old)\s*(?:của)?\s*(\d{1,2})/gi,
    /(\d{1,2})\s*(?:tuổi|năm|years old)/gi,
    /(?:tôi|mình|em)\s*(\d{1,2})\s*(?:tuổi|năm)/gi
  ];

  // Location patterns (Vietnamese cities/provinces)
  private locationPatterns = [
    /(?:ở|tại|from|live in|sống tại)\s*([A-Za-z\s]+?)(?:\s|$|,|\.)/gi,
    /(Hà Nội|TP\.?HCM|Hồ Chí Minh|Đà Nẵng|Hải Phòng|Cần Thơ|Nha Trang|Vũng Tàu|Huế|Quy Nhon)/gi
  ];

  /**
   * Extract phone number from text
   */
  extractPhone(text: string): { phone?: string; confidence: number } {
    if (!text) return { confidence: 0 };

    const cleanText = text.replace(/[^\d\+\(\)\-\s]/g, ' ');
    
    for (const pattern of this.phonePatterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleanPhone = match.replace(/[\s\-\(\)]/g, '');
          
          // Vietnamese phone validation
          if (this.isValidVietnamesePhone(cleanPhone)) {
            return {
              phone: this.normalizePhone(cleanPhone),
              confidence: 0.9
            };
          }
        }
      }
    }

    return { confidence: 0 };
  }

  /**
   * Extract email from text
   */
  extractEmail(text: string): { email?: string; confidence: number } {
    if (!text) return { confidence: 0 };

    const matches = text.match(this.emailPattern);
    if (matches && matches.length > 0) {
      return {
        email: matches[0].toLowerCase(),
        confidence: 0.95
      };
    }

    return { confidence: 0 };
  }

  /**
   * Extract age from text
   */
  extractAge(text: string): { age?: number; confidence: number } {
    if (!text) return { confidence: 0 };

    for (const pattern of this.agePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const ageStr = match[1];
        if (ageStr) {
          const age = parseInt(ageStr);
          
          if (age >= 10 && age <= 100) {
            return {
              age,
              confidence: 0.8
            };
          }
        }
      }
    }

    return { confidence: 0 };
  }

  /**
   * Extract location from text
   */
  extractLocation(text: string): { location?: string; confidence: number } {
    if (!text) return { confidence: 0 };

    for (const pattern of this.locationPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const location = match[1]?.trim();
        if (location && location.length > 2) {
          return {
            location,
            confidence: 0.7
          };
        }
      }
    }

    return { confidence: 0 };
  }

  /**
   * Extract interests/keywords from text
   */
  extractInterests(text: string): { interests?: string[]; confidence: number } {
    if (!text) return { confidence: 0 };

    const businessKeywords = [
      'spa', 'massage', 'beauty', 'skincare', 'facial', 'nail', 'lashes', 'brows',
      'wellness', 'therapy', 'treatment', 'salon', 'clinic', 'cosmetic',
      'làm đẹp', 'chăm sóc da', 'thẩm mỹ', 'massage', 'spa', 'điều trị'
    ];

    const interests: string[] = [];
    const lowerText = text.toLowerCase();

    for (const keyword of businessKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        interests.push(keyword);
      }
    }

    if (interests.length > 0) {
      return {
        interests,
        confidence: 0.6
      };
    }

    return { confidence: 0 };
  }

  /**
   * Comprehensive data extraction from text
   */
  extractAllData(text: string): ExtractedUserData {
    const phone = this.extractPhone(text);
    const email = this.extractEmail(text);
    const age = this.extractAge(text);
    const location = this.extractLocation(text);
    const interests = this.extractInterests(text);

    const avgConfidence = [
      phone.confidence,
      email.confidence,
      age.confidence,
      location.confidence,
      interests.confidence
    ].reduce((sum, conf) => sum + conf, 0) / 5;

    return {
      phone: phone.phone,
      email: email.email,
      age: age.age,
      location: location.location,
      interests: interests.interests,
      confidence: avgConfidence
    };
  }

  /**
   * Validate Vietnamese phone number
   */
  private isValidVietnamesePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[\+\s\-\(\)]/g, '');
    
    // Vietnamese phone patterns
    const patterns = [
      /^84[1-9]\d{8,9}$/,  // +84 format
      /^0[1-9]\d{8,9}$/,   // 0 format
      /^[1-9]\d{8,9}$/     // Without country code
    ];

    return patterns.some(pattern => pattern.test(cleanPhone));
  }

  /**
   * Normalize phone number to consistent format
   */
  private normalizePhone(phone: string): string {
    let clean = phone.replace(/[\s\-\(\)]/g, '');
    
    // Convert to +84 format
    if (clean.startsWith('0')) {
      clean = '+84' + clean.substring(1);
    } else if (clean.startsWith('84')) {
      clean = '+' + clean;
    } else if (!clean.startsWith('+84')) {
      clean = '+84' + clean;
    }
    
    return clean;
  }

  /**
   * Process user interaction and extract data
   */
  async processUserInteraction(interaction: UserInteractionData): Promise<void> {
    try {
      console.log(`Processing interaction for user: ${interaction.facebookUserName}`);

      // Extract data from content
      let extractedData: ExtractedUserData = { confidence: 0 };
      if (interaction.content) {
        extractedData = this.extractAllData(interaction.content);
      }

      // Get Facebook user info via API if possible
      const userProfileData = await this.fetchFacebookUserData(interaction.facebookUserId);
      
      // Merge extracted data with profile data
      const mergedData = this.mergeUserData(extractedData, userProfileData);

      // Store or update user interaction
      await this.upsertUserInteraction(interaction, mergedData);

      // Store interaction history
      await this.storeInteractionHistory(interaction, extractedData);

      console.log(`Processed interaction for ${interaction.facebookUserName} with confidence: ${mergedData.confidence}`);

    } catch (error) {
      console.error('Error processing user interaction:', error);
    }
  }

  /**
   * Fetch Facebook user data via Graph API
   */
  private async fetchFacebookUserData(userId: string): Promise<Partial<ExtractedUserData>> {
    try {
      const accessToken = process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN;
      if (!accessToken) return {};

      const response = await fetch(
        `https://graph.facebook.com/v23.0/${userId}?fields=id,name,age_range,location,hometown,email&access_token=${accessToken}`
      );

      if (!response.ok) return {};

      const userData = await response.json();
      
      return {
        age: userData.age_range?.min || undefined,
        location: userData.location?.name || userData.hometown?.name || undefined,
        email: userData.email || undefined,
        confidence: 0.95 // High confidence for direct API data
      };

    } catch (error) {
      console.error('Error fetching Facebook user data:', error);
      return {};
    }
  }

  /**
   * Merge extracted data with API data
   */
  private mergeUserData(extracted: ExtractedUserData, apiData: Partial<ExtractedUserData>): ExtractedUserData {
    return {
      phone: extracted.phone || undefined,
      email: apiData.email || extracted.email || undefined,
      age: apiData.age || extracted.age || undefined,
      location: apiData.location || extracted.location || undefined,
      interests: extracted.interests || undefined,
      confidence: Math.max(extracted.confidence, apiData.confidence || 0)
    };
  }

  /**
   * Upsert user interaction record using existing facebook_interactions table
   */
  private async upsertUserInteraction(
    interaction: UserInteractionData, 
    extractedData: ExtractedUserData
  ): Promise<void> {
    const now = new Date();

    // For now, store in existing facebook_interactions table with enhanced data
    await prisma.facebook_interactions.upsert({
      where: {
        facebookInteractionId: `${interaction.facebookUserId}_${interaction.facebookPageId}_${interaction.sourceId}`
      },
      update: {
        userName: interaction.facebookUserName,
        message: interaction.content || '',
        updatedAt: now
      },
      create: {
        facebookInteractionId: `${interaction.facebookUserId}_${interaction.facebookPageId}_${interaction.sourceId}`,
        facebookPageId: interaction.facebookPageId,
        type: interaction.interactionType as any,
        userName: interaction.facebookUserName,
        userId: interaction.facebookUserId,
        message: interaction.content || '',
        createdAt: now,
        updatedAt: now
      }
    });

    // Store extracted data in a separate JSON field or create a custom tracking table
    console.log(`Stored interaction for ${interaction.facebookUserName}:`, extractedData);
  }

  /**
   * Store interaction history in a simple JSON log
   */
  private async storeInteractionHistory(
    interaction: UserInteractionData,
    extractedData: ExtractedUserData
  ): Promise<void> {
    // For now, log to console or store in a simple table
    console.log('Interaction History:', {
      user: interaction.facebookUserName,
      type: interaction.interactionType,
      time: interaction.interactionTime,
      extractedData
    });
  }

  /**
   * Calculate lead score based on extracted data and interaction
   */
  private calculateLeadScore(data: ExtractedUserData, interaction: UserInteractionData): number {
    let score = 0;

    // Contact info points
    if (data.phone) score += 30;
    if (data.email) score += 20;
    if (data.location) score += 10;
    if (data.age) score += 5;

    // Interest points
    if (data.interests && data.interests.length > 0) {
      score += data.interests.length * 5;
    }

    // Interaction type points
    switch (interaction.interactionType) {
      case 'MESSAGE': score += 25; break;
      case 'COMMENT': score += 15; break;
      case 'SHARE': score += 10; break;
      case 'LIKE': score += 5; break;
    }

    // Confidence bonus
    score += Math.round(data.confidence * 10);

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Determine user segment based on data
   */
  private determineUserSegment(data: ExtractedUserData, interaction: UserInteractionData): string {
    const score = this.calculateLeadScore(data, interaction);

    if (score >= 80) return 'HOT_LEAD';
    if (score >= 60) return 'WARM_LEAD';
    if (score >= 40) return 'COLD_LEAD';
    return 'PROSPECT';
  }
}

export const userDataExtractor = new FacebookUserDataExtractor();
