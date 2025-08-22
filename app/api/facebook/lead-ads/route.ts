import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simplified Facebook API service for Lead Ads
class FacebookLeadAdsService {
  async makeApiRequest(endpoint: string, params: any = {}) {
    const { access_token, method = 'GET', ...otherParams } = params;
    
    const url = new URL(`https://graph.facebook.com/v23.0${endpoint}`);
    
    // Add parameters to URL for GET requests
    if (method === 'GET') {
      Object.entries(otherParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      url.searchParams.append('access_token', access_token);
    }

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST requests
    if (method === 'POST') {
      requestInit.body = JSON.stringify({
        access_token,
        ...otherParams
      });
    }

    const response = await fetch(url.toString(), requestInit);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }
}

const facebookLeadAdsService = new FacebookLeadAdsService();

// Lead Ads API - Cách HỢP PHÁP nhất để lấy phone/email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const formId = searchParams.get('formId');

    if (formId) {
      // Lấy leads từ form cụ thể
      return await getFormLeads(formId);
    } else if (pageId) {
      // Lấy tất cả lead forms của page
      return await getPageLeadForms(pageId);
    } else {
      // Lấy tất cả lead forms
      return await getAllLeadForms();
    }
  } catch (error) {
    console.error('Lead Ads API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch lead ads data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Lấy tất cả Lead Forms từ tất cả pages
async function getAllLeadForms() {
  const pages = await prisma.facebook_pages.findMany({
    where: {
      accessToken: { not: null }
    }
  });

  const allForms = [];
  const allLeads = [];

  for (const page of pages) {
    try {
      // Lấy Lead Forms
      const leadForms = await facebookLeadAdsService.makeApiRequest(
        `/${page.facebookPageId}/leadgen_forms`,
        {
          fields: 'id,name,status,leads_count,created_time,questions',
          access_token: page.accessToken
        }
      );

      if (leadForms.data) {
        for (const form of leadForms.data) {
          allForms.push({
            ...form,
            pageId: page.facebookPageId,
            pageName: page.name
          });

          // Lấy leads từ mỗi form
          const leads = await getFormLeadsData(form.id, page.accessToken || '');
          allLeads.push(...leads.map((lead: any) => ({
            ...lead,
            formId: form.id,
            formName: form.name,
            pageId: page.facebookPageId,
            pageName: page.name
          })));
        }
      }
    } catch (error) {
      console.error(`Error fetching lead forms for page ${page.facebookPageId}:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      forms: allForms,
      leads: allLeads,
      summary: {
        totalForms: allForms.length,
        totalLeads: allLeads.length,
        pagesProcessed: pages.length
      }
    }
  });
}

// Lấy Lead Forms của một page cụ thể
async function getPageLeadForms(pageId: string) {
  const page = await prisma.facebook_pages.findFirst({
    where: { facebookPageId: pageId }
  });

  if (!page || !page.accessToken) {
    return NextResponse.json({
      success: false,
      error: 'Page not found or access token missing'
    }, { status: 404 });
  }

  try {
    const leadForms = await facebookLeadAdsService.makeApiRequest(
      `/${pageId}/leadgen_forms`,
      {
        fields: 'id,name,status,leads_count,created_time,questions',
        access_token: page.accessToken
      }
    );

    const forms = leadForms.data || [];
    const allLeads = [];

    for (const form of forms) {
      const leads = await getFormLeadsData(form.id, page.accessToken);
      allLeads.push(...leads.map((lead: any) => ({
        ...lead,
        formId: form.id,
        formName: form.name
      })));
    }

    return NextResponse.json({
      success: true,
      data: {
        page: {
          id: page.facebookPageId,
          name: page.name
        },
        forms,
        leads: allLeads,
        summary: {
          totalForms: forms.length,
          totalLeads: allLeads.length
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching lead forms for page ${pageId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch lead forms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Lấy leads từ form cụ thể
async function getFormLeads(formId: string) {
  try {
    // Tìm page có form này
    const pages = await prisma.facebook_pages.findMany({
      where: { accessToken: { not: null } }
    });

    for (const page of pages) {
      try {
        const leads = await getFormLeadsData(formId, page.accessToken || '');
        
        if (leads.length > 0) {
          return NextResponse.json({
            success: true,
            data: {
              formId,
              leads: leads.map((lead: any) => ({
                ...lead,
                pageId: page.facebookPageId,
                pageName: page.name
              })),
              summary: {
                totalLeads: leads.length
              }
            }
          });
        }
      } catch (error) {
        // Continue với page tiếp theo
        continue;
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Form not found or no access'
    }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching leads for form ${formId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch form leads',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function để lấy leads data từ form
async function getFormLeadsData(formId: string, accessToken: string) {
  try {
    const leadsResponse = await facebookLeadAdsService.makeApiRequest(
      `/${formId}/leads`,
      {
        fields: 'id,created_time,field_data',
        access_token: accessToken,
        limit: 100
      }
    );

    const leads = (leadsResponse.data || []).map((lead: any) => {
      const extractedData = extractLeadFieldData(lead.field_data || []);
      
      return {
        id: lead.id,
        createdTime: lead.created_time,
        userData: extractedData,
        rawFieldData: lead.field_data
      };
    });

    // Lưu vào database
    for (const lead of leads) {
      if (lead.userData.email || lead.userData.phone) {
        await saveLeadToDatabase(lead, formId);
      }
    }

    return leads;
  } catch (error) {
    console.error(`Error fetching leads data for form ${formId}:`, error);
    return [];
  }
}

// Extract dữ liệu từ field_data của Lead Ads
function extractLeadFieldData(fieldData: any[]): {
  phone?: string;
  email?: string;
  name?: string;
  company?: string;
  [key: string]: any;
} {
  const data: any = {};
  
  fieldData.forEach(field => {
    switch (field.name.toLowerCase()) {
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
      case 'zip_code':
        data.zipCode = field.values[0];
        break;
      case 'country':
        data.country = field.values[0];
        break;
      default:
        data[field.name] = field.values[0];
    }
  });
  
  return data;
}

// Lưu lead vào database
async function saveLeadToDatabase(lead: any, formId: string) {
  try {
    await prisma.facebook_leads.upsert({
      where: {
        facebookLeadId: lead.id
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        facebookLeadId: lead.id,
        formId: formId,
        userName: lead.userData.name || `${lead.userData.firstName || ''} ${lead.userData.lastName || ''}`.trim(),
        email: lead.userData.email,
        phone: lead.userData.phone,
        company: lead.userData.company,
        jobTitle: lead.userData.jobTitle,
        location: [lead.userData.city, lead.userData.state, lead.userData.country]
          .filter(Boolean).join(', ') || undefined,
        rawData: JSON.stringify(lead.userData),
        leadScore: calculateLeadScore(lead.userData),
        leadSource: 'FACEBOOK_LEAD_AD',
        createdTime: new Date(lead.createdTime),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error saving lead to database:', error);
  }
}

// Tính lead score
function calculateLeadScore(userData: any): number {
  let score = 0;
  
  if (userData.email) score += 30;
  if (userData.phone) score += 35;
  if (userData.name || userData.firstName) score += 15;
  if (userData.company) score += 20;
  if (userData.jobTitle) score += 10;
  if (userData.city || userData.state) score += 10;
  
  return Math.min(score, 100);
}

// POST method để tạo Lead Form mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, formData } = body;

    if (!pageId || !formData) {
      return NextResponse.json({
        success: false,
        error: 'Missing pageId or formData'
      }, { status: 400 });
    }

    const page = await prisma.facebook_pages.findFirst({
      where: { facebookPageId: pageId }
    });

    if (!page || !page.accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Page not found or access token missing'
      }, { status: 404 });
    }

    // Tạo Lead Form mới
    const newForm = await facebookLeadAdsService.makeApiRequest(
      `/${pageId}/leadgen_forms`,
      {
        method: 'POST',
        access_token: page.accessToken,
        ...formData
      }
    );

    return NextResponse.json({
      success: true,
      data: newForm
    });
  } catch (error) {
    console.error('Error creating lead form:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create lead form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
