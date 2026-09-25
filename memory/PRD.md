# SILVERSY® — The New Silver

## Original Problem Statement
Build a production-quality, responsive, modern 3D/editorial jewellery brand website for SILVERSY® (tagline: THE NEW SILVER), a 92.5 sterling silver jewellery brand (Instagram @silversy_co, store in Sirhind, Punjab). It is a premium brand showcase / catalogue — NOT ecommerce. Signature feature: a cinematic scroll-controlled hero using the user's real hand-movement video (white mannequin hand wearing silver jewellery on white background), where a giant SILVERSY masthead shrinks and morphs into the actual SILVERSY® logo that becomes the sticky navbar. Light ivory/cream luxury palette (#F5F1EA family), editorial serif typography (Cormorant Garamond) + Manrope sans, selective Three.js, Lenis smooth scroll, GSAP ScrollTrigger, full responsiveness, reduced-motion support, SEO metadata, product modal with WhatsApp/Instagram CTAs (WhatsApp number configurable, not hard-coded).

## User Personas
- Brand visitors discovering SILVERSY via Instagram
- Prospective customers browsing categories/pieces and enquiring via WhatsApp
- The brand owner (updates WhatsApp number, swaps demo imagery, adds address later)

## Core Requirements (static)
- Scroll-scrubbed pinned hero video (no autoplay, reversible), giant masthead → logo morph into sticky nav
- Sections: About, 925 Silver, Categories (Rings/Earrings/Chains/Bracelets/Kada/Payal/Brooch), Signature Pieces (6–8), Look Closer (3D), Craft, Most Loved, Instagram world, Visit (Sirhind), Final CTA, Footer
- Product modal: image, name, category, description, PRICE ON REQUEST, ENQUIRE ON WHATSAPP / VIEW ON INSTAGRAM
- Light theme only, no black backgrounds, editorial typography, no generic ecommerce look
- Mobile-first responsiveness (375/768/1366), no horizontal overflow, reduced-motion fallback, WebGL fallback
- SEO: title "SILVERSY® | The New Silver", description, OG tags, favicon

## Implemented (2026-09-25)
- Hero: pinned GSAP ScrollTrigger timeline; video scrubbed via rAF-lerped currentTime (forward + reverse); white video background blended into cream via mix-blend-multiply on untransformed wrapper (stacking-context-safe) + bottom fade mask; masthead scales/moves into navbar where real transparent logo-mark.png fades in; side editorials fade/parallax; mobile gets square-cropped hero video
- Asset pipeline: hero-web.mp4 (1280w), hero-web.webm (VP9), hero-mobile.mp4 (720×720 crop), posters; logo color-keyed to transparent PNG; SVG sparkle favicon
- Navbar: hidden during hero (except reduced-motion), menu overlay with staggered serif links, search/Instagram/WhatsApp actions
- All 10 sections + marquee + footer built per brief; MaskedLines (useInView on wrapper — avoids IO clip deadlock) + Reveal + ParallaxImage motion system
- Look Closer: lazy React-Three-Fiber silver ring (torus + gem) with procedural Lightformer environment (no external HDR), scroll-driven rotation/camera dolly; static image fallback when WebGL unavailable or reduced motion
- Data-driven products/categories (src/data), 8 demo products with curated placeholder imagery (user will swap)
- WhatsApp number + Instagram URL via REACT_APP_ env vars (placeholder number 910000000000)
- Verified: video scrub forward/reverse, morph-to-logo, nav behavior, modal open, mobile menu, mobile/tablet/desktop layouts, zero horizontal overflow, no console errors

## Backlog
- P0: Replace placeholder WhatsApp number (frontend/.env REACT_APP_WHATSAPP_NUMBER) with real business number
- P0: Swap demo product/category imagery with real SILVERSY photography
- P1: Add exact store address in Sirhind + precise Google Maps link
- P1: Product prices when available
- P1: Dedicated category pages / collection filtering
- P2: Instagram live feed integration (requires API), more 3D pieces, multi-language

## Next Tasks
1. Collect real assets (photos, prices, address, WhatsApp) from user
2. Optional: alpha-channel hero video (hand-alpha.webm) if a cleaner cutout is ever needed
3. Deploy when user confirms
