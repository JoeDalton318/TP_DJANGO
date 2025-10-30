from django.db import models

class Attraction(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    geo_lat = models.FloatField()
    geo_lng = models.FloatField()
    price_level = models.CharField(max_length=10, blank=True)
    category = models.CharField(max_length=100)
    tripadvisor_rating = models.FloatField(default=0.0)
    num_reviews = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Award(models.Model):
    # attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='awards')
    attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.title} ({self.attraction.name})"


class Photo(models.Model):


    # attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='photos')
    attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='photos', null=True, blank=True)
    url = models.URLField()
    

    def __str__(self):
        return f"Photo for {self.attraction.name}"


class Suggestion(models.Model):
    # attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='suggestions')
    # suggested_attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='+')
    attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='suggestions', null=True, blank=True)
    suggested_attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE, related_name='+', null=True, blank=True)

    def __str__(self):
        return f"{self.attraction.name} → {self.suggested_attraction.name}"
