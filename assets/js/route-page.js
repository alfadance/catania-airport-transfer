// Pagine catania-airport-to-<tratta>.html: la mappa animata del percorso. La tratta e il prezzo stanno nell'elemento #trip-map
// (data-route = id della tratta, data-price = prezzo Sedan di giorno). Se la mappa non parte, il riquadro sparisce e la pagina resta intera.
import { createRouteMap, loadRoutes, whenNearView } from './routemap.js';

const box = document.getElementById('trip-map');

if (box) {
  const map = createRouteMap(box);
  const hideCard = () => { box.hidden = true; };
  whenNearView(box, (resuming) => {
    if (resuming) {
      map.resume();
      return;
    }
    loadRoutes().then((all) => {
      const route = all.find((item) => item.nome.toLowerCase().replaceAll(' ', '-') === box.dataset.route);
      if (!route) throw new Error('route');
      map.showRoute({
        points: route.coordinate,
        fromName: 'Catania Airport',
        toName: route.nome,
        price: `€${box.dataset.price}`,
        padding: { top: 48, right: 56, bottom: 96, left: 56 },
      });
    }).catch(hideCard);
  }, () => map.stop());
}
