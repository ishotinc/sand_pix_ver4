# Sand-Pix Implementation Phases Overview

## Project Summary
A Tinder-like SaaS for British users where they swipe left or right on web design images to create prompts and generate landing pages in HTML.

## MVP Timeline Estimate
**Total Duration:** 23-35 days (4.5-7 weeks)

## Implementation Phases

### Phase 1: Foundation & Backend Setup (2-3 days)
- Project initialization with Next.js 14, TypeScript, Tailwind CSS
- Supabase setup (Database, Auth, Storage)
- Database schema design with future-proofing for Alpha features
- Environment configuration
- Basic file structure creation

### Phase 2: User Authentication & Profile Management (3-5 days)
- User registration and email verification
- Login and password reset functionality
- Profile management interface
- Session management and route protection
- Form validation and error handling

### Phase 3: Core Swipe Experience (4-6 days)
- Swipe interface UI development
- Image loading from swipe-config.json
- Swipe gesture implementation
- Score calculation logic
- State management for swipe session

### Phase 4: AI-Powered Landing Page Generation (5-7 days)
- Gemini API integration
- Prompt construction logic
- Generation API endpoint
- Error handling and retry logic
- Rollback functionality for failed generations

### Phase 5: Project Editing, Preview, and Publishing (4-6 days)
- Project edit interface
- Live preview functionality
- Direct editing capabilities
- Publishing system
- Public page serving

### Phase 6: Monetization & Plan Enforcement (5-8 days)
- Stripe payment integration
- Plan limit enforcement
- Upgrade flow and modals
- Webhook handling for subscription updates
- Free vs Plus feature differentiation

## Critical Success Factors

### Technical Decisions
1. **Database Schema**: Must accommodate future Alpha features without migration
2. **Security**: Row-level security, authentication, and payment security
3. **AI Integration**: Robust prompt engineering and error handling
4. **Performance**: Efficient swipe interface and real-time preview

### User Experience Priorities
1. Smooth, intuitive swipe interface
2. Clear upgrade prompts when limits are reached
3. Fast landing page generation
4. Reliable project saving and publishing

## Risk Mitigation
- Start with thorough database design to avoid future migrations
- Implement comprehensive error handling from the beginning
- Test AI prompt outputs extensively before production
- Use staging environment for payment integration testing

## Dependencies Chart
```
Phase 1 (Foundation)
    ↓
Phase 2 (Auth & Profile)
    ↓
Phase 3 (Swipe Interface)
    ↓
Phase 4 (AI Generation)
    ↓
Phase 5 (Project Management)
    ↓
Phase 6 (Monetization)
```

## Definition of Done for MVP
- [ ] Users can register and log in
- [ ] Can swipe 12 images
- [ ] LP is generated
- [ ] Can edit and save generated LP
- [ ] Can display LP at public URL
- [ ] Free version restrictions work
- [ ] Can upgrade by paying with Stripe