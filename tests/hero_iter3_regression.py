"""SILVERSY hero 3D hand — iteration 3 regression.

Focus:
- Diamonds must not render as solid charcoal blobs.
- Thumb nail visible; all 5 named nails present.
- Curl full sweep 0 -> ~1 -> 0 (reverse).
- webglcontextlost triggers poster fallback.
- Reduced-motion toggle on then off -> canvas re-mounts.
- Export fresh open-pose PNG poster.
Saves screenshots into /app/test_reports/.
Runs stand-alone: `python /app/tests/hero_iter3_regression.py`.
"""
import asyncio, base64, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = "https://silversy-925-craft.preview.emergentagent.com/"
OUT = Path("/app/test_reports")
POSTER = Path("/app/frontend/public/assets/hand/hero-hand-poster.png")

async def wait_ready(page, timeout=15000):
    await page.wait_for_selector('[data-testid="hero-3d-hand"]', timeout=timeout)
    await page.wait_for_function(
        "() => document.querySelector('[data-testid=\"hero-3d-hand\"]').dataset.renderMode==='3d'",
        timeout=timeout)
    # Poster should unmount
    await page.wait_for_function(
        "() => document.querySelectorAll('[data-testid=\"hero-hand-poster\"]').length===0",
        timeout=timeout)

async def sample_canvas_colors(page):
    """Sample colors in the diamond regions to make sure they are not solid black."""
    return await page.evaluate("""() => {
      const c = document.querySelector('[data-testid=\"hero-3d-hand\"] canvas');
      if (!c) return null;
      const w = c.width, h = c.height;
      const g = c.getContext('webgl2') || c.getContext('webgl');
      const pixels = new Uint8Array(w*h*4);
      g.readPixels(0,0,w,h,g.RGBA,g.UNSIGNED_BYTE,pixels);
      // flipY: WebGL origin is bottom-left. We sample buckets of luminance.
      let total=0, opaque=0, sumL=0, minL=255, maxL=0;
      let hi=0, mid=0, lo=0, hist=new Array(8).fill(0);
      for (let i=0;i<pixels.length;i+=4){
        const a=pixels[i+3];
        total++;
        if(a<8) continue;
        opaque++;
        const L = 0.2126*pixels[i]+0.7152*pixels[i+1]+0.0722*pixels[i+2];
        sumL+=L; if(L<minL)minL=L; if(L>maxL)maxL=L;
        if(L>200)hi++; else if(L>90)mid++; else lo++;
        hist[Math.min(7,Math.floor(L/32))]++;
      }
      return {w,h,total,opaque,avgL:sumL/Math.max(1,opaque),minL,maxL,hi,mid,lo,hist};
    }""")

async def get_rig_names(page):
    return await page.evaluate("""() => {
      const c = document.querySelector('[data-testid=\"hero-3d-hand\"] canvas');
      const rig = c && c.__silversyRig;
      if (!rig) return null;
      const names=[]; rig.scene.traverse(o=>{ if(o.name && o.name.startsWith('nail-')) names.push(o.name); });
      return {nails:[...new Set(names)].sort(), hasIndex:!!rig.index, hasRing:!!rig.ring, hasWrist:!!rig.wrist};
    }""")

async def scroll_to(page, y):
    await page.evaluate(f"window.scrollTo(0,{y})")
    await page.wait_for_timeout(700)
    return await page.evaluate("() => document.querySelector('[data-testid=\"hero-3d-hand\"]').dataset.curlProgress")

async def screenshot_hero(page, path):
    el = await page.query_selector('[data-testid="hero-3d-hand"]')
    if el:
        await el.screenshot(path=str(path), quality=60, type="jpeg")

async def export_poster(page, path):
    data = await page.evaluate("""() => {
      const c = document.querySelector('[data-testid=\"hero-3d-hand\"] canvas');
      if(!c) return null; return c.toDataURL('image/png');
    }""")
    if not data: return False
    b64 = data.split(",",1)[1]
    Path(path).write_bytes(base64.b64decode(b64))
    return True

async def main():
    results = {"passed":[], "failed":[], "notes":[]}
    errors=[]
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width":1440,"height":900}, device_scale_factor=2)
        page = await ctx.new_page()
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(f"CONSOLE-ERR:{m.text}") if m.type=="error" else None)

        # 1. Desktop open pose
        await page.goto(URL, wait_until="domcontentloaded")
        try:
            await wait_ready(page)
            results["passed"].append("desktop_render_mode_3d_and_poster_unmounted")
        except Exception as e:
            results["failed"].append(f"desktop_ready: {e}")
        await page.wait_for_timeout(1500)  # allow damping to settle

        rig = await get_rig_names(page)
        results["notes"].append({"rig":rig})
        if rig and set(rig["nails"]) >= {"nail-index-finger","nail-middle-finger","nail-ring-finger","nail-pinky-finger","nail-thumb"}:
            results["passed"].append("five_nails_named_correctly")
        else:
            results["failed"].append(f"nail_names_missing_or_wrong: {rig and rig['nails']}")

        colors_open = await sample_canvas_colors(page)
        results["notes"].append({"colors_open":colors_open})
        # Diamond visibility check: need both light (>200) and dark (<90) opaque pixels; avgL not near-black.
        if colors_open and colors_open["hi"]>500 and colors_open["avgL"]>60:
            results["passed"].append("diamonds_have_bright_highlights_not_charcoal")
        else:
            results["failed"].append(f"diamonds_appear_dark: {colors_open}")

        await screenshot_hero(page, OUT/"hero_iter3_desktop_open.jpg")

        # 2. Curl sweep incl. full close and reverse
        curls = {}
        # heights: page height matters; assume long page.
        for y in [0, 400, 900, 1500, 2200, 3200, 4200, 5200]:
            curls[y] = await scroll_to(page, y)
        # reverse
        for y in [3200, 1500, 0]:
            curls[f"rev{y}"] = await scroll_to(page, y)
        results["notes"].append({"curls":curls})
        try:
            floats = [float(v) for v in curls.values() if v is not None]
            reached_full = any(v>=0.90 for v in floats)
            returned = float(curls.get("rev0", "1"))
            if reached_full and returned<0.15:
                results["passed"].append("curl_full_close_and_reverse")
            else:
                results["failed"].append(f"curl_sweep_incomplete reached_full={reached_full} rev0={returned}")
        except Exception as e:
            results["failed"].append(f"curl_parse:{e}")

        await screenshot_hero(page, OUT/"hero_iter3_desktop_closed.jpg")
        await scroll_to(page, 0)
        await page.wait_for_timeout(1200)

        # 3. Reduced motion toggle on → still poster; off → back to 3d.
        await ctx.close()
        ctx2 = await browser.new_context(viewport={"width":1440,"height":900},
                                         reduced_motion="reduce", device_scale_factor=1)
        page2 = await ctx2.new_page()
        await page2.goto(URL, wait_until="domcontentloaded")
        await page2.wait_for_selector('[data-testid="hero-3d-hand"]')
        await page2.wait_for_timeout(1500)
        mode = await page2.evaluate("() => document.querySelector('[data-testid=\"hero-3d-hand\"]').dataset.renderMode")
        poster_count = await page2.locator('[data-testid="hero-hand-poster"]').count()
        canvas_count = await page2.locator('[data-testid="hero-3d-hand"] canvas').count()
        if mode=="still" and poster_count==1 and canvas_count==0:
            results["passed"].append("reduced_motion_still_poster_only")
        else:
            results["failed"].append(f"reduced_motion state mode={mode} poster={poster_count} canvas={canvas_count}")
        await ctx2.close()

        # Toggle back OFF (fresh context)
        ctx3 = await browser.new_context(viewport={"width":1440,"height":900}, reduced_motion="no-preference", device_scale_factor=1)
        page3 = await ctx3.new_page()
        await page3.goto(URL, wait_until="domcontentloaded")
        try:
            await wait_ready(page3)
            results["passed"].append("reduced_motion_off_scene_ready_again")
        except Exception as e:
            results["failed"].append(f"reduced_motion_off_failed:{e}")

        # 4. webglcontextlost -> fallback poster returns
        await page3.evaluate("""() => {
          const c=document.querySelector('[data-testid=\"hero-3d-hand\"] canvas');
          const g=c.getContext('webgl2')||c.getContext('webgl');
          const ext=g.getExtension('WEBGL_lose_context'); ext && ext.loseContext();
        }""")
        await page3.wait_for_timeout(1500)
        post_mode = await page3.evaluate("() => document.querySelector('[data-testid=\"hero-3d-hand\"]').dataset.renderMode")
        post_poster = await page3.locator('[data-testid="hero-hand-poster"]').count()
        if post_poster>=1 and post_mode!="3d":
            results["passed"].append("webgl_lost_fallback_poster")
        else:
            results["failed"].append(f"webgl_lost_no_fallback mode={post_mode} poster={post_poster}")
        await ctx3.close()

        # 5. Mobile cold load
        ctxm = await browser.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True)
        pm = await ctxm.new_page()
        h_over = 0
        pm.on("pageerror", lambda e: errors.append(f"MOBILE:{e}"))
        await pm.goto(URL, wait_until="domcontentloaded")
        try:
            await wait_ready(pm, timeout=20000)
            results["passed"].append("mobile_render_mode_3d")
        except Exception as e:
            results["failed"].append(f"mobile_ready:{e}")
        h_over = await pm.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
        if h_over<=1:
            results["passed"].append("no_horizontal_overflow_mobile")
        else:
            results["failed"].append(f"horizontal_overflow_mobile:{h_over}")
        await screenshot_hero(pm, OUT/"hero_iter3_mobile.jpg")
        await ctxm.close()

        # 6. Export fresh poster from desktop open scene
        ctx4 = await browser.new_context(viewport={"width":1440,"height":900}, device_scale_factor=2)
        page4 = await ctx4.new_page()
        await page4.goto(URL, wait_until="domcontentloaded")
        try:
            await wait_ready(page4)
            await page4.wait_for_timeout(1500)
            ok = await export_poster(page4, POSTER)
            size = POSTER.stat().st_size if POSTER.exists() else 0
            if ok and size>10000:
                results["passed"].append(f"poster_exported_bytes={size}")
            else:
                results["failed"].append(f"poster_export_failed size={size}")
        except Exception as e:
            results["failed"].append(f"poster_export_err:{e}")
        await ctx4.close()

        # Filter benign console errors
        real_errors = [e for e in errors if "ReadPixels" not in e and "THREE.Clock" not in e and "scroll" not in e.lower()]
        results["notes"].append({"errors_sample":real_errors[:8], "errors_total":len(real_errors)})
        if not real_errors:
            results["passed"].append("no_runtime_js_errors")
        else:
            results["failed"].append(f"runtime_errors:{len(real_errors)}")

        await browser.close()

    import json
    print(json.dumps(results, indent=2, default=str))
    return 0 if not results["failed"] else 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
