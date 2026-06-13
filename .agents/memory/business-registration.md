---
name: Business Registration Flow
description: How businesses self-register and get a pending business record created
---

# Business Registration Flow

## Correct flow
1. Business owner taps "Raise Capital" on onboarding → goes to register.tsx step 4b
2. Fills: businessName, CAC number, business type, industry, years operating, annual revenue
3. On submit: `register()` from AuthContext creates user account
4. THEN: `createBusiness()` from SystemContext creates pending business entry
5. `currentBusiness` in SystemContext finds it via `businesses.find(b => b.name === user.businessName)`
6. Business dashboard shows "Application Under Review" pending banner

## Key fix
- Removed `?? businesses[0]` fallback from `currentBusiness` in SystemContext
- New businesses without a matching record now see null → "Application Submitted" screen
- Demo business user ("Lagos Pharma Distributors") still works because businessName matches mock data

## Admin side
- Admin does NOT create businesses; admin reviews/approves KYB applications
- Admin dashboard: removed "Create Business" quick action; added "Disputes"
- Admin businesses page: "Add Business" renamed to "Manual Intake" (muted styling)
- Admin create-business.tsx: repurposed as "Manual Intake" for edge cases only
