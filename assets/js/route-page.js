// Pagine catania-airport-to-<tratta>.html: la mappa animata del percorso. La tratta e il prezzo stanno nell'elemento #trip-map
// (data-route = id della tratta, data-price = prezzo Sedan di giorno). Se la mappa non parte, il riquadro sparisce e la pagina resta intera.
import { createRouteMap, loadRoutes, whenNearView } from './routemap.js';
import { townId } from './pricing.js';

const box = document.getElementById('trip-map');

if (box) {
  const map = createRouteMap(box);
  const hideCard = () => { box.hidden = true; };
  whenNearView(box, (resuming) => {
    if (resuming) {
      map.resume();
      return;
    }
    // data-route-file: percorso in un file a parte (Etna, parte da Catania centro e non dall'aeroporto): non entra in routes.json,
    // altrimenti comparirebbe anche nella mappa di tutte le tratte in home.
    const caricamento = box.dataset.routeFile
      ? fetch(box.dataset.routeFile).then((response) => {
        if (!response.ok) throw new Error('route-file');
        return response.json();
      }).then((route) => [route])
      : loadRoutes();
    caricamento.then((all) => {
      const route = box.dataset.routeFile ? all[0] : all.find((item) => townId(item.nome) === box.dataset.route);
      if (!route) throw new Error('route');
      map.showRoute({
        points: route.coordinate,
        fromName: route.da || 'Catania Airport',
        toName: route.nome,
        price: `€${box.dataset.price}`,
        // Etna (percorso verso nord, parte da Catania centro): piu' spazio in alto, altrimenti il cartellino del prezzo esce dal riquadro.
        padding: { top: route.da ? 84 : 48, right: 56, bottom: 96, left: 56 },
      });
    }).catch(hideCard);
  }, () => map.stop());
}
