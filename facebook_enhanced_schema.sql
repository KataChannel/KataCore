-- Enhanced Facebook User Interactions Table
-- Add this to your prisma schema.prisma

model facebook_user_interactions {
  id                    String          @id @default(uuid())
  facebookUserId        String          // Facebook User ID
  facebookUserName      String          // Full name from Facebook
  facebookProfileLink   String?         // Facebook profile URL  
  
  // Extracted/Detected Information
  extractedPhone        String?         // Phone found in comments/messages
  extractedAge          Int?            // Age detected from profile/text
  extractedLocation     String?         // Location mentioned
  extractedEmail        String?         // Email found in text
  extractedInterests    Json?           // Interests/keywords mentioned
  
  // Interaction Analytics
  facebookPageId        String          // Which page they interacted with
  interactionType       String          // COMMENT, MESSAGE, LIKE, SHARE
  firstInteractionTime  DateTime        // First time they interacted
  lastInteractionTime   DateTime        // Most recent interaction
  totalInteractions     Int             @default(1)
  
  // Engagement Metrics
  totalComments         Int             @default(0)
  totalMessages         Int             @default(0)
  totalLikes            Int             @default(0)
  totalShares           Int             @default(0)
  
  // Behavioral Data
  avgResponseTime       Int?            // Average response time in minutes
  preferredInteractionTime String?      // Morning, Afternoon, Evening, Night
  lastSeenOnline        DateTime?       // Last activity time
  isActiveUser          Boolean         @default(true)
  
  // Classification
  userSegment           String?         // HOT_LEAD, WARM_LEAD, COLD_LEAD, CUSTOMER
  leadScore             Int             @default(0) // 0-100
  customerStage         String?         // PROSPECT, QUALIFIED, CUSTOMER, CHURNED
  
  // Metadata
  dataSource            String          @default("FACEBOOK") // FACEBOOK, EXTRACTED, MANUAL
  confidence            Float           @default(0.0) // Confidence in extracted data (0-1)
  notes                 String?         // Manual notes
  tags                  Json?           // Custom tags
  
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  
  // Relations
  facebook_pages        facebook_pages  @relation(fields: [facebookPageId], references: [facebookPageId], onDelete: Cascade)
  interaction_history   facebook_interaction_history[]
  
  @@unique([facebookUserId, facebookPageId])
  @@index([facebookPageId])
  @@index([lastInteractionTime])
  @@index([userSegment])
  @@index([leadScore])
}

model facebook_interaction_history {
  id                    String          @id @default(uuid())
  facebookUserId        String          
  facebookPageId        String
  interactionType       String          // COMMENT, MESSAGE, LIKE, SHARE
  sourceId              String          // ID of comment/message/post
  sourceType            String          // POST_COMMENT, MESSAGE, POST_LIKE, POST_SHARE
  content               String?         // Content of interaction
  extractedData         Json?           // Any data extracted from this interaction
  interactionTime       DateTime
  
  createdAt             DateTime        @default(now())
  
  // Relations
  facebook_user_interactions facebook_user_interactions @relation(fields: [facebookUserId, facebookPageId], references: [facebookUserId, facebookPageId], onDelete: Cascade)
  
  @@index([facebookUserId, facebookPageId])
  @@index([interactionTime])
  @@index([sourceType])
}
