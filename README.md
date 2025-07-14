# Tuesday MCP Server

A comprehensive Model Context Protocol (MCP) server for the Tuesday Leads API, enabling AI assistants to search for people and companies using natural language queries with advanced filtering capabilities.

## Features

- **Complete Tuesday API Coverage**: All endpoints including people search, company search, lookups, and profiles
- **Advanced Filtering**: 50+ filter parameters including funding, technology, web traffic, and team composition
- **AI-Friendly**: Natural language processing with intelligent query interpretation
- **Flexible Authentication**: Environment variables or per-request API keys
- **Rich Data Access**: Email, phone, funding, technology, and contact information
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Error Handling**: Comprehensive error handling and user-friendly messages

## Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- A Tuesday API key (get one at [app.tuesday.so](https://app.tuesday.so/settings/api))

### Step-by-Step Local Installation

#### 1. Clone and Setup the Repository

```bash
# Clone the repository
git clone https://github.com/your-repo/tuesday-mcp.git
cd tuesday-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

#### 2. Set Your API Key

Create a `.env` file or set environment variable:

```bash
# Option A: Create .env file in project root
echo "TUESDAY_API_KEY=your-api-key-here" > .env

# Option B: Export environment variable
export TUESDAY_API_KEY="your-api-key-here"
```

#### 3. Test the Server

```bash
# Test that the server starts correctly
node dist/index.js
```

You should see: `Tuesday MCP server started successfully`

Press `Ctrl+C` to stop the test.

### Configure Your AI Assistant

#### Option 1: Claude Desktop

1. **Find your configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Edit the configuration file:**

```json
{
  "mcpServers": {
    "tuesday": {
      "command": "node",
      "args": ["/absolute/path/to/tuesday-mcp/dist/index.js"],
      "env": {
        "TUESDAY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

3. **Get the absolute path:**

```bash
# Run this in your tuesday-mcp directory to get the full path
pwd
# Copy the output and append "/dist/index.js"
# Example: /Users/yourname/projects/tuesday-mcp/dist/index.js
```

4. **Restart Claude Desktop**

#### Option 2: Cursor

1. **Open Cursor Settings**
2. **Navigate to Extensions → MCP**
3. **Add server configuration:**

```json
{
  "tuesday": {
    "command": "node",
    "args": ["/absolute/path/to/tuesday-mcp/dist/index.js"],
    "env": {
      "TUESDAY_API_KEY": "your-api-key-here"
    }
  }
}
```

4. **Restart Cursor**

#### Option 3: Continue.dev

1. **Edit your Continue config** (`.continue/config.json`):

```json
{
  "mcpServers": {
    "tuesday": {
      "command": "node",
      "args": ["/absolute/path/to/tuesday-mcp/dist/index.js"],
      "env": {
        "TUESDAY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

2. **Restart Continue extension**

#### Option 4: Any MCP-Compatible Client

For any other MCP client, use these connection details:

- **Transport**: stdio
- **Command**: `node`
- **Arguments**: `["/absolute/path/to/tuesday-mcp/dist/index.js"]`
- **Environment**: `{"TUESDAY_API_KEY": "your-api-key-here"}`

### Verify Installation

#### 1. Check MCP Server Recognition

In your AI assistant, try:
```
"List available tools"
```

You should see Tuesday tools like `search_people`, `search_companies`, etc.

#### 2. Test API Connection

```
"Check if my Tuesday API key is valid"
```

You should get workspace information confirming the connection.

#### 3. Test Basic Search

```
"Find software engineers in San Francisco"
```

This should return search results from the Tuesday API.

### Troubleshooting Setup

#### Common Issues

1. **"Command not found" or "Tool not available"**
   ```bash
   # Verify the server builds correctly
   npm run build
   
   # Check the absolute path is correct
   ls -la /your/absolute/path/to/tuesday-mcp/dist/index.js
   ```

2. **"API key invalid"**
   ```bash
   # Test your API key directly
   curl -H "X-API-KEY: your-api-key-here" https://api.tuesday.so/api/v1/public/auth
   ```

3. **"Server won't start"**
   ```bash
   # Check for dependency issues
   npm install
   npm run build
   
   # Run with debug output
   DEBUG=* node dist/index.js
   ```

4. **"Permission denied"**
   ```bash
   # Make sure the file is executable
   chmod +x dist/index.js
   ```

#### Debug Mode

Enable detailed logging:

```bash
# Set debug environment variable
export DEBUG=tuesday-mcp:*

# Run the server
node dist/index.js
```

### Development Setup

If you want to modify the server:

```bash
# Install development dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Build for production
npm run build
```

## Configuration

### Environment Variables

Set your Tuesday API key as an environment variable:

```bash
export TUESDAY_API_KEY="your-api-key-here"
```

### 2. Configure Your AI Assistant

#### Claude Desktop Configuration

1. Locate your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the Tuesday MCP server configuration:

```json
{
  "mcpServers": {
    "tuesday": {
      "command": "node",
      "args": ["/absolute/path/to/tuesday-mcp/dist/index.js"],
      "env": {
        "TUESDAY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

3. Restart Claude Desktop

#### Cursor Configuration

1. Open Cursor settings
2. Navigate to MCP configuration
3. Add the Tuesday server:

```json
{
  "tuesday": {
    "command": "node",
    "args": ["/absolute/path/to/tuesday-mcp/dist/index.js"],
    "env": {
      "TUESDAY_API_KEY": "your-api-key-here"
    }
  }
}
```

## Available Tools

### Authentication

#### `check_api_key`
Validate your Tuesday API key and retrieve workspace information.

**Parameters:**
- `api_key` (optional): Tuesday API key if not set as environment variable

**Example:**
```
Check if my Tuesday API key is valid
```

### People Search & Lookup

#### `search_people`
Search for people using advanced filters and criteria with 50+ filtering options.

**Basic Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Results per page (max: 100, default: 25)
- `include_email`: Include email addresses (+2 credits per result)
- `include_phone`: Include phone numbers (+3 credits per result)

**Person Filters:**
- `person_titles`: Current job titles to include
- `person_not_titles`: Exclude these current job titles
- `person_past_titles`: Match against past job titles
- `person_seniorities`: Filter by seniority level (e.g., "C-Team", "Manager", "Staff")
- `person_location`: Current person location
- `not_person_location`: Exclude people in these locations
- `person_days_in_current_title_range`: Days in current role (min/max object)

**Organization Filters:**
- `q_organization_domains`: Match organization domains
- `not_q_organization_domains`: Exclude organizations with these domains
- `organization_location`: Company HQ/location
- `not_organization_location`: Exclude companies in these locations
- `organization_industry`: Include companies in these industries
- `organization_not_industry`: Exclude companies from these industries
- `organization_sic_industry`: Filter by SIC codes (e.g., "0919")
- `organization_not_sic_industry`: Exclude SIC codes
- `organization_naics_industry`: Filter by NAICS codes (e.g., "236117")
- `organization_not_naics_industry`: Exclude NAICS codes
- `organization_revenue_ranges`: e.g., "<$1M", "$1M-$10M", "$10M-$50M"

**Technology & Product Filters:**
- `organization_technology`: Include if they use any of these tools (e.g., "React", "AWS")
- `organization_all_technology`: Must use all listed technologies
- `not_organization_technology`: Exclude if using any of these technologies
- `organization_has_web_app`: Has a web application (boolean)
- `organization_has_mobile_app`: Has a mobile application (boolean)
- `organization_appstore_app_category`: AppStore categories (e.g., "News", "Finance")
- `organization_playstore_app_category`: PlayStore categories (e.g., "Business")
- `organization_appstore_rating`: iOS app rating (min/max 1-5)
- `organization_playstore_rating`: Android app rating (min/max 1-5)
- `organization_appstore_review_count`: Number of iOS reviews (min/max)
- `organization_playstore_review_count`: Number of Android reviews (min/max)
- `organization_is_website_for_sale`: Website listed for sale (boolean)

**Web Traffic & Advertising:**
- `organization_website_traffic_total_monthly`: Total monthly visits (min/max)
- `organization_website_traffic_monthly_organic`: Monthly organic traffic (min/max)
- `organization_website_traffic_monthly_paid`: Monthly paid traffic (min/max)
- `organization_monthly_google_adspend`: Estimated monthly Google Ads spend (min/max)

**Funding Filters:**
- `organization_funding_amount`: Last round amount (min/max)
- `organization_funding_total_amount`: Total raised funding (min/max)
- `organization_funding_date`: Months since last funding round (min/max)
- `organization_funding_type`: e.g., "Seed", "Series A", "Series B"
- `organization_funding_lead_investors`: Names of lead investors
- `organization_funding_number_of_investors`: Number of investors in last round (min/max)

**Team & Roles:**
- `organization_roles_count`: Role distribution by department with ranges
- `organization_open_roles_count`: Open roles per department with ranges

**Examples:**
```
Find software engineers in San Francisco working at Series A startups
Find CTOs at AI companies with 50-200 employees that use Python
Search for product managers at SaaS companies with $10M+ revenue
Find engineers at companies with React and AWS in their tech stack
```

#### `lookup_person`
Find a person using name, company, and other identifying information.

**Parameters:**
- `company_domain` (required): Domain of the company
- `first_name` (required): First name of the person
- `last_name`: Last name of the person (recommended)
- `title`: Job title or role
- `location`: Location (city, state, or country)
- `include_email`: Include email address (+2 credits)
- `include_phone`: Include phone number (+3 credits)

**Example:**
```
Find John Smith who works at google.com as a software engineer
```

#### `lookup_person_by_email`
Find a person using their email address.

**Parameters:**
- `email` (required): Email address to look up
- `include_phone`: Include phone number (+3 credits)

**Example:**
```
Look up the person with email john.smith@company.com
```

#### `lookup_person_by_phone`
Find a person using their phone number.

**Parameters:**
- `phone` (required): Phone number to look up
- `include_email`: Include email address (+2 credits)

**Example:**
```
Find the person with phone number +1-555-123-4567
```

#### `get_person_profile`
Get comprehensive profile information for a person using their LinkedIn URL.

**Parameters:**
- `linkedin_url` (required): LinkedIn profile URL
- `include_email`: Include email address (+2 credits)
- `include_phone`: Include phone number (+3 credits)

**Example:**
```
Get the profile for https://linkedin.com/in/johnsmith
```

### Company Search & Lookup

#### `search_companies`
Search for companies using advanced filters with 50+ filtering options including industry, size, location, funding, technology stack, and team composition.

**Basic Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Results per page (max: 100, default: 25)
- `funding`: Include funding details (+1 credit per result)
- `extra`: Include extended company details (+1 credit per result)
- `technology`: Include technology details (+2 credits per result)
- `website_traffic`: Include website traffic details (+1 credit per result)
- `headcount_growth`: Include headcount growth details (+1 credit per result)

**Person Filters (same as people search):**
- `person_titles`: Current job titles to include
- `person_not_titles`: Exclude these current job titles
- `person_past_titles`: Match against past job titles
- `person_seniorities`: Filter by seniority level
- `person_location`: Current person location
- `not_person_location`: Exclude people in these locations
- `person_days_in_current_title_range`: Days in current role (min/max)

**Organization Filters:**
- `q_organization_domains`: Match organization domains
- `not_q_organization_domains`: Exclude organizations with these domains
- `organization_location`: Company HQ/location
- `not_organization_location`: Exclude companies in these locations
- `organization_industry`: Include companies in these industries
- `organization_not_industry`: Exclude companies from these industries
- `organization_sic_industry`: Filter by SIC codes
- `organization_not_sic_industry`: Exclude SIC codes
- `organization_naics_industry`: Filter by NAICS codes
- `organization_not_naics_industry`: Exclude NAICS codes
- `organization_revenue_ranges`: Revenue ranges (e.g., "$1M-$10M")

**Technology & Product Filters:**
- `organization_technology`: Technologies used (e.g., "React", "Salesforce")
- `organization_all_technology`: Must use all listed technologies
- `not_organization_technology`: Exclude if using these technologies
- `organization_has_web_app`: Has web application
- `organization_has_mobile_app`: Has mobile application
- `organization_appstore_app_category`: iOS app categories
- `organization_playstore_app_category`: Android app categories
- `organization_appstore_rating`: iOS app rating (1-5)
- `organization_playstore_rating`: Android app rating (1-5)
- `organization_appstore_review_count`: iOS review count
- `organization_playstore_review_count`: Android review count
- `organization_is_website_for_sale`: Website for sale status

**Web Traffic & Advertising:**
- `organization_website_traffic_total_monthly`: Total monthly website visits
- `organization_website_traffic_monthly_organic`: Organic traffic
- `organization_website_traffic_monthly_paid`: Paid traffic
- `organization_monthly_google_adspend`: Google Ads spending

**Funding Filters:**
- `organization_funding_amount`: Last funding round amount
- `organization_funding_total_amount`: Total funding raised
- `organization_funding_date`: Months since last funding
- `organization_funding_type`: Funding stage (Seed, Series A, etc.)
- `organization_funding_lead_investors`: Lead investor names
- `organization_funding_number_of_investors`: Number of investors

**Team & Roles:**
- `organization_roles_count`: Team composition by department
- `organization_open_roles_count`: Open positions by department

**Examples:**
```
Find SaaS companies in Silicon Valley with Series A funding and 50-200 employees
Search for fintech companies using React and Node.js with $1M+ monthly traffic
Find AI startups with mobile apps rated 4+ stars on app stores
Search for companies with engineering teams of 10-50 people hiring Python developers
```

#### `get_company_profile`
Get comprehensive company information using LinkedIn URL or domain.

**Parameters:**
- `linkedin_url`: LinkedIn company page URL
- `domain`: Company domain name
- `include_funding`: Include funding and investment information (+2 credits)
- `include_technology`: Include technology stack (+1 credit)
- `include_contacts`: Include key executive contacts (+3 credits)

**Example:**
```
Get the company profile for google.com including funding and technology stack
```

#### `get_employee_count`
Get employee count and headcount information for a company.

**Parameters:**
- `linkedin_url`: LinkedIn company page URL
- `domain`: Company domain name

**Example:**
```
How many employees does salesforce.com have?
```

#### `search_employees`
Search for employees within a specific company.

**Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Results per page (max: 100, default: 25)
- `include_email`: Include email addresses (+2 credits per result)
- `include_phone`: Include phone numbers (+3 credits per result)
- `company_domain`: Company domain to search within
- `linkedin_url`: LinkedIn company page URL
- `person_titles`: Current job titles to include
- `person_not_titles`: Exclude these current job titles
- `person_seniorities`: Filter by seniority level
- `person_location`: Current person location
- `not_person_location`: Exclude people in these locations

**Example:**
```
Find all engineers at microsoft.com
```

## Natural Language Query Examples

Once configured, you can use natural language with your AI assistant:

### Advanced People Search Examples

```
"Find senior software engineers at Series A AI startups in San Francisco"
"Search for CTOs at SaaS companies with $10M+ revenue using React"
"Find product managers at fintech companies with mobile apps rated 4+ stars"
"Look for data scientists at companies that raised funding in the last 6 months"
"Search for engineering leaders at companies with 100-500 employees using AWS"
"Find marketing directors at B2B companies with high organic website traffic"
```

### Advanced Company Search Examples

```
"Find SaaS companies in Silicon Valley with Series A funding and engineering teams of 20-100"
"Search for fintech startups using Stripe and React with $1M+ monthly website traffic"
"Look for AI companies with mobile apps in the productivity category"
"Find companies that use Salesforce and have raised $10M+ in total funding"
"Search for e-commerce companies with high Google Ads spending and 4+ star mobile apps"
"Find B2B companies hiring 5+ engineers with Python and AWS tech stacks"
```

### Sophisticated Filtering Examples

```
"Find companies founded after 2020 with Series A funding, using React and AWS, located in NYC, with 50-200 employees and engineering teams of 10-50 people"
"Search for people at SaaS companies with $5M+ ARR, using Salesforce, with CTOs hired in the last 12 months"
"Find mobile-first companies with 4+ star iOS apps, venture funding, and teams hiring React Native developers"
```

## Advanced Usage Patterns

### 1. Technology Stack Analysis

```
"Find all companies using React, Node.js, and PostgreSQL with Series A funding"
"Search for startups that use both Stripe and Plaid in fintech"
"Look for companies with Python backends and React frontends hiring in SF"
```

### 2. Funding-Based Targeting

```
"Find companies that raised Series A in the last 6 months"
"Search for startups with $10M+ total funding led by Andreessen Horowitz"
"Look for companies with recent funding rounds hiring aggressively"
```

### 3. Market Size and Traffic Analysis

```
"Find SaaS companies with 100K+ monthly organic traffic"
"Search for e-commerce companies spending $50K+ monthly on Google Ads"
"Look for companies with high mobile app engagement and recent funding"
```

### 4. Team Composition Intelligence

```
"Find companies with engineering teams of 20-50 people hiring senior developers"
"Search for startups with 5+ open engineering roles and recent funding"
"Look for companies rapidly expanding their product teams"
```

## Credit Management

### Understanding Credit Costs

- **Basic searches**: 1 credit per result
- **Email inclusion**: +2 credits per result
- **Phone inclusion**: +3 credits per result
- **Company funding data**: +1 credit per result
- **Extended company details**: +1 credit per result
- **Technology stack data**: +2 credits per result
- **Website traffic data**: +1 credit per result
- **Headcount growth data**: +1 credit per result
- **Executive contacts**: +3 credits per result

### Optimizing Credit Usage

```
"Find 25 software engineers at tech companies (basic search only)"
"Search for 10 CTOs at AI companies and include their email addresses"
"Get company profiles for 5 SaaS companies with full technology stack data"
"Find startups with basic info first, then get detailed profiles for top prospects"
```

## Best Practices

### 1. Layer Your Filters

```
"Find technology companies in San Francisco" 
→ "Filter for Series A companies with 50-200 employees"
→ "Find those using React and AWS"
→ "Get engineering leaders with email contacts"
```

### 2. Use Specific Technology Criteria

```
Instead of: "Find tech companies"
Use: "Find SaaS companies using React, Node.js, and AWS with PostgreSQL databases"
```

### 3. Combine Funding and Growth Signals

```
"Find companies with Series A funding, 100K+ monthly traffic, and 5+ open engineering roles"
```

### 4. Leverage Team Composition Data

```
"Find companies with 20-50 person engineering teams that are actively hiring"
```

## Integration Examples

### Advanced Sales Prospecting

```
1. "Find Series A SaaS companies in target segments with high growth signals"
2. "Filter for companies using complementary technologies to our product"
3. "Identify decision makers with recent role changes or promotions"
4. "Get contact information and company technology stack for personalization"
```

### Competitive Intelligence Workflow

```
1. "Find all companies in our category with similar funding stages"
2. "Analyze their team composition and hiring patterns"
3. "Track their technology adoption and product development signals"
4. "Monitor executive movements and organizational changes"
```

### Partnership Development

```
1. "Find companies with complementary products and strong technical teams"
2. "Identify potential integration partners based on technology stack overlap"
3. "Find business development leaders at target companies"
4. "Research mutual connections and warm introduction paths"
```

### Market Research and Analysis

```
1. "Map the competitive landscape by funding stage and employee count"
2. "Analyze technology adoption trends across different company sizes"
3. "Identify emerging players with strong growth and hiring signals"
4. "Track market consolidation and acquisition targets"
```

## Examples by Use Case

### Lead Generation with Advanced Targeting
```
"Find VPs of Sales at Series B SaaS companies with $5M+ ARR using Salesforce"
"Search for decision makers at companies with high website traffic and mobile apps"
"Look for procurement managers at Fortune 500 companies using our competitor's tech"
```

### Recruiting with Tech Stack Focus
```
"Find senior React developers at companies using modern tech stacks in SF"
"Search for product managers with AI/ML experience at well-funded startups"
"Look for engineering leaders at companies with strong mobile presence"
```

### Market Research with Growth Signals
```
"Find all fintech companies with recent Series A funding and mobile apps"
"Search for startups with high organic traffic growth and engineering expansion"
"Look for companies with strong app store ratings and venture backing"
```

### Partnership Development with Integration Potential
```
"Find companies using Stripe and Plaid with business development teams"
"Search for SaaS companies with API-first architectures and partnership programs"
"Look for companies with complementary tech stacks and similar customer bases"
```

## Performance Tips

### 1. Use Layered Filtering

```
"Start with broad criteria, then add specific filters"
"Use technology filters to identify relevant companies first"
"Apply funding and growth filters to prioritize prospects"
```

### 2. Optimize for Credit Efficiency

```
"Get basic company data first, then detailed profiles for qualified prospects"
"Use domain searches instead of LinkedIn when possible"
"Batch related queries to minimize API calls"
```

### 3. Leverage Cached Results

```
"Save lists of qualified companies for follow-up searches"
"Use employee search on pre-qualified company lists"
"Build prospect databases incrementally"
```

## API Reference

### Rate Limits

Please refer to the [Tuesday API documentation](https://docs.tuesday.so/rate-limits-and-credits) for current rate limits and best practices.

### Error Handling

The MCP server provides comprehensive error handling:

- **Authentication errors**: Invalid or missing API keys
- **Validation errors**: Invalid input parameters
- **API errors**: Rate limiting, insufficient credits, etc.
- **Network errors**: Connection issues, timeouts

## Troubleshooting

### Common Issues and Solutions

1. **"Tool not found" errors**
   - Restart your AI assistant
   - Check the MCP server configuration
   - Verify the server is running

2. **Authentication errors**
   - Verify your API key is correct
   - Check environment variable is set
   - Ensure sufficient credits

3. **No results returned**
   - Try broader search criteria
   - Check if the company/person exists
   - Verify parameter spelling

4. **Too many parameters error**
   - Some filters may be mutually exclusive
   - Try using fewer filters at once
   - Check parameter format (arrays vs. objects)

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
export DEBUG=tuesday-mcp:*
node dist/index.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support and Resources

- [Tuesday API Documentation](https://docs.tuesday.so)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Issue Tracker](https://github.com/tuesday-so/Tuesday-MCP-server/issues)