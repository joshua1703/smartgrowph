Act as a senior full-stack website developer and senior UI/UX designer with 10+ years of professional experience building modern SaaS, IoT, agricultural technology, and data-driven web platforms.

You are working on an existing project called "SmartGrow".

IMPORTANT:
The SmartGrow dashboard has ALREADY been designed and implemented. Do NOT redesign, replace, or restructure the existing dashboard.

Your primary task is to design and implement a completely polished, professional, modern PUBLIC LANDING PAGE / FRONT PAGE for SmartGrow.

The existing dashboard already establishes the application's visual identity. You MUST inspect and follow the existing `globals.css`, design tokens, CSS variables, typography, spacing, border radius, shadows, colors, and overall visual language.

The landing page should feel like it belongs to the SAME PRODUCT as the existing dashboard.

---

## PROJECT OVERVIEW

SmartGrow is an automated IoT Smart Greenhouse Management Platform specifically designed for oyster mushroom cultivation.

The system continuously monitors greenhouse environmental conditions and automatically controls climate-regulating hardware to maintain optimal growing conditions, reduce crop loss, and improve cultivation efficiency.

SYSTEM FLOW:

IoT Sensors
↓
ESP32 Controller
↓
Actuators & Relays
↓
MySQL Database
↓
Next.js Web Dashboard

Sensors include:

- DHT22 temperature/humidity sensors
- CO₂ sensors
- Moisture sensors
- Light/Lux sensors

The ESP32 reads environmental data and executes automation triggers.

Actuators include:

- Cooling fans
- Foggers / misting systems
- Sprinklers
- Ventilation systems
- Other greenhouse equipment

The dashboard provides:

- Live environmental monitoring
- Greenhouse zone monitoring
- Automation controls
- Manual overrides
- Cultivation batch tracking
- Growth-stage tracking
- Harvest predictions
- System alerts
- Event logs
- Equipment runtime tracking
- Power consumption monitoring

---

## CORE SMARTGROW CAPABILITIES

1. AUTONOMOUS CLIMATE CONTROL

SmartGrow automatically reacts to environmental conditions.

Example automation rules:

- Activate cooling fans when temperature exceeds 28°C.
- Activate foggers when humidity falls below 80% RH.
- Maintain recommended environmental conditions without constant manual intervention.

Recommended cultivation range:

- Temperature: approximately 24–28°C
- Humidity: approximately 80–95% RH

Do NOT make unrealistic claims such as "guaranteed maximum yield".

Instead communicate the value as:
"Maintain more consistent growing conditions"
"Reduce environmental stress"
"Protect cultivation batches"
"Reduce manual monitoring"

2. REAL-TIME TELEMETRY

SmartGrow continuously collects:

- Temperature
- Humidity
- CO₂
- Moisture
- Light intensity

The system supports multiple greenhouse zones:

- Zone A
- Zone B
- Zone C
- Zone D

3. MANUAL OVERRIDES & AUTOMATION

Operators can:

- Create automation rules
- Configure thresholds
- Set schedules
- Manually toggle equipment
- Override automated behavior when necessary

4. CULTIVATION BATCH TRACKING

SmartGrow tracks mushroom cultivation batches through:

Inoculation
→ Incubation
→ Primordia
→ Fruiting
→ Harvest
→ Completed

The platform can provide:

- Growth tracking
- Batch status
- Growth-rate visualization
- Harvest predictions
- Cultivation history

5. AUDITING & EVENT LOGS

The platform records:

- System events
- Actuator activity
- Runtime duration
- Power consumption
- Alerts
- Automation events

---

## LANDING PAGE OBJECTIVE

The landing page should immediately communicate:

"Smart greenhouse automation for smarter oyster mushroom cultivation."

The visitor should understand within a few seconds:

WHAT IS SMARTGROW?
WHY DOES IT MATTER?
HOW DOES IT WORK?
WHAT CAN IT MONITOR?
WHAT CAN IT AUTOMATE?
HOW DOES IT HELP CULTIVATORS?

The landing page should feel like a professional agricultural technology / IoT SaaS product rather than a generic school project website.

Avoid making it look like:

- A generic admin dashboard
- A template website
- A corporate banking website
- A generic AI startup
- A cryptocurrency website
- A basic Bootstrap landing page

---

## DESIGN DIRECTION

Create a premium, modern IoT/agritech visual identity.

The design should combine:

- Modern SaaS
- Smart agriculture
- IoT technology
- Greenhouse cultivation
- Data visualization
- Natural environmental aesthetics

Use the EXISTING `globals.css` as the source of truth for:

- Primary colors
- Secondary colors
- Background colors
- Text colors
- Borders
- Radius
- Shadows
- Typography
- Design tokens

Do NOT introduce a completely different color palette.

The landing page should visually connect with the existing SmartGrow dashboard.

The aesthetic should be:

Modern
Clean
Technical
Premium
Trustworthy
Fresh
Intelligent
Agricultural
Data-driven

Do not overuse gradients.

Do not use excessive glassmorphism.

Do not make every section a giant card.

Use strong visual hierarchy, whitespace, typography, imagery, subtle borders, and carefully controlled accent colors.

---

## LANDING PAGE STRUCTURE

Build the landing page with the following sections.

1. NAVIGATION BAR

Create a polished responsive navigation.

Suggested structure:

SMARTGROW LOGO

Navigation:

- Home
- Features
- How It Works
- Cultivation
- Monitoring

Right side:

- Sign In
- Open Dashboard / Get Started

The navbar should:

- Feel lightweight
- Be responsive
- Have a subtle background treatment
- Have a polished hover state
- Remain readable over the hero
- Become slightly more solid/stable when scrolling if appropriate

Do not create a huge navbar.

---

2. HERO SECTION

---

This is the most important section.

Create a visually impressive hero that immediately communicates SmartGrow's purpose.

Possible messaging direction:

Eyebrow:
"SMART GREENHOUSE AUTOMATION"

Headline:
"Grow smarter.
Control your greenhouse with confidence."

Alternative:
"Smarter environments.
Healthier mushroom cultivation."

Supporting text:

"SmartGrow connects sensors, automation, and real-time monitoring to help oyster mushroom growers maintain consistent growing conditions with less manual intervention."

Primary CTA:
"Open SmartGrow"

Secondary CTA:
"Explore the System"

The hero should include a strong visual element.

DO NOT create a plain hero consisting only of text.

Use a high-quality greenhouse / oyster mushroom cultivation visual or a carefully designed product visualization.

The visual can combine:

- Oyster mushroom cultivation
- Greenhouse environment
- IoT sensor visualization
- Subtle telemetry overlays
- Temperature/humidity indicators
- Smart equipment indicators

The imagery should feel authentic and technologically sophisticated.

Avoid cheesy stock-photo aesthetics.

---

3. TRUST / QUICK VALUE STRIP

---

Immediately below the hero, introduce a compact value section.

Example:

REAL-TIME MONITORING
Continuous environmental telemetry

AUTOMATED CONTROL
Responsive climate automation

MULTI-ZONE SUPPORT
Monitor multiple greenhouse zones

CULTIVATION TRACKING
Track every growth stage

Keep this section visually simple.

---

4. PROBLEM → SOLUTION SECTION

---

Explain why SmartGrow exists.

Headline:

"Less guesswork. More control."

Explain common cultivation challenges:

- Manually checking environmental conditions
- Sudden temperature changes
- Inconsistent humidity
- Forgetting equipment schedules
- Difficulty monitoring multiple greenhouse zones
- Limited visibility into cultivation progress

Then introduce SmartGrow as the solution.

Use a visually interesting split layout.

One side:
Problem / traditional workflow

Other side:
SmartGrow automated workflow

Use subtle diagrams, icons, or animated indicators.

---

5. HOW SMARTGROW WORKS

---

Create a visual system architecture section.

Show the complete flow:

Sensors
↓
ESP32
↓
Automation
↓
Database
↓
Dashboard

Explain each stage.

Example:

01 — SENSE
Sensors continuously measure environmental conditions.

02 — PROCESS
The ESP32 evaluates readings against configured automation rules.

03 — RESPOND
Fans, foggers, sprinklers, and ventilation equipment respond automatically.

04 — RECORD
Environmental readings and events are stored for historical analysis.

05 — MONITOR
Operators view the system through the SmartGrow dashboard.

Make this section visually engaging.

Consider using an animated data-flow visualization.

For example:
Sensor → signal → controller → actuator → dashboard

Use subtle motion rather than excessive animation.

---

6. REAL-TIME MONITORING SECTION

---

Show what operators can monitor.

Create a beautiful product-style preview of the existing dashboard.

IMPORTANT:
Do NOT redesign the dashboard.

Instead, create a presentation/mockup of the existing dashboard interface.

Show examples such as:

Temperature
26.4°C

Humidity
88%

CO₂
620 ppm

Moisture
74%

Zone A
Optimal

Zone B
Optimal

Zone C
Attention

Zone D
Optimal

Include a small chart visualization if appropriate.

The purpose is to make visitors understand that SmartGrow is a real monitoring platform.

---

7. AUTOMATION SECTION

---

Create a visually strong section explaining automated climate control.

Headline:

"Your greenhouse can respond before you do."

Show example automation:

TEMPERATURE

> 28°C
> ↓
> Cooling Fan
> ACTIVATED

HUMIDITY
< 80% RH
↓
Fogger
ACTIVATED

Make this visually understandable.

Use animated indicators or subtle micro-interactions.

Clearly communicate that these are configurable automation rules.

Avoid implying that these exact thresholds are universally correct for every cultivation setup.

---

8. CULTIVATION LIFECYCLE SECTION

---

Show the complete oyster mushroom cultivation workflow:

Inoculation
→
Incubation
→
Primordia
→
Fruiting
→
Harvest
→
Completed

Make this one of the visually distinctive sections of the page.

Use a timeline or horizontal progression.

Each stage should have:

- Number
- Name
- Short description
- Appropriate visual/icon

Add subtle progress animation as the user scrolls.

---

9. MULTI-ZONE MONITORING

---

Show that SmartGrow can monitor multiple greenhouse areas.

Visualize:

ZONE A
Optimal

ZONE B
Optimal

ZONE C
Attention

ZONE D
Optimal

Use a greenhouse zone diagram or abstract greenhouse visualization.

Do not make this section look like another full dashboard.

It should be a marketing-oriented visualization.

---

10. DATA & AUDITING

---

Explain that SmartGrow does more than display current sensor values.

Show:

Environmental history
Automation events
Equipment runtime
Power consumption
Alerts
Cultivation records

Messaging:

"Every action leaves a trace."

Explain how historical data can help operators understand environmental patterns and system behavior.

---

11. BENEFITS SECTION

---

Create a clean benefits section.

Focus on realistic benefits:

01
Reduce manual monitoring

02
Respond faster to environmental changes

03
Maintain more consistent growing conditions

04
Monitor multiple greenhouse zones

05
Track cultivation progress

06
Understand equipment activity

Avoid exaggerated marketing claims.

---

12. FINAL CTA

---

Create a strong closing section.

Headline:

"Build a smarter growing environment."

Supporting text:

"Bring environmental monitoring, automation, and cultivation tracking into one connected platform."

Primary CTA:
"Open SmartGrow Dashboard"

Secondary CTA:
"Learn How It Works"

This section should feel like the natural conclusion of the page.

---

13. FOOTER

---

Create a professional footer consistent with the dashboard.

Include:

SmartGrow logo

Short description:
"An IoT greenhouse management platform for smarter oyster mushroom cultivation."

Links:
Platform
Features
How It Works
Monitoring
Cultivation

System:
Dashboard
Automation
Zones
Activity Logs

Footer bottom:
© SmartGrow
IoT Greenhouse Management Platform

Do NOT make the footer overly large.

---

## ANIMATION & INTERACTION

Use animation strategically.

The website should feel alive but professional.

Use:

- Smooth scroll animations
- Fade/slide reveals
- Subtle scale interactions
- Animated telemetry indicators
- Data-flow animations
- Hover states
- Button micro-interactions
- Number/count animations where appropriate
- Subtle chart animation

Avoid:

- Excessive bouncing
- Random floating objects
- Aggressive parallax
- Distracting animations
- Animation on every single element
- Long loading animations

Use animation to communicate technology and system behavior.

Prefer modern animation libraries already present in the project.

If Framer Motion / Motion is already installed, use it appropriately.

Do not add unnecessary dependencies unless required.

---

## IMAGERY

The current landing page must NOT feel empty.

Use visual assets strategically.

Potential imagery:

- Oyster mushroom cultivation
- Modern greenhouse interior
- Mushroom fruiting bags
- IoT sensors
- Greenhouse automation
- Environmental monitoring
- Smart agriculture

However, do not fill every section with stock images.

Combine:

- Real imagery
- Product mockups
- UI previews
- Custom diagrams
- Icons
- Data visualizations

The visual language should remain consistent.

---

## RESPONSIVE DESIGN

The landing page MUST be fully responsive.

Desktop:

- Large cinematic hero
- Strong typography
- Multi-column layouts
- Product visualization

Tablet:

- Rebalanced layouts
- Reduced spacing
- Adapted typography

Mobile:

- Clean single-column layout
- Compact navigation
- Touch-friendly buttons
- Proper image scaling
- No horizontal overflow
- No excessively large typography
- Animations should remain performant

Test at:

- 1440px
- 1280px
- 1024px
- 768px
- 430px
- 390px
- 375px

---

## ACCESSIBILITY

Follow professional accessibility standards.

Ensure:

- Good color contrast
- Keyboard navigation
- Visible focus states
- Semantic HTML
- Proper heading hierarchy
- Accessible buttons
- Meaningful alt text
- Reduced-motion support
- No information conveyed only through color

---

## TECHNICAL REQUIREMENTS

Use the existing project's architecture.

Do NOT unnecessarily rewrite the application.

Do NOT modify working dashboard functionality.

Do NOT create a separate unrelated design system.

Reuse existing:

- CSS variables
- Theme tokens
- Components
- Typography
- Buttons
- Icons
- Utility classes
- Existing UI primitives

If shadcn/ui is already configured, use it where appropriate.

Keep components modular.

Suggested structure:

app/
page.tsx

components/
landing/
navbar.tsx
hero.tsx
value-strip.tsx
problem-solution.tsx
system-flow.tsx
monitoring-preview.tsx
automation-section.tsx
cultivation-lifecycle.tsx
zone-monitoring.tsx
audit-section.tsx
benefits.tsx
final-cta.tsx
footer.tsx

Do not force this exact structure if the existing project follows another architecture.

---

## IMPORTANT DESIGN RULES

1. DO NOT redesign the existing dashboard.

2. DO NOT change the existing `globals.css` theme unless absolutely necessary.

3. Treat `globals.css` as the design source of truth.

4. The landing page must look like the same product as the dashboard.

5. Do not use generic SaaS templates.

6. Do not make the website overly minimalist to the point that it feels empty.

7. Do not overload the page with cards.

8. Use real visual hierarchy.

9. Use professional typography.

10. Use imagery and product visuals strategically.

11. Avoid excessive gradients.

12. Avoid excessive glassmorphism.

13. Avoid giant rounded containers everywhere.

14. Avoid unnecessary icons.

15. Every visual element must serve a communication purpose.

16. Prioritize clarity over decoration.

17. Make the page feel like a production-ready agritech SaaS platform.

18. Do not use fake statistics or unsupported claims.

19. Do not claim guaranteed crop yields or guaranteed prevention of crop loss.

20. Make the product feel technically credible.

---

## FINAL QUALITY BAR

Before finishing, review the entire landing page as if you were:

- A senior product designer
- A senior frontend engineer
- An IoT engineer
- A mushroom cultivator
- A first-time visitor

Ask:

"Can someone understand what SmartGrow does within 5 seconds?"

"Does this look like a real IoT product?"

"Does it visually match the existing dashboard?"

"Does the page feel premium and modern?"

"Is there enough visual content?"

"Are the animations purposeful?"

"Does the typography create a strong hierarchy?"

"Does the page feel too empty?"

"Does anything look like a generic template?"

"Does the mobile version feel intentionally designed?"

Fix any issues you identify.

The final result should feel like a polished, production-ready IoT/agritech platform landing page—not a school-project template and not a generic SaaS landing page.
