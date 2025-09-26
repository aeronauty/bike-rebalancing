export function haversineKm(a:{lat:number;lon:number}, b:{lat:number;lon:number}) {
  const R=6371; const dLat=(b.lat-a.lat)*Math.PI/180; const dLon=(b.lon-a.lon)*Math.PI/180;
  const s1=Math.sin(dLat/2), s2=Math.sin(dLon/2);
  const c1=Math.cos(a.lat*Math.PI/180), c2=Math.cos(b.lat*Math.PI/180);
  const h = s1*s1 + c1*c2*s2*s2;
  return 2*R*Math.asin(Math.min(1, Math.sqrt(h)));
}
export function bboxOf(points:{lat:number;lon:number}[]) {
  const lats=points.map(p=>p.lat), lons=points.map(p=>p.lon);
  return {minLat:Math.min(...lats), maxLat:Math.max(...lats), minLon:Math.min(...lons), maxLon:Math.max(...lons)};
}

