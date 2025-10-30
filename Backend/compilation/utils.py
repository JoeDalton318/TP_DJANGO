from math import radians, sin, cos, sqrt, asin

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcule la distance entre deux points géographiques en utilisant la formule de Haversine.
    Retourne la distance en kilomètres.
    """
    # Conversion en radians
    lat1, lon1 = map(radians, [lat1, lon1])
    lat2, lon2 = map(radians, [lat2, lon2])
    
    # Différences de latitude et longitude
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Formule de Haversine
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Rayon de la Terre en km
    r = 6371
    
    return c * r

def sort_by_shortest_route(attractions):
    """
    Implémente l'algorithme du plus proche voisin pour trier les attractions.
    Retourne (attractions_triées, distance_totale).
    """
    if not attractions:
        return [], 0
    
    unvisited = list(attractions)
    route = [unvisited.pop(0)]  # Commence par la première attraction
    total_distance = 0
    
    while unvisited:
        current = route[-1]
        min_distance = float('inf')
        next_attraction = None
        next_index = 0
        
        # Trouve l'attraction non visitée la plus proche
        for i, attraction in enumerate(unvisited):
            distance = calculate_distance(
                current.latitude, current.longitude,
                attraction.latitude, attraction.longitude
            )
            if distance < min_distance:
                min_distance = distance
                next_attraction = attraction
                next_index = i
        
        # Ajoute la prochaine attraction à la route
        route.append(unvisited.pop(next_index))
        total_distance += min_distance
    
    return route, total_distance