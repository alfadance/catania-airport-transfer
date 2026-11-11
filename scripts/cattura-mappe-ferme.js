// Immagini ferme delle mappe delle pagine di tratta: veste/src/assets/img/map-trip-<data-route>.webp (regole in veste/src/pages/_route-page.css).
// Come si rifanno:
// 1. servire il sito: python -m http.server 8765 --bind 127.0.0.1 (dalla radice del sito);
// 2. incollare questa funzione in browser_run_code del server MCP di Playwright (il server legge e scrive solo dentro
//    la cartella del vault cevvello: per questo OUT sta li');
// 3. convertire i PNG in WebP (qualita' 78) con nome uguale e copiarli in veste/src/assets/img/, poi node veste/build.mjs.
//    Il build copia in assets/img solo i file nuovi: un'immagine rifatta va copiata anche li'.
// Disegna la mappa con createRouteMap del sito in un riquadro 824x400, senza prezzo (nessun numero dentro un'immagine),
// con movimento ridotto (percorso gia' completo). I margini laterali larghi tengono percorso e cartellini nella parte
// centrale, quella che resta visibile con background-size: cover a 390, 768 e 1440 px (proporzioni del riquadro 1,37-2,08).
async (page) => {
  const BASE = 'http://127.0.0.1:8765';
  const OUT = 'C:/Users/sebyv/Documents/cevvello/.playwright-mcp/mappe-ferme';
  const PAGINE = ['taormina', 'giardini-naxos', 'siracusa', 'catania', 'milazzo', 'cefalu', 'agrigento', 'palermo-airport', 'etna'];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1000, height: 600 });
  const fatti = [];
  for (const pagina of PAGINE) {
    await page.goto(`${BASE}/catania-airport-to-${pagina}.html`);
    const routeId = await page.evaluate(async () => {
      document.getElementById('cattura')?.remove();
      const { createRouteMap, loadRoutes } = await import('/assets/js/routemap.js');
      const { townId } = await import('/assets/js/pricing.js');
      const box = document.getElementById('trip-map');
      const route = box.dataset.routeFile
        ? await (await fetch(box.dataset.routeFile)).json()
        : (await loadRoutes()).find((item) => townId(item.nome) === box.dataset.route);
      if (!route) throw new Error(`tratta non trovata: ${box.dataset.route}`);
      const cattura = document.createElement('div');
      cattura.id = 'cattura';
      cattura.className = 'map-box';
      cattura.style.cssText = 'position:fixed;left:0;top:0;width:824px;height:400px;z-index:2147483647;margin:0;border-radius:0';
      document.body.append(cattura);
      await createRouteMap(cattura).showRoute({
        points: route.coordinate,
        fromName: route.da || 'Catania Airport',
        toName: route.nome,
        price: '',
        padding: { top: 56, right: 230, bottom: 56, left: 230 },
      });
      return box.dataset.route;
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    if (await page.locator('#cattura .map-price:not([hidden])').count()) throw new Error(`cartellino del prezzo visibile: ${pagina}`);
    await page.locator('#cattura').screenshot({ path: `${OUT}/map-trip-${routeId}.png` });
    fatti.push(routeId);
  }
  return fatti;
}
