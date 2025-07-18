Development of a Tinder-like SaaS for British users where they swipe left or right on web design images to create prompts and generate landing pages in HTML.

We will release an MVP first, and if the user base grows, we will add features as alpha and beta versions.

# User Experience
1. New user registration
2. Email verification
3. Input production purpose (dropdown) and service content (direct input), then immediately go to swipe screen
4. Display preview section of project edit screen
5. Direct editing of necessary information in project edit screen
6. Regenerate with regenerate button at the top of project edit screen
7. Publish when satisfied with LP (sandpix logo displayed and link to payment page when publishing)
8. To create another new LP, use new generate from the add project button on the project list page
9. If a generated LP is saved, it counts as using one project even without publishing
10. New generate is possible even when project limit (2 projects) is reached, but cannot save
	Since generation incurs API costs, allowing generation that cannot be saved is acceptable even if wasteful costs occur
11. When pressing project save button after new generate, show upgrade guide in modal window
12. After upgrade via stripe webhook, switch to plus plan permissions → up to 5 projects can be added, no logo display on Publish page

# MVP Required Features
- Password reset function
- Design item scores are set for 12 items per swipe image, and after completing 12 swipes, prompts are created programmatically according to the scores and used when generating landing pages
- Swipe image preload function
- 1 project used per landing page
- Prompts such as achievements, service name, and service content can be entered and directly edited in the project settings section
- Company information, company trust appeal information, and service provider personal profile are used as prompts from the profile settings section
- Default prompts with minimum basic settings that don't compromise UX
- Publish function. For free version, display in the lower right of the public site and guide to registration page when clicked
- Payment guidance in modal window when plan limits are reached
- Project information is saved manually even without Publishing. However, if saving beyond plan limits, show upgrade modal window
- Can change between public and private in project edit screen
- Public page access control
  - Public setting: Accessible at /p/{project_id}
  - Private setting: Only accessible by those who know the URL (no authentication)
  - When project is deleted: Immediately show 404 error
  - Security: Only URL difficulty to guess (using UUID)
- Rollback on regenerate failure: Retain previous HTML when generation fails

### Definition of MVP Completion
- [ ] Users can register and log in
- [ ] Can swipe 12 images
- [ ] LP is generated
- [ ] Can edit and save generated LP
- [ ] Can display LP at public URL
- [ ] Free version restrictions work
- [ ] Can upgrade by paying with Stripe

# Features Not Required for MVP
For the purpose of reducing man-hours, minimize features when creating MVP, consider only database for alpha version. Prepare columns for alpha version in MVP's DB in advance.

## List of Unnecessary Features
- Manual index settings
- Error log storage
- WebP support
- Image resizing
- Image upload function
- Swipe score saving
- Swipe prompt saving
- Image insertion by image generation AI
- HTML download function
- AI reports based on user behavior access data and one-click improvement LP updates
- For paid version, update OGP with first view screenshot of generated LP only at Publish time, not at regenerate
- Landing page generation flow (in MVP, generate from text creation in one shot)
  → Copywriting → Structure creation → Free image selection → Web coding → AI re-confirmation
- Generate LP of different lineage (prioritizing swipe information) from previously generated LP in the same project → Save latest score values
- Sort optimization with user ID + created_at
- SVG support for logo upload
- Google Analytics API to switch "Access count" and "CTA click rate" of Publish page at the top of project edit screen by month (+previous month comparison)/week (+previous week comparison)
- Function to directly edit "Privacy Policy" and "Specified Commercial Transaction Act" in project edit screen
- AB test function
- Form insertion function
- Multi-page HP creation function
- Custom domain acquisition function
- Push notifications
- 2FA support
- Template function
- External API provision
- Administrator permission function
- Detailed access analysis
- Swipe history saving
- Database information backup
- CDN

## Alpha Version Features to be Added in the Future (Consider when Creating Database)
- Project duplication function (duplicate and reuse all generated landing pages and information registered in project editing → Example: when a good landing page is created and you only want to change images)
- Landing page information changes correspondingly when profile is changed
- Personal photo settings and landing page reflection
- Project settings image settings and landing page reflection (batch upload possible within limits)
  └ Hero image (max 1)
  └ Product images (max 6)
  └ Achievement images (max 6)
  └ Other design images (max 3)

# Image Storage Specifications
## Swipe Images Location
All swipe images must be stored in the following directory structure:
```
/public/images/swipe/
├── friendly-tone.jpg
├── professional-tone.jpg
├── innovative-tone.jpg
├── trustworthy-tone.jpg
├── warm-colors.jpg
├── cool-colors.jpg
├── monochrome.jpg
├── vivid-colors.jpg
├── pastel-colors.jpg
├── high-density.jpg
├── asymmetric.jpg
└── photo-centric.jpg
```

## Image Requirements
- Format: JPG/PNG
- Size: Maximum 5MB per image
- Total: 12 images required for MVP
- Naming: Must match the filenames specified in swipe-config.json

# Prompt Specifications
## Basic Prompt Structure
The strength and variability of prompts are determined by the following strengths:
1. Default prompts: Set by the service itself
→ Users absolutely cannot change. Set so that stylish design landing pages are created regardless of user choices
2. Profile prompts: Profile information is reflected
3. Project prompts: Project prompts that are refactored every regenerate (project edit → regenerate → publish)
4. Swipe prompts: Swipe 12 web design images and pass the scores of 12 items directly to the prompt

## Rules
- Default prompts and scores set in swipe images are managed in code
- Score calculations set in swipe images are executed programmatically and used as variables in default prompts

## Default Prompts
```javascript
profileData = {
  companyName: string,           // Company name
  companyAchievements: string,   // Company achievements (founding year, number of employees, number of clients, etc.)
  contactInfo: string,           // Contact information
  personalName: string,          // Personal name
  personalBio: string,           // Profile text
  achievements: string           // Achievement registration (third-party evaluations, etc.)
}

projectData = {
  serviceName: string,           // Service name
  redirectUrl: string,           // Redirect URL
  purpose: string,               // LP production purpose (selected value)
  serviceDescription: string,    // Service content
  mainCopy: string,             // Main copy (direct edit)
  ctaText: string,              // CTA button text (direct edit)
  serviceAchievements: string,   // Service achievements (direct edit)
  customHead: string,           // Custom <head> tag (direct edit)
  customBody: string            // Custom <body> tag (direct edit)
}

swipeScores = {
  warm_score: number,
  cool_score: number,
  mono_score: number,
  vivid_score: number,
  friendly_score: number,
  professional_score: number,
  creative_score: number,
  minimal_score: number,
  energetic_score: number,
  trustworthy_score: number,
  luxurious_score: number,
  approachable_score: number
}

const DEFAULT_PROMPT = `
# 🚨 Absolute Compliance Items (Must Check Before Implementation)

## [STEP 1] Constraint Checklist - Must check the following before starting implementation
- [ ] Header is position: absolute (fixed prohibited)
- [ ] Header is completely transparent (background: transparent)
- [ ] Service name is placed in the upper left
- [ ] No external links (all button elements)
- [ ] Navigation to other pages is completely prohibited
- [ ] CTA button is for external URL guidance only
- [ ] Do not implement any form functionality

## [STEP 2] Required Output Format
<!DOCTYPE html>
<html>
<head>
[All CSS written in <style> tag]
</head>
<body>
[Complete HTML structure]
<script>
[All JavaScript written]
</script>
</body>
</html>

---

# 📋 Landing Page Creation Instructions

## Most Important Instructions
Create a highly visible landing page with design that exceeds limits using three.js, tailwind css, framer motion equivalent animations, and Heroicons CDN.
Animations should be flashy, but usability is top priority. Ensure text is perfectly readable on all devices.

## Design Style Instructions (Based on Swipe Scores)
Determine design style based on the following scores:
${swipeScores}

## Page Content Information
### Service Information
- Service Name: ${projectData.serviceName}
- Service Content: ${projectData.serviceDescription}
- Main Copy: ${projectData.mainCopy || 'Generate impactful catchphrase'}
- CTA Button Text: ${projectData.ctaText || 'Get Started'}
- Redirect URL: ${projectData.redirectUrl}
- Service Achievements: ${projectData.serviceAchievements || ''}

### Company/Personal Information
- Company Name: ${profileData.companyName || ''}
- Company Achievements: ${profileData.companyAchievements || ''}
- Contact: ${profileData.contactInfo || ''}
- Personal Name: ${profileData.personalName || ''}
- Profile: ${profileData.personalBio || ''}
- Achievements: ${profileData.achievements || ''}

### Custom Code
${projectData.customHead ? 'Custom head content: ' + projectData.customHead : ''}
${projectData.customBody ? 'Custom body content: ' + projectData.customBody : ''}

## Page Configuration by Purpose
${projectData.purpose === 'product' ? 'Product sales page configuration: Product introduction that increases purchase desire, price, features' : ''}
${projectData.purpose === 'service' ? 'Service introduction page configuration: Service value, benefits, case studies' : ''}
${projectData.purpose === 'brand' ? 'Corporate brand LP configuration: Corporate philosophy, achievements, reliability' : ''}
${projectData.purpose === 'lead' ? 'Document request page configuration: Document value, reason for free provision' : ''}
${projectData.purpose === 'event' ? 'Event recruitment page configuration: Event details, participation benefits, date and location' : ''}

## Page Content Information (*Absolutely No Omissions)
- [Editable information in project prompts]
  - Service name
  - Redirect URL
- [Information for direct editing in project prompts]

---

# 🎨 Design Specifications

## First View Specifications
### 🔴 Important Constraints (Reconfirmation)
- **Header**: position: absolute + completely transparent
- **Service Name**: Upper left placement
- **CTA**: Must be displayed in first view on both PC and SP
- **Animation**: Background only (content is static)

### Image Masking
- Semi-transparent overlay (50%-70% transparency)
- Text visibility is top priority

## Background Animation
- JavaScript implementation
- Full page support

## Responsive Typography
### Adopt Fluid Typography (clamp() function required)

#### Main Catchphrase (h1)
\`\`\`css
font-size: clamp(48px, 8vw, 72px); /* PC */
font-size: clamp(28px, 8vw, 44px); /* SP */
line-height: 1.05;
font-weight: 600;
letter-spacing: -0.02em;
background: linear-gradient(90deg, #0066CC 0%, #8A2BE2 50%, #FF6600 100%);
\`\`\`

#### Sub Catchphrase (h2)
\`\`\`css
font-size: clamp(16px, 3vw, 22px); /* PC */
font-size: clamp(14px, 4vw, 18px); /* SP */
line-height: 1.3;
color: #A1A1A6;
font-weight: 400;
\`\`\`

#### Body/Description Text (p)
\`\`\`css
font-size: clamp(18px, 2.5vw, 24px); /* PC */
font-size: clamp(16px, 3.5vw, 20px); /* SP */
line-height: 1.5;
color: #F2F2F7;
max-width: 600px; /* Center alignment */
\`\`\`

#### Caption/Note
\`\`\`css
font-size: clamp(14px, 2vw, 16px); /* PC */
font-size: clamp(12px, 3vw, 14px); /* SP */
line-height: 1.4;
color: #8E8E93;
\`\`\`

#### CTA Button Text
\`\`\`css
font-size: clamp(16px, 2vw, 18px); /* PC */
font-size: clamp(16px, 3vw, 18px); /* SP */
font-weight: 600;
white-space: nowrap; /* Always display in one line */
\`\`\`

## Responsive Rules
### Breakpoints
- 320px-768px: Mobile optimization
- 769px-1024px: Tablet optimization
- 1025px+: Desktop optimization

### Text Processing
- Apply \`overflow-wrap: break-word\` to all text

#### Visual Balance and Line Length
- Make the number of characters in each line as even as possible
- Avoid continuous lines that are too short or extremely long
- Avoid single words or particles of 2 full-width characters or less on a single line as much as possible

#### Implementation Priority
1. Combination of CSS \`word-break: keep-all\` + \`overflow-wrap: break-word\`
2. Explicitly insert \`<br>\` tags if unnatural line breaks occur (avoid overuse)
3. Apply \`white-space: nowrap\` so specific words or phrases are not split

### Line Length
- Line length of each text block in range that maximizes readability (about 50-75 half-width characters)
- Set \`max-width\` as needed

### Accessibility
- Minimum font size on mobile is 14px or more (compliance with accessibility guidelines)

## Padding
### Mobile Display
- Minimum side (left and right) padding (16px or 4vw)
- Characters and images displayed as large as possible on smartphone screens

### Between Sections
- Clear visual separation of information groups with vertical padding

## Visual Separation of Clickable and Non-clickable Elements
### Only Clickable Elements (CTA buttons, etc.)
- Shadow (box-shadow)
- Clear background color
- Clear border
- Large rounded corners (border-radius close to 50%)
- Combination of the above

### Non-clickable Text Blocks and Information Display Elements
- Do not use any of the above "button-like" designs
- Background color integrated with section background color or transparent

---

# 🔗 CTA Button/Link Specifications

## 🚨 Important Constraints (Third Confirmation)
- **All CTA buttons are for external URL guidance only**
- **Open in same tab setting**
- **Do not implement any form functionality**
- **Do not set any links to other pages**
- **Complete all information within one page**
- **Only one CTA button**

---

# 📄 Footer Specifications

## Required Elements
- Privacy Policy (modal window display)
- Specified Commercial Transaction Act (modal window display)
- ©[Dynamic update copyright display][company name] All Rights Reserved.

---

# 🎯 Other Design Rules

## Basic Rules
- No element in the LP should exceed the width (horizontal scroll occurrence prohibited)
- Do not add shadows to frames of non-clickable block elements
- Colors used for CTA buttons should not be used elsewhere in the LP except for CTA buttons
- Implement FAQ section in accordion format
- Text and background contrast ratio must meet WCAG standards
- Description with structured markup

---

# 🎨 Icon/Visual Element Selection Rules

## Basic Policy
- Use only visual elements that completely match the site's tone & manner, target audience, and industry characteristics
- Unicode emoji usage prohibited

## Industry/Service-specific Icon Guidelines
### BtoB/Consulting/Finance/Legal/Medical
- SVG icons (minimal design like Heroicons, Feather Icons)
- Outline style, monotone base
- Font Awesome Pro business icons
- Do not use any emojis

### BtoC/Retail/Service
- Moderately colorful SVG icons
- Solid style acceptable
- Icons matched to brand colors

### Entertainment/Creative
- Colorful icons, illustrations acceptable
- Emoji usage acceptable (but maintain consistency)

## Implementation Method Priority
1. Custom icons with SVG mask (mask-image)
2. Icon fonts like Font Awesome
3. Inline SVG
4. Emojis (casual only)

---

# 🔍 SEO×AIO Optimization Implementation

## Basic SEO Elements (Required)
- Title tag in "[Service Name] | [Value Proposition Keyword]" format within 32 characters, clearly reflecting search intent
- Meta description 120-160 characters with flow of "[Problem] → [Solution] → [Result]" for call to action
- H1 only one including service name + main value, H2-H6 hierarchical structure aligned with search intent
- Set canonical URL to prevent duplicate content
- Alt attributes for all images (product images in "[Product Name] showing [Feature]" format)

## Structured Data Implementation (AI Understanding Promotion)
- Implement WebPage schema + LP type-specific schema (Product/Service/Event/Organization) with JSON-LD
- Structure FAQ with microdata, clearly distinguish questions and answers
- Structure procedures/processes with HowTo schema (including number of steps, required time)
- Structure numerical data with Statistic schema (including source, update date)
- Define technical terms with DefinedTerm schema
- Describe contact information with structured data

## Technical SEO Implementation
### Core Web Vitals Support
- Deliver images in WebP format, width/height attributes required
- Lazy load images with loading="lazy"
- Preload/preconnect settings for important resources

---

# ✅ Final Checklist Before Implementation Completion

## [Required Confirmation Items]
- [ ] Is header position: absolute and transparent?
- [ ] Is service name placed in upper left?
- [ ] Are there no external links? (All button elements?)
- [ ] Are CTA buttons for external URL guidance only?
- [ ] Is form functionality not implemented?
- [ ] Is navigation to other pages completely prohibited?
- [ ] Is it the required HTML structure (CSS in head, HTML in body, JS in script)?
- [ ] Is responsive typography correctly implemented?
- [ ] Is it designed to prevent horizontal scrolling?
- [ ] Does it comply with accessibility guidelines?
- [ ] Are Unicode emojis not used at all?
- [ ] Are industry characteristics and constraints checked with highest priority?
`;

const generateFinalPrompt = (projectData, profileData, swipeResults) => {
  const swipeScores = calculateScores(swipeResults);
  
  // Convert swipe scores to text format
  const scoresText = Object.entries(swipeScores)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
  
  // Embed variables in template
  return DEFAULT_PROMPT
    .replace('${swipeScores}', scoresText)
    .replace(/\${projectData\.(\w+)}/g, (match, key) => projectData[key] || '')
    .replace(/\${profileData\.(\w+)}/g, (match, key) => profileData[key] || '');
};
```

### Profile Prompts
Landing page information does not change even when profile information is updated.
1. Company name
2. Company achievements
   - Founding year, number of employees, number of clients, annual revenue, number of deployments, number of users, retention rate, satisfaction rate, company history and industry position, specific results of ESG/CSR activities
3. Contact information (displayed on landing page)
4. Personal name
5. Profile text
   - Specifically describe [qualifications][years of experience][specialty fields][achievements]
6. Achievement registration
   - Third-party evaluations: Certifications, awards, media coverage, industry association membership

### Project Prompts
1. Service name
2. Redirect URL
3. Landing page production purpose selection
   └ Product sales page
   └ Service introduction page
   └ Corporate brand LP
   └ Document request page
   └ Event recruitment page
4. Service content

### Project Direct Edit Elements
Re-swipe using project registration information every regenerate. Save only the most recent swipe score
Duplicate image files when duplicating
Changes reflected in preview in real time. In the same project, the following information is prioritized and overwritten in the landing page, and the following registration information is used variably at the next generation
- Main copy
- CTA button text
- Service achievements
- Profile
- Detailed settings
  └ Custom <head> tag
  └ Custom <body> tag

### Swipe Prompts
Present 12 different web design images and calculate scores with nope (left swipe) or like (right swipe).
Add points only for likes.
The display order of swipe images can be the same every time.

swipe-config.json
```json
{
  "version": "1.0.0",
  "images": [
    {
      "id": 1,
      "title": "Friendly Tone",
      "description": "\"Feel free to consult us♪\" \"Let's work hard together!\"",
      "visual_hints": "Staff smiling photos, hand-drawn style icons, soft rounded corners, warm expressions",
      "path": "/images/swipe/friendly-tone.jpg",
      "scores": {
        "warm_score": 1,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 1,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 1
      }
    },
    {
      "id": 2,
      "title": "Professional Tone",
      "description": "\"Providing professional solutions\" \"Rich track record\"",
      "visual_hints": "Experts in suits, data graphs, angular design, logical composition",
      "path": "/images/swipe/professional-tone.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 1,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 3,
      "title": "Innovative Tone",
      "description": "\"Transforming the industry with next-generation technology\" \"Innovation\"",
      "visual_hints": "Futuristic graphics, technology feel, geometric patterns, advanced visuals",
      "path": "/images/swipe/innovative-tone.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 1,
        "mono_score": 0,
        "vivid_score": 1,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 1,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 4,
      "title": "Trustworthy Tone",
      "description": "\"20 years of solid track record since founding\" \"Safe and reliable\"",
      "visual_hints": "Historic buildings, stable composition, traditional design, proof of trust",
      "path": "/images/swipe/trustworthy-tone.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 5,
      "title": "Warm Colors (Orange/Red)",
      "description": "Mailchimp-style warm orange base",
      "visual_hints": "Warm orange, active and friendly impression",
      "path": "/images/swipe/warm-colors.jpg",
      "scores": {
        "warm_score": 1,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 1,
        "friendly_score": 1,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 1
      }
    },
    {
      "id": 6,
      "title": "Cool Colors (Blue/Navy)",
      "description": "Facebook-style trustworthy blue base",
      "visual_hints": "Calm blue, reliability and stability",
      "path": "/images/swipe/cool-colors.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 1,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 7,
      "title": "Monochrome (White/Gray/Black)",
      "description": "Apple-style sophisticated grayscale",
      "visual_hints": "Minimal and luxurious monotone",
      "path": "/images/swipe/monochrome.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 1,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 1,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 1,
        "approachable_score": 0
      }
    },
    {
      "id": 8,
      "title": "Vivid (Bright Green/Pink)",
      "description": "Spotify-style high saturation colors",
      "visual_hints": "Bright and eye-catching colors",
      "path": "/images/swipe/vivid-colors.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 1,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 1,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 9,
      "title": "Pastel (Light Pink/Light Blue)",
      "description": "Notion-style gentle pastels",
      "visual_hints": "Soft and gentle colors",
      "path": "/images/swipe/pastel-colors.jpg",
      "scores": {
        "warm_score": 1,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 1,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 1,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 1
      }
    },
    {
      "id": 10,
      "title": "High Information Density Layout",
      "description": "Densely packed information layout",
      "visual_hints": "Amazon product page style rich composition",
      "path": "/images/swipe/high-density.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 11,
      "title": "Asymmetric Layout",
      "description": "Left-right asymmetry, dynamic placement",
      "visual_hints": "Medium-style creative composition",
      "path": "/images/swipe/asymmetric.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 1,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 12,
      "title": "Photo-centric Decoration",
      "description": "Effective placement of product photos",
      "visual_hints": "Visual-focused layout",
      "path": "/images/swipe/photo-centric.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 1,
        "approachable_score": 0
      }
    }
  ]
}
```

#### Scoring Structure
##### 1. Basic Scoring Structure
Each image has 12 item scores set, and points are only added when liked:
Color System (4 items)
warm_score: +1 point/like (warm colors)
cool_score: +1 point/like (cool colors)
mono_score: +1 point/like (monochrome)
vivid_score: +1 point/like (vivid)
Atmosphere System (4 items)
friendly_score: +1 point/like (friendly)
professional_score: +1 point/like (professional)
creative_score: +1 point/like (creative)
minimal_score: +1 point/like (minimal)
Additional Items (4 items)
energetic_score: +1 point/like (energetic)
trustworthy_score: +1 point/like (trustworthy)
luxurious_score: +1 point/like (luxurious)
approachable_score: +1 point/like (approachable)

# Plans
When downgrading:
- OGP automatic change
- Logo automatic revival
- Cannot downgrade unless the number of projects is below the changed limit
- 5-day Grace Period for payment failure due to credit card expiration, etc.
- Functional restrictions during period: None (warning display only)
- After period ends: Downgrade to Free Plan

## Free Plan:
- Number of projects: 2
- regenerate: 10 times/day
- Public LP: Logo display

## Plus Plan ($20/month):
- Number of projects: 5
- regenerate: 50 times/day
- Public LP: No logo display

# Common Restrictions
- Upload images up to 5MB per data, JPG/PNG supported
- regenerate count resets daily based on UTC worldwide, modal display recommending payment when exceeded

# Frontend
# File Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── projects/
│   │   │   ├── page.tsx              # Project list
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # New creation → swipe
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Project edit (details integrated)
│   │   └── profile/
│   │       └── page.tsx              # Profile edit
│   │
│   ├── p/[id]/
│   │   └── page.tsx                  # Public LP display
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── verify/route.ts
│       ├── projects/
│       │   ├── route.ts              # List/Create
│       │   ├── [id]/route.ts         # Update/Delete
│       │   └── generate/route.ts     # LP generation
│       └── stripe/
│           └── webhook/route.ts
│
├── components/
│   ├── swipe/
│   │   ├── SwipeCard.tsx
│   │   └── SwipeContainer.tsx
│   ├── editor/
│   │   ├── ProjectEditor.tsx
│   │   └── PreviewFrame.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
│
├── lib/
│   ├── supabase/
│   │   └── client.ts
│   ├── gemini/
│   │   └── client.ts
│   └── stripe/
│       └── client.ts
│
├── utils/
│   └── scoring.ts                    # Swipe score calculation
│
├── types/
│   ├── auth.ts
│   ├── project.ts
│   ├── profile.ts                    # Profile related types
│   └── swipe.ts
│
├── hooks/
│   └── useAuth.ts
│
└── public/
    ├── images/
    │   └── swipe/                    # Swipe images storage location
    │       ├── friendly-tone.jpg
    │       ├── professional-tone.jpg
    │       ├── innovative-tone.jpg
    │       ├── trustworthy-tone.jpg
    │       ├── warm-colors.jpg
    │       ├── cool-colors.jpg
    │       ├── monochrome.jpg
    │       ├── vivid-colors.jpg
    │       ├── pastel-colors.jpg
    │       ├── high-density.jpg
    │       ├── asymmetric.jpg
    │       └── photo-centric.jpg
    └── swipe-config.json
```

## Swipe Function
- Image data managed in /public/swipe-config.json
- Display 12 images in specified order
- Score calculation completed on client side
- Send only final results to API

## Error Display UI Specifications

### Display Patterns
1. **Toast Notification**
   - Usage: Minor errors, temporary notifications
   - Display time: 5 seconds
   - Position: Upper right of screen

2. **Modal Dialog**
   - Usage: Important errors that should interrupt operations
   - Required elements: Title, description, action button
   - Background: Block other operations with overlay

3. **Inline Display**
   - Usage: Form input errors
   - Position: Directly below the relevant item
   - Color: Error color (red)

### Accessibility Requirements
- Error messages should be clear and specific
- Avoid technical terms, use words users can understand
- Identifiable not only by color but also by icons and text

# Design
1. Color System
Basic Color Palette
```css
:root {
  /* Primary Colors */
  --primary: #0071E3;          /* Important buttons/main actions */
  --primary-hover: #0051C3;    /* On hover */
  --primary-active: #0041A3;   /* When active */
  
  /* Background Colors */
  --bg-primary: #FFFFFF;       /* Main background */
  --bg-secondary: #F5F5F7;     /* Section background */
  --bg-tertiary: #E8E8ED;      /* Card background */
  
  /* Text Colors */
  --text-primary: #202124;     /* Primary text */
  --text-secondary: #5F6368;   /* Secondary text */
  --text-tertiary: #80868B;    /* Notes/captions */
  --text-inverse: #FFFFFF;     /* Inverse text */
  
  /* Semantic Colors */
  --success: #34A853;
  --warning: #FBBC04;
  --error: #EA4335;
  --info: #4285F4;
}
```

Google Brand Gradient
```css
/* Main brand gradient */
.brand-gradient {
  background: linear-gradient(
    135deg,
    #4285F4 0%,      /* Google Blue - 40% */
    #4285F4 40%,
    #EA4335 40%,     /* Google Red - 25% */
    #EA4335 65%,
    #FBBC04 65%,     /* Google Yellow - 20% */
    #FBBC04 85%,
    #34A853 85%,     /* Google Green - 15% */
    #34A853 100%
  );
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(
    90deg,
    #4285F4 0%,
    #EA4335 35%,
    #FBBC04 70%,
    #34A853 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Soft gradient (for background) */
.soft-gradient {
  background: linear-gradient(
    180deg,
    rgba(66, 133, 244, 0.05) 0%,
    rgba(234, 67, 53, 0.05) 40%,
    rgba(251, 188, 4, 0.05) 70%,
    rgba(52, 168, 83, 0.05) 100%
  );
}
```

2. Typography
Font Family
```css
:root {
  /* English fonts */
  --font-primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
                  'Helvetica Neue', Arial, sans-serif;
  
  /* Japanese compatible fonts */
  --font-japanese: 'Hiragino Sans', 'Yu Gothic UI', 'Noto Sans JP', 
                   sans-serif;
  
  /* System font integration */
  --font-system: var(--font-primary), var(--font-japanese);
}

/* Font smoothing */
body {
  font-family: var(--font-system);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

Font Size (Fluid Typography)
```css
:root {
  /* Base size: 16px */
  --text-xs: clamp(0.75rem, 1.5vw, 0.875rem);      /* 12-14px */
  --text-sm: clamp(0.875rem, 2vw, 1rem);           /* 14-16px */
  --text-base: 1rem;                                /* 16px */
  --text-lg: clamp(1.125rem, 2.5vw, 1.25rem);      /* 18-20px */
  --text-xl: clamp(1.25rem, 3vw, 1.5rem);          /* 20-24px */
  --text-2xl: clamp(1.5rem, 3.5vw, 2rem);          /* 24-32px */
  --text-3xl: clamp(2rem, 4vw, 3rem);              /* 32-48px */
  --text-4xl: clamp(2.5rem, 5vw, 4rem);            /* 40-64px */
  
  /* Line height: Apple standard */
  --leading-tight: 1.25;
  --leading-normal: 1.47;
  --leading-relaxed: 1.75;
}
```

Font Weight (Apple-style)
```css
:root {
  --font-thin: 100;
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}

/* Usage example */
.heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.body-text {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
}

.caption {
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}
```

3. Date and Time Display Specifications
Relative Time Display
```javascript
// Japanese support
const relativeTime = {
  justNow: "たった今",
  minutesAgo: (n) => `${n}分前`,
  hoursAgo: (n) => `${n}時間前`,
  daysAgo: (n) => `${n}日前`,
  weeksAgo: (n) => `${n}週間前`,
  monthsAgo: (n) => `${n}ヶ月前`,
  yearsAgo: (n) => `${n}年前`
};

// English support
const relativeTimeEn = {
  justNow: "just now",
  minutesAgo: (n) => `${n} minute${n > 1 ? 's' : ''} ago`,
  hoursAgo: (n) => `${n} hour${n > 1 ? 's' : ''} ago`,
  daysAgo: (n) => `${n} day${n > 1 ? 's' : ''} ago`,
  // ...
};
```

Absolute Time Display Format
```javascript
// Display according to user locale
const dateFormats = {
  'ja-JP': {
    short: 'M月d日',
    medium: 'yyyy年M月d日',
    long: 'yyyy年M月d日 HH:mm',
    full: 'yyyy年M月d日 HH:mm:ss zzz'
  },
  'en-US': {
    short: 'MMM d',
    medium: 'MMM d, yyyy',
    long: 'MMM d, yyyy h:mm a',
    full: 'MMMM d, yyyy h:mm:ss a zzz'
  }
};
```

4. Responsive Design
Breakpoints
```scss
// Breakpoint definitions
$breakpoints: (
  'mobile': 320px,
  'mobile-l': 425px,
  'tablet': 768px,
  'desktop': 1024px,
  'desktop-l': 1440px
);

// Media query mixins
@mixin mobile {
  @media (max-width: 767px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 768px) and (max-width: 1024px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1025px) {
    @content;
  }
}
```

Responsive Utility Classes
```css
/* Display control */
.mobile-only { display: none; }
.tablet-only { display: none; }
.desktop-only { display: none; }

@media (max-width: 767px) {
  .mobile-only { display: block; }
  .tablet-up { display: none; }
  .desktop-up { display: none; }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .tablet-only { display: block; }
  .mobile-only { display: none; }
  .desktop-only { display: none; }
}

@media (min-width: 1025px) {
  .desktop-only { display: block; }
  .mobile-only { display: none; }
  .tablet-down { display: none; }
}
```

5. Component Styles
Button Styles
```css
/* Primary button */
.btn-primary {
  background: var(--primary);
  color: var(--text-inverse);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: var(--font-medium);
  transition: all 200ms ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
}

.btn-primary:active {
  background: var(--primary-active);
  transform: translateY(0);
}

/* Gradient button */
.btn-gradient {
  background: linear-gradient(135deg, #4285F4 0%, #EA4335 100%);
  color: white;
  padding: 14px 28px;
  border-radius: 50px;
  font-weight: var(--font-semibold);
  transition: all 300ms ease;
}
```

Card Styles
```css
.card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
```

6. Animation Specifications
```css
/* Transition definitions */
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Apple-style spring animation */
@keyframes spring {
  0% { transform: scale(1); }
  30% { transform: scale(1.25); }
  40% { transform: scale(0.75); }
  50% { transform: scale(1.15); }
  65% { transform: scale(0.95); }
  75% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

7. Spacing System
```css
:root {
  /* Based on multiples of 4 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

# Technical Specifications
## Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form (form management)
- Zustand (state management)
- React DnD (swipe implementation)

## Backend
- Next.js API Routes
- Supabase
  - PostgreSQL (database)
  - Auth (authentication)
  - Storage (image storage)
  - Realtime (real-time preview updates)

## AI/Generation
- Google Gemini 2.0 Flash API (LP generation)
  - Model: gemini-2.0-flash-exp
  - Max tokens: 16,384
  - Temperature: 0.7
  - Timeout: 90 seconds
  - Response type: text/plain

## Error Handling Policy

### Basic Behavior on Error Occurrence
- Preserve user's work content as much as possible
- Display error content clearly
- Clearly indicate next action
- Change display method according to importance

### Error Types and Responses
| Error Type | Occurrence Condition | Display to User | Recommended Action |
|------------|---------------------|-----------------|-------------------|
| LP Generation Failure | Token limit exceeded | "Too much text" | Retry with shorter content |
| LP Generation Failure | API limit | "Daily generation limit reached" | Wait until tomorrow or upgrade |
| Payment Error | Card expired | "Card has expired" | Update card information |
| Authentication Error | Session expired | "Login required" | Re-login |
| Communication Error | Network failure | "Communication error occurred" | Retry |

# API
## Public Page API Specifications
### GET /p/[id]
- Project existence check
  - Exists: Return HTML (regardless of is_published)
  - Does not exist: Display 404 page
- No access log recording (MVP)
- Cache settings:
  - Cache-Control: public, max-age=3600

## Error Response Specifications

### HTTP Status Code Usage Policy
- 4xx: Client errors (user-caused)
- 5xx: Server errors (system-caused)

### Error Code System
- AUTH_xxx: Authentication related
- PAYMENT_xxx: Payment related
- GENERATION_xxx: LP generation related
- VALIDATION_xxx: Input validation related
- SYSTEM_xxx: System errors

### Required Error Information
- code: Error code (unique identifier)
- message: User-facing message (Japanese/English)
- timestamp: Error occurrence time (UTC)

# Database
DB design that meets only MVP required features and alpha version feature specifications