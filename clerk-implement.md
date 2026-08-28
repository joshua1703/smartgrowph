SMARTGROW — GOOGLE-ONLY AUTHENTICATION PAGE REDESIGN

Act as a senior frontend engineer, senior UI/UX designer, and product designer with 10+ years of professional experience designing premium SaaS, IoT, agritech, and enterprise web applications.

I want you to redesign the AUTHENTICATION PAGE for my existing SmartGrow platform.

IMPORTANT:

SmartGrow already has:

- A completed dashboard
- An existing landing page
- An established visual identity
- An existing `globals.css`
- Existing color tokens
- Existing typography
- Existing UI components

DO NOT create a completely new visual identity.

The authentication page must feel like a natural continuation of the SmartGrow product.

==================================================
AUTHENTICATION REQUIREMENT
==================================================

This authentication page should support:

GOOGLE SIGN-IN ONLY.

There should NOT be:

- Email/password login
- Password fields
- Username fields
- Registration forms
- Forgot password
- Reset password
- Multiple authentication providers

The primary authentication action is:

"Continue with Google"

Keep the authentication experience extremely simple.

==================================================
DESIGN GOAL
==================================================

The page should feel:

Premium
Modern
Calm
Trustworthy
Technical
Professional
Minimal but NOT boring

Think:

Modern SaaS authentication

- Smart agriculture
- IoT technology
- SmartGrow branding

Do NOT make it look like:

- A generic login template
- A banking login page
- A basic Bootstrap form
- A school project
- A giant centered white card
- An old-fashioned authentication screen

==================================================
IMPORTANT:
DO NOT OVERDESIGN THE LOGIN
==================================================

The authentication page should be significantly simpler than the landing page.

The landing page tells the product story.

The authentication page gets the user into the product.

Prioritize:

CLARITY
TRUST
SPEED
BRAND
ACCESSIBILITY

==================================================
PAGE LAYOUT
==================================================

Use a sophisticated split-screen or asymmetric composition on desktop.

Possible direction:

LEFT SIDE
Brand / visual storytelling

RIGHT SIDE
Authentication

For example:

---

SMARTGROW SIGN IN

[ greenhouse / mushroom Welcome
cultivation visual ] back.

                                  Sign in to
                                  continue to
                                  SmartGrow.

                                  [ G Continue with Google ]

                                  Secure access to your
                                  SmartGrow workspace.

---

Do NOT force this exact layout if another composition fits the existing design system better.

The key is to avoid a boring centered login card.

==================================================
LEFT VISUAL AREA
==================================================

Use a high-quality visual related to SmartGrow.

Possible imagery:

- Oyster mushroom cultivation
- Modern greenhouse
- Mushroom fruiting bags
- Greenhouse interior
- IoT environmental monitoring
- Subtle greenhouse technology

The image should feel premium and authentic.

Avoid generic corporate stock photography.

The image can be treated with:

- Existing SmartGrow colors
- Subtle gradient overlay
- Soft lighting
- Minimal UI telemetry
- Brand mark

Do NOT cover the entire image with excessive UI.

The visual should remain calm.

==================================================
OPTIONAL SMARTGROW VISUAL OVERLAY
==================================================

A small, subtle environmental monitoring overlay can be placed over the image.

Example:

SMARTGROW MONITORING

26.4°C
88% RH

ZONE A
● OPTIMAL

This should be a visual detail, not a second dashboard.

Keep it small and elegant.

==================================================
AUTH PANEL
==================================================

The authentication area should contain:

SmartGrow logo

Headline:

"Welcome to SmartGrow"

Supporting text:

"Sign in to monitor your greenhouse, manage automation, and track cultivation."

Then:

[ Google Icon ] Continue with Google

That is the main interaction.

Do NOT add unnecessary form fields.

==================================================
GOOGLE BUTTON
==================================================

The Google sign-in button is the most important interactive element.

Make it premium.

Requirements:

- Correct Google logo
- Clear "Continue with Google" label
- Appropriate height
- Strong contrast
- Clear border
- Professional hover state
- Pressed state
- Keyboard focus state
- Loading state

Do not redesign Google's logo into a random icon.

Use the official Google logo asset or the existing supported authentication library.

Do not use an emoji.

==================================================
BUTTON STATES
==================================================

The Google button should support:

DEFAULT

"Continue with Google"

HOVER

Subtle visual elevation/change.

LOADING

Show a small spinner or loading indicator.

Text:

"Connecting to Google..."

DISABLED

Prevent multiple authentication requests.

ERROR

If authentication fails:

"Unable to sign in with Google. Please try again."

Do not expose technical error messages to the user.

==================================================
AUTHENTICATION FLOW
==================================================

Implement the actual Google authentication using the project's existing authentication architecture.

Before implementing:

Inspect the current project and determine whether authentication is already configured.

If Supabase Auth is being used:

Use Supabase Google OAuth.

If another authentication system is already configured:

Reuse it.

DO NOT create a second authentication architecture.

DO NOT duplicate authentication logic.

DO NOT hardcode credentials.

DO NOT place secrets in client-side code.

Use environment variables for configuration.

==================================================
REDIRECT BEHAVIOR
==================================================

After successful Google authentication:

Redirect the user to the existing SmartGrow dashboard.

Example:

/dashboard

Use the existing route if the project uses a different dashboard route.

Do NOT create a duplicate dashboard.

If the user is already authenticated and visits `/login`:

Redirect them to the dashboard.

==================================================
AUTH CALLBACK
==================================================

If OAuth requires a callback route:

Implement the appropriate callback flow using the project's existing authentication architecture.

Handle:

- Successful authentication
- Failed authentication
- Cancelled authentication
- Missing session
- Expired session
- Redirect errors

Keep the user experience clean.

Do not show raw OAuth errors.

==================================================
LOADING EXPERIENCE
==================================================

The authentication process should feel polished.

When the user clicks:

Continue with Google

Immediately provide visual feedback.

For example:

Google icon

- small spinner
- "Connecting to Google..."

Prevent the user from clicking multiple times.

Do not freeze the entire page unnecessarily.

==================================================
AUTH PAGE ANIMATION
==================================================

Use subtle animations.

When the page loads:

Logo:
small fade + upward movement

Headline:
slight fade

Description:
slight delayed fade

Google button:
slight delayed fade

Hero image:
gentle fade/scale

Keep animations short.

Do NOT create:

- Dramatic page transitions
- Floating blobs everywhere
- Excessive parallax
- Bouncing buttons
- Rotating icons

Authentication should feel calm.

==================================================
BACKGROUND
==================================================

Use the existing SmartGrow theme.

The background should feel refined.

Possible approach:

Large visual area:
greenhouse imagery

Authentication area:
existing SmartGrow background color

Add only subtle decorative details.

Do not use excessive abstract shapes.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop:

Split-screen or asymmetric layout.

Tablet:

Balanced two-column layout.

Mobile:

Prioritize authentication.

Suggested order:

SmartGrow logo

Small visual/image

Welcome to SmartGrow

Description

Continue with Google

Optional security text

Do not let the image consume most of the mobile screen.

The Google button must remain easy to tap.

No horizontal overflow.

==================================================
MOBILE VISUAL
==================================================

On mobile, simplify the visual.

You can:

- Reduce image height
- Use a compact image banner
- Use a subtle SmartGrow illustration
- Hide secondary decorative elements

Do not completely remove the brand identity.

==================================================
SECURITY / TRUST TEXT
==================================================

Below the button, optionally include a very subtle message:

"Secure authentication powered by Google."

or:

"Use your Google account to securely access SmartGrow."

Keep it small.

Do not make exaggerated security claims.

==================================================
LEGAL TEXT
==================================================

If the application already has Privacy Policy or Terms pages, include a small footer:

"By continuing, you agree to our Terms of Service and Privacy Policy."

Only include this if it is appropriate for the existing application.

Do not invent legal policies.

==================================================
NAVIGATION
==================================================

Do NOT add a full landing-page navbar.

Authentication should be focused.

At most:

SmartGrow logo

- "Back to SmartGrow"

Keep navigation minimal.

==================================================
ICONOGRAPHY
==================================================

Use the same icon system as the existing SmartGrow application.

Do NOT introduce random icon libraries.

Google's official logo should be used specifically for Google authentication.

Other icons should be extremely limited.

Authentication does not need dozens of icons.

==================================================
TYPOGRAPHY
==================================================

Use the existing SmartGrow typography system.

The hierarchy should be:

SMARTGROW
small brand identifier

Welcome to SmartGrow
large headline

Sign in to monitor...
supporting text

Continue with Google
primary action

Security / legal text
small secondary text

Avoid excessive font weights.

==================================================
ACCESSIBILITY
==================================================

The authentication page must be fully accessible.

Ensure:

- Semantic HTML
- Keyboard navigation
- Visible focus state
- Proper button labels
- Accessible Google icon
- Good color contrast
- Screen-reader-friendly error messages
- Reduced-motion support

The Google button must be usable entirely with a keyboard.

==================================================
ERROR HANDLING
==================================================

Handle authentication failures gracefully.

Possible states:

Google popup blocked
Authentication cancelled
Network unavailable
OAuth configuration error
Session creation failure
Unknown authentication error

Use human-readable messages.

For example:

"Something went wrong while signing you in. Please try again."

Do NOT show:

OAuthError: invalid_grant
supabase.auth...
stack traces
database errors

Those belong in developer logs, not the UI.

==================================================
OFFLINE / NETWORK STATE
==================================================

If the user attempts Google authentication while offline:

Do not pretend the login is working.

Show:

"An internet connection is required to sign in with Google."

Then allow retrying once connectivity returns.

The existing offline capabilities of SmartGrow should not be broken.

==================================================
DESIGN CONSISTENCY
==================================================

Before implementing anything, inspect:

`globals.css`

and existing:

- Dashboard
- Buttons
- Cards
- Typography
- Colors
- Shadows
- Radius
- Icons
- Components

Reuse them where appropriate.

The authentication page should immediately feel like:

"Yes, this is SmartGrow."

==================================================
DO NOT DO THESE THINGS
==================================================

DO NOT:

- Add email/password fields
- Add registration forms
- Add unnecessary social providers
- Add "Remember me"
- Add "Forgot password"
- Add CAPTCHA unless the existing auth architecture requires it
- Add huge decorative gradients
- Add random illustrations
- Add random emojis
- Add excessive cards
- Add excessive animations
- Redesign the dashboard
- Change globals.css unnecessarily
- Create fake security claims
- Hardcode OAuth credentials
- Duplicate authentication logic

==================================================
FINAL QUALITY REVIEW
==================================================

Before considering the implementation complete, review the page as a senior product designer and senior frontend engineer.

Ask:

Does the user immediately understand how to sign in?

Is Google authentication the obvious primary action?

Does the page feel premium?

Does it match SmartGrow?

Does the visual communicate greenhouse + technology?

Is there too much decoration?

Is the page too empty?

Is the Google button visually polished?

Are loading and error states handled?

Does the mobile version feel intentional?

Does successful authentication redirect correctly?

Does an already authenticated user get redirected?

Are authentication secrets handled correctly?

Is the page accessible?

Is the implementation clean and maintainable?

Fix anything that does not meet the quality bar.

FINAL GOAL:

Create a beautiful, calm, premium SmartGrow authentication experience where the user sees the brand, understands what they are accessing, and can securely enter the platform with ONE action:

"Continue with Google."
