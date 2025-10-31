from math import radians, sin, cos, sqrt, asin
from typing import List, Tuple

def _f(x):
    try:
        return float(x) if x is not None else None
    except (TypeError, ValueError):
        return None

def calculate_distance(lat1, lon1, lat2, lon2) -> float:
    """
    Distance en kilomètres entre deux points (Haversine).
    """
    lat1, lon1, lat2, lon2 = _f(lat1), _f(lon1), _f(lat2), _f(lon2)
    if None in (lat1, lon1, lat2, lon2):
        return float('inf')
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371.0
    return c * r

def sort_by_shortest_route(attractions: List[object]) -> Tuple[List[object], float]:
    """
    Heuristique du plus proche voisin. Attends .latitude/.longitude.
    Retourne (route_ordonnée, distance_totale_km).
    """
    if not attractions:
        return [], 0.0

    unvisited = list(attractions)
    route = [unvisited.pop(0)]
    total_distance = 0.0

    while unvisited:
        current = route[-1]
        best_idx = None
        best_dist = float('inf')
        for i, a in enumerate(unvisited):
            d = calculate_distance(getattr(current, 'latitude', None), getattr(current, 'longitude', None),
                                   getattr(a, 'latitude', None), getattr(a, 'longitude', None))
            if d < best_dist:
                best_dist = d
                best_idx = i
        if best_idx is None:
            break
        total_distance += 0.0 if best_dist == float('inf') else best_dist
        route.append(unvisited.pop(best_idx))

    return route, round(total_distance, 3)