#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  ErrorCode, 
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// API Client for Tuesday API
// Response formats:
// - Single results (lookup, profile, auth): { data: {}, statusCode: 200, message: "Success" }
// - Search results (search endpoints): { data: [], statusCode: 201, message: "Success" }
class TuesdayAPIClient {
  private baseURL = 'https://api.tuesday.so/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      throw new Error(`API request failed: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  // Auth API
  async checkApiKey() {
    return this.makeRequest('/public/auth');
  }

  // People APIs
  async searchPeople(params: any) {
    return this.makeRequest('/people/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async lookupPerson(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/people/lookup?${query}`);
  }

  async lookupPersonByEmail(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/people/lookup/email?${query}`);
  }

  async lookupPersonByPhone(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/people/lookup/phone?${query}`);
  }

  async getPersonProfile(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/people/profile?${query}`);
  }

  // Company APIs
  async searchCompanies(params: any) {
    return this.makeRequest('/company/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getCompanyProfile(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/company/profile?${query}`);
  }

  async getEmployeeCount(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/company/employees/count?${query}`);
  }

  async searchEmployees(params: any) {
    return this.makeRequest('/company/employees/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

// Schema definitions
const ApiKeySchema = z.string().min(1, 'API key is required');

const PeopleSearchSchema = z.object({
  // Pagination
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(25),
  include_email: z.enum(['include', 'exclude']).default('exclude'),
  include_phone: z.enum(['include', 'exclude']).default('exclude'),
  
  // Person Filters
  person_titles: z.array(z.string()).optional(),
  person_not_titles: z.array(z.string()).optional(),
  person_past_titles: z.array(z.string()).optional(),
  person_seniorities: z.array(z.string()).optional(),
  person_location: z.array(z.string()).optional(),
  not_person_location: z.array(z.string()).optional(),
  person_days_in_current_title_range: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  
  // Organization Filters
  q_organization_domains: z.array(z.string()).optional(),
  not_q_organization_domains: z.array(z.string()).optional(),
  organization_location: z.array(z.string()).optional(),
  not_organization_location: z.array(z.string()).optional(),
  organization_industry: z.array(z.string()).optional(),
  organization_not_industry: z.array(z.string()).optional(),
  organization_sic_industry: z.array(z.string()).optional(),
  organization_not_sic_industry: z.array(z.string()).optional(),
  organization_naics_industry: z.array(z.string()).optional(),
  organization_not_naics_industry: z.array(z.string()).optional(),
  organization_revenue_ranges: z.array(z.string()).optional(),
  
  // Technology & Product Filters
  organization_technology: z.array(z.string()).optional(),
  organization_all_technology: z.array(z.string()).optional(),
  not_organization_technology: z.array(z.string()).optional(),
  organization_has_web_app: z.boolean().optional(),
  organization_has_mobile_app: z.boolean().optional(),
  organization_appstore_app_category: z.array(z.string()).optional(),
  organization_playstore_app_category: z.array(z.string()).optional(),
  organization_appstore_rating: z.object({
    min: z.number().min(1).max(5).optional(),
    max: z.number().min(1).max(5).optional(),
  }).optional(),
  organization_playstore_rating: z.object({
    min: z.number().min(1).max(5).optional(),
    max: z.number().min(1).max(5).optional(),
  }).optional(),
  organization_appstore_review_count: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_playstore_review_count: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_is_website_for_sale: z.boolean().optional(),
  
  // Web Traffic & Ads
  organization_website_traffic_total_monthly: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_website_traffic_monthly_organic: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_website_traffic_monthly_paid: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_monthly_google_adspend: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  
  // Funding Filters
  organization_funding_amount: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_funding_total_amount: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_funding_date: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_funding_type: z.array(z.string()).optional(),
  organization_funding_lead_investors: z.array(z.string()).optional(),
  organization_funding_number_of_investors: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  
  // Team & Roles
  organization_roles_count: z.array(z.object({
    department: z.string(),
    range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }),
  })).optional(),
  organization_open_roles_count: z.array(z.object({
    department: z.string(),
    range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }),
  })).optional(),
});

const PersonLookupSchema = z.object({
  company_domain: z.string().min(1, 'Company domain is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),
  include_email: z.enum(['include', 'exclude']).default('exclude'),
  include_phone: z.enum(['include', 'exclude']).default('exclude'),
});

const EmailLookupSchema = z.object({
  email: z.string().email('Valid email is required'),
  include_phone: z.enum(['include', 'exclude']).default('exclude'),
});

const PhoneLookupSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  include_email: z.enum(['include', 'exclude']).default('exclude'),
});

const PersonProfileSchema = z.object({
  linkedin_url: z.string().url('Valid LinkedIn URL is required'),
  include_email: z.enum(['include', 'exclude']).default('exclude'),
  include_phone: z.enum(['include', 'exclude']).default('exclude'),
});

const CompanySearchSchema = z.object({
  // Pagination
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(25),
  funding: z.enum(['include', 'exclude']).default('exclude'),
  extra: z.enum(['include', 'exclude']).default('exclude'),
  technology: z.enum(['include', 'exclude']).default('exclude'),
  website_traffic: z.enum(['include', 'exclude']).default('exclude'),
  headcount_growth: z.enum(['include', 'exclude']).default('exclude'),
  
  // Person Filters (shared with people search)
  person_titles: z.array(z.string()).optional(),
  person_not_titles: z.array(z.string()).optional(),
  person_past_titles: z.array(z.string()).optional(),
  person_seniorities: z.array(z.string()).optional(),
  person_location: z.array(z.string()).optional(),
  not_person_location: z.array(z.string()).optional(),
  person_days_in_current_title_range: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  
  // Organization Filters
  q_organization_domains: z.array(z.string()).optional(),
  not_q_organization_domains: z.array(z.string()).optional(),
  organization_location: z.array(z.string()).optional(),
  not_organization_location: z.array(z.string()).optional(),
  organization_industry: z.array(z.string()).optional(),
  organization_not_industry: z.array(z.string()).optional(),
  organization_sic_industry: z.array(z.string()).optional(),
  organization_not_sic_industry: z.array(z.string()).optional(),
  organization_naics_industry: z.array(z.string()).optional(),
  organization_not_naics_industry: z.array(z.string()).optional(),
  organization_revenue_ranges: z.array(z.string()).optional(),
  
  // Technology & Product Filters
  organization_technology: z.array(z.string()).optional(),
  organization_all_technology: z.array(z.string()).optional(),
  not_organization_technology: z.array(z.string()).optional(),
  organization_has_web_app: z.boolean().optional(),
  organization_has_mobile_app: z.boolean().optional(),
  organization_appstore_app_category: z.array(z.string()).optional(),
  organization_playstore_app_category: z.array(z.string()).optional(),
  organization_appstore_rating: z.object({
    min: z.number().min(1).max(5).optional(),
    max: z.number().min(1).max(5).optional(),
  }).optional(),
  organization_playstore_rating: z.object({
    min: z.number().min(1).max(5).optional(),
    max: z.number().min(1).max(5).optional(),
  }).optional(),
  organization_appstore_review_count: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_playstore_review_count: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_is_website_for_sale: z.boolean().optional(),
  
  // Web Traffic & Ads
  organization_website_traffic_total_monthly: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_website_traffic_monthly_organic: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_website_traffic_monthly_paid: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_monthly_google_adspend: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  
  // Funding Filters
  organization_funding_amount: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_funding_total_amount: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_funding_date: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  organization_funding_type: z.array(z.string()).optional(),
  organization_funding_lead_investors: z.array(z.string()).optional(),
  organization_funding_number_of_investors: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  
  // Team & Roles
  organization_roles_count: z.array(z.object({
    department: z.string(),
    range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }),
  })).optional(),
  organization_open_roles_count: z.array(z.object({
    department: z.string(),
    range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }),
  })).optional(),
});

const CompanyProfileSchema = z.object({
  linkedin_url: z.string().url(),
  domain: z.string().optional(),
  include_funding: z.enum(['include', 'exclude']).default('exclude'),
  include_technology: z.enum(['include', 'exclude']).default('exclude'),
  include_contacts: z.enum(['include', 'exclude']).default('exclude'),
}).refine(data => data.linkedin_url || data.domain, {
  message: 'Either linkedin_url or domain is required',
});

const EmployeeCountSchema = z.object({
  linkedin_url: z.string().url().optional(),
  domain: z.string().optional(),
}).refine(data => data.linkedin_url || data.domain, {
  message: 'Either linkedin_url or domain is required',
});

const EmployeeSearchSchema = z.object({
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(25),
  include_email: z.enum(['include', 'exclude']).default('exclude'),
  include_phone: z.enum(['include', 'exclude']).default('exclude'),
  company_domain: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  person_titles: z.array(z.string()).optional(),
  person_not_titles: z.array(z.string()).optional(),
  person_seniorities: z.array(z.string()).optional(),
  person_location: z.array(z.string()).optional(),
  not_person_location: z.array(z.string()).optional(),
}).refine(data => data.company_domain || data.linkedin_url, {
  message: 'Either company_domain or linkedin_url is required',
});

// Main server implementation
async function createServer() {
  const server = new Server(
    {
      name: 'tuesday-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Get API key from environment or tool arguments
  const getApiKey = (args: any): string => {
    const apiKey = args.api_key || process.env.TUESDAY_API_KEY;
    if (!apiKey) {
      throw new Error('API key is required. Set TUESDAY_API_KEY environment variable or provide api_key parameter.');
    }
    return ApiKeySchema.parse(apiKey);
  };

  // Tools call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const apiKey = getApiKey(args);
      const client = new TuesdayAPIClient(apiKey);

      switch (name) {
        case 'check_api_key':
          const authResult = await client.checkApiKey();
          return {
            content: [
              {
                type: 'text',
                text: `API Key validated successfully!\n\nWorkspace: ${authResult.data.name}\nID: ${authResult.data.id}\nUser ID: ${authResult.data.user_id}`,
              },
            ],
          };

        case 'search_people':
          const peopleSearchParams = PeopleSearchSchema.parse(args);
          const peopleResults = await client.searchPeople(peopleSearchParams);
          return {
            content: [
              {
                type: 'text',
                text: `Found ${peopleResults.data.length} people (Page ${peopleSearchParams.page || 1}):\n\n${JSON.stringify(peopleResults.data, null, 2)}`,
              },
            ],
          };

        case 'lookup_person':
          const lookupParams = PersonLookupSchema.parse(args);
          const personResult = await client.lookupPerson(lookupParams);
          return {
            content: [
              {
                type: 'text',
                text: `Person found:\n\n${JSON.stringify(personResult.data, null, 2)}`,
              },
            ],
          };

        case 'lookup_person_by_email':
          const emailParams = EmailLookupSchema.parse(args);
          const emailResult = await client.lookupPersonByEmail(emailParams);
          return {
            content: [
              {
                type: 'text',
                text: `Person found by email:\n\n${JSON.stringify(emailResult.data, null, 2)}`,
              },
            ],
          };

        case 'lookup_person_by_phone':
          const phoneParams = PhoneLookupSchema.parse(args);
          const phoneResult = await client.lookupPersonByPhone(phoneParams);
          return {
            content: [
              {
                type: 'text',
                text: `Person found by phone:\n\n${JSON.stringify(phoneResult.data, null, 2)}`,
              },
            ],
          };

        case 'get_person_profile':
          const profileParams = PersonProfileSchema.parse(args);
          const profile = await client.getPersonProfile(profileParams);
          return {
            content: [
              {
                type: 'text',
                text: `Person profile:\n\n${JSON.stringify(profile.data, null, 2)}`,
              },
            ],
          };

        case 'search_companies':
          const companySearchParams = CompanySearchSchema.parse(args);
          const companyResults = await client.searchCompanies(companySearchParams);
          return {
            content: [
              {
                type: 'text',
                text: `Found ${companyResults.data.length} companies (Page ${companySearchParams.page || 1}):\n\n${JSON.stringify(companyResults.data, null, 2)}`,
              },
            ],
          };

        case 'get_company_profile':
          const companyProfileParams = CompanyProfileSchema.parse(args);
          const companyProfile = await client.getCompanyProfile(companyProfileParams);
          return {
            content: [
              {
                type: 'text',
                text: `Company profile:\n\n${JSON.stringify(companyProfile.data, null, 2)}`,
              },
            ],
          };

        case 'get_employee_count':
          const employeeCountParams = EmployeeCountSchema.parse(args);
          const employeeCount = await client.getEmployeeCount(employeeCountParams);
          return {
            content: [
              {
                type: 'text',
                text: `Employee count:\n\n${JSON.stringify(employeeCount.data, null, 2)}`,
              },
            ],
          };

        case 'search_employees':
          const employeeSearchParams = EmployeeSearchSchema.parse(args);
          const employeeResults = await client.searchEmployees(employeeSearchParams);
          return {
            content: [
              {
                type: 'text',
                text: `Found ${employeeResults.data.length} employees (Page ${employeeSearchParams.page || 1}):\n\n${JSON.stringify(employeeResults.data, null, 2)}`,
              },
            ],
          };

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      );
    }
  });

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  return server;
}

// Tool definitions
const tools = [
  {
    name: 'check_api_key',
    description: 'Validate your Tuesday API key and retrieve workspace information',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
      },
    },
  },
  {
    name: 'search_people',
    description: 'Search for people using advanced filters and criteria',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)',
          minimum: 1,
        },
        per_page: {
          type: 'number',
          description: 'Results per page (max: 100, default: 25)',
          minimum: 1,
          maximum: 100,
        },
        include_email: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include email addresses (+2 credits per result)',
        },
        include_phone: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include phone numbers (+3 credits per result)',
        },
        person_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current job titles to include',
        },
        person_not_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude these current job titles',
        },
        person_past_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Match against past job titles',
        },
        person_seniorities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by seniority level',
        },
        person_location: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current person location',
        },
        not_person_location: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude people in these locations',
        },
        q_organization_domains: {
          type: 'array',
          items: { type: 'string' },
          description: 'Match organization domains',
        },
        not_q_organization_domains: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude organizations with these domains',
        },
        organization_location: {
          type: 'array',
          items: { type: 'string' },
          description: 'Company HQ/location',
        },
      },
    },
  },
  {
    name: 'lookup_person',
    description: 'Find a person using name, company, and other identifying information',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        company_domain: {
          type: 'string',
          description: 'Domain of the company (required)',
        },
        first_name: {
          type: 'string',
          description: 'First name of the person (required)',
        },
        last_name: {
          type: 'string',
          description: 'Last name of the person (optional but recommended)',
        },
        title: {
          type: 'string',
          description: 'Job title or role',
        },
        location: {
          type: 'string',
          description: 'Location (city, state, or country)',
        },
        include_email: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include email address (+2 credits)',
        },
        include_phone: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include phone number (+3 credits)',
        },
      },
      required: ['company_domain', 'first_name'],
    },
  },
  {
    name: 'lookup_person_by_email',
    description: 'Find a person using their email address',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        email: {
          type: 'string',
          description: 'Email address to look up (required)',
        },
        include_phone: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include phone number (+3 credits)',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'lookup_person_by_phone',
    description: 'Find a person using their phone number',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        phone: {
          type: 'string',
          description: 'Phone number to look up (required)',
        },
        include_email: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include email address (+2 credits)',
        },
      },
      required: ['phone'],
    },
  },
  {
    name: 'get_person_profile',
    description: 'Get comprehensive profile information for a person using their LinkedIn URL',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        linkedin_url: {
          type: 'string',
          description: 'LinkedIn profile URL (required)',
        },
        include_email: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include email address (+2 credits)',
        },
        include_phone: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include phone number (+3 credits)',
        },
      },
      required: ['linkedin_url'],
    },
  },
  {
    name: 'search_companies',
    description: 'Search for companies using advanced filters including industry, size, location, and more',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)',
          minimum: 1,
        },
        per_page: {
          type: 'number',
          description: 'Results per page (max: 100, default: 25)',
          minimum: 1,
          maximum: 100,
        },
        funding: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include funding details (+1 credit per result)',
        },
        extra: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include extended company details (+1 credit per result)',
        },
        technology: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include technology details (+2 credits per result)',
        },
        website_traffic: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include website traffic details (+1 credit per result)',
        },
        headcount_growth: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include headcount growth details (+1 credit per result)',
        },
        person_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current job titles to include',
        },
        person_not_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude these current job titles',
        },
        person_past_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Match against past job titles',
        },
        person_seniorities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by seniority level',
        },
        person_location: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current person location',
        },
        not_person_location: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude people in these locations',
        },
      },
    },
  },
  {
    name: 'get_company_profile',
    description: 'Get comprehensive company information using LinkedIn URL or domain',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        linkedin_url: {
          type: 'string',
          description: 'LinkedIn company page URL',
        },
        domain: {
          type: 'string',
          description: 'Company domain name',
        },
        include_funding: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include funding and investment information (+2 credits)',
        },
        include_technology: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include technology stack (+1 credit)',
        },
        include_contacts: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include key executive contacts (+3 credits)',
        },
      },
    },
  },
  {
    name: 'get_employee_count',
    description: 'Get employee count and headcount information for a company',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        linkedin_url: {
          type: 'string',
          description: 'LinkedIn company page URL',
        },
        domain: {
          type: 'string',
          description: 'Company domain name',
        },
      },
    },
  },
  {
    name: 'search_employees',
    description: 'Search for employees within a specific company',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'Tuesday API key (optional if TUESDAY_API_KEY environment variable is set)',
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)',
          minimum: 1,
        },
        per_page: {
          type: 'number',
          description: 'Results per page (max: 100, default: 25)',
          minimum: 1,
          maximum: 100,
        },
        include_email: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include email addresses (+2 credits per result)',
        },
        include_phone: {
          type: 'string',
          enum: ['include', 'exclude'],
          description: 'Include phone numbers (+3 credits per result)',
        },
        company_domain: {
          type: 'string',
          description: 'Company domain to search within',
        },
        linkedin_url: {
          type: 'string',
          description: 'LinkedIn company page URL',
        },
        person_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current job titles to include',
        },
        person_not_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude these current job titles',
        },
        person_seniorities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by seniority level',
        },
        person_location: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current person location',
        },
        not_person_location: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude people in these locations',
        },
      },
    },
  },
];

// Main function
async function main() {
  const server = await createServer();
  
  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Tuesday MCP server started successfully');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 