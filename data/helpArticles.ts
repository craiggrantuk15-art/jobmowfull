export interface HelpArticle {
    id: string;
    category: string;
    title: string;
    description: string;
    content: string;
    lastUpdated: string;
    author: string;
    readTime: string;
}

export const helpArticles: HelpArticle[] = [
    {
        id: "ai-pricing-rules",
        category: "AI Quote Widget",
        title: "How to set up your AI pricing rules",
        description: "Learn how to configure the AI to provide accurate and profitable quotes automatically.",
        lastUpdated: "Feb 20, 2024",
        author: "Alice Green",
        readTime: "5 min",
        content: `
# Setting up AI Pricing Rules

JobMow's AI Quoting Engine is designed to take the guesswork out of pricing. By setting up clear rules, you ensure that every quote generated is both competitive and profitable.

## 1. Accessing Pricing Settings
Navigate to **Settings > Pricing Configuration**. Here you'll find the global defaults that the AI uses for every new quote.

## 2. Base Hourly Rate
The most important metric is your **Base Hourly Rate**. The AI estimates how long a job will take based on lawn size and property complexity, then multiplies it by this rate.
- **Tip:** Include your overheads and desired profit margin in this hourly rate.

## 3. Minimum Call-out Fee
Even for the smallest lawns, you likely have a minimum price. Set this under **Minimum Job Price**. The AI will never quote below this amount.

## 4. Complexity Multipliers
Lawn care isn't just about size. Obstacles like flower beds, steep slopes, or long-grass conditions can increase time.
- **Slopes:** Enable the "Slope Detection" feature to automatically add a 15% premium.
- **Edging:** Define a flat rate for perimeter edging.

## 5. Testing Your Rules
Use the **Preview** tab in the Embed Widget settings to test different addresses. See how the AI calculates the price in real-time before going live.
    `
    },
    {
        id: "stripe-integration",
        category: "Billing & Plans",
        title: "Integrating Stripe for automated payments",
        description: "Connect your Stripe account to start collecting payments automatically from your clients.",
        lastUpdated: "Jan 15, 2024",
        author: "Mark Finance",
        readTime: "4 min",
        content: `
# Stripe Integration Guide

Automating your collections is the fastest way to improve cash flow. JobMow integrates deeply with Stripe to handle one-off payments and recurring subscriptions.

## Prerequisites
- A verified Stripe account.
- Your business details (VAT number if applicable).

## Connection Steps
1. Go to **Settings > Integrations**.
2. Click **Connect Stripe**.
3. You will be redirected to Stripe to authorize JobMow.
4. Once returned, ensure your **Webhook Status** is green.

## Automatic Invoicing
With Stripe connected, JobMow can automatically:
- Email invoices upon job completion.
- Charge customer cards on file (Auto-pay).
- Update job status to 'Paid' instantly.

> [!NOTE]
> JobMow does not store credit card details. All financial data is securely handled by Stripe.
    `
    },
    {
        id: "team-management",
        category: "Team Management",
        title: "Adding and Managing Team Members",
        description: "Learn how to invite staff, assign roles, and manage permissions for your crew.",
        lastUpdated: "Feb 22, 2024",
        author: "Tom Fleet",
        readTime: "6 min",
        content: `
# Managing Your Team

Scaling your business requires a reliable team. JobMow makes it easy to bring new staff on board while maintaining control over your sensitive data.

## 1. Inviting New Staff
Navigate to **Settings > Team**. Click **Invite Member** and enter their email address. They will receive a secure link to create their account and join your organization.

## 2. Understanding Roles
JobMow provides three distinct roles to fit your workflow:
- **Owner:** Full access to everything, including billing and organization deletion.
- **Admin:** Can manage jobs, customers, and team members, but cannot access global billing settings.
- **Member:** Designed for field staff. They can view their assigned schedule, start/stop job timers, and add photos, but cannot see financial reports.

## 3. Revoking Access
If a team member leaves, you can instantly revoke their access by clicking the **Remove** button next to their name in the Team list. Their assigned jobs will remain in the system for reassignment.

## 4. Performance Tracking
Admins can view job completion times and efficiency metrics for each member under the **Reports > Efficiency** tab.
    `
    },
    {
        id: "security-essentials",
        category: "Security & Privacy",
        title: "Securing Your JobMow Account",
        description: "Best practices for keeping your business and customer data safe.",
        lastUpdated: "Feb 23, 2024",
        author: "Shield Guard",
        readTime: "3 min",
        content: `
# Security & Privacy Essentials

Protecting your customer data is our top priority. Here's how you can play your part in keeping your account secure.

## 1. Strong Passwords & MFA
Always use a unique, complex password for your JobMow account. We highly recommend enabling **Multi-Factor Authentication (MFA)** in your profile settings.

## 2. Session Management
If you're using JobMow on a shared device, always **Log Out** when finished. You can view active sessions and remotely sign out of other devices in your profile dashboard.

## 3. Principle of Least Privilege
Only give team members the level of access they strictly need. Use the **Member** role for field staff to ensure they don't have access to your full financial history.

## 4. Data Privacy
JobMow is fully GDPR and UK DPA compliant. We encrypt all sensitive customer data at rest and in transit.
    `
    },
    {
        id: "mobile-crew-app",
        category: "Mobile App",
        title: "Using the Mobile Crew App",
        description: "A guide for field staff on managing jobs and capturing proof of work while on site.",
        lastUpdated: "Feb 24, 2024",
        author: "Tom Fleet",
        readTime: "5 min",
        content: `
# Field Crew Guide

The JobMow mobile experience is optimized for lawn professionals working in the field. 

## 1. Viewing Your Schedule
The dashboard shows your assigned jobs for today in optimized route order. Tap any job to see location details, gate codes, and specific customer notes.

## 2. Starting the Timer
When you arrive on site, tap **Start Job**. This tracks your time and updates the customer that work has begun.
- **Note:** Accurate timers help the business owner calculate job profitability!

## 3. Capturing Proof of Work
After finishing, use the in-app camera to take "Before" and "After" photos. These are automatically attached to the job record and can be sent to the customer.

## 4. Offline Mode
Working in a dead zone? Don't worry. JobMow saves your timer and photo data locally and syncs it as soon as you're back in range.
    `
    },
    {
        id: "lead-metrics",
        category: "Getting Started",
        title: "Understanding Lead Conversion Metrics",
        description: "How to interpret your CRM data to grow your customer base.",
        lastUpdated: "Feb 21, 2024",
        author: "Alice Green",
        readTime: "4 min",
        content: `
# CRM & Lead Metrics

Turning inquiries into paying customers is the engine of your growth. Here’s how to use the **Leads & Waitlist** dashboard effectively.

## 1. The Conversion Funnel
- **New Inquiries:** Every time someone fills out your embed widget, they appear here.
- **Contacted:** Mark leads as contacted to track your outreach efforts.
- **Converted:** Once a lead accepts a quote and completes onboarding, JobMow automatically moves them to your Customer list.

## 2. Tracking Source Performance
View where your leads are coming from. Are they visiting your main site, or a toolkit page? High-performing sources deserve more marketing focus.

## 3. Response Time
The faster you respond, the higher your conversion rate. Aim to contact "New" leads within 2 hours of their inquiry.
    `
    }
];
