from django.db import models

# --- Modèle 1 : Attractions ---
class Attraction(models.Model):
    tripAdvisor_id = models.CharField(max_length=50, unique=True)  
    nom = models.CharField(max_length=100)
    price_level = models.IntegerField (null=False, default=0)
    latitude = models.FloatField(null=False)
    longitude = models.FloatField(null=False)
    categorie = models.CharField(max_length=100)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom
    
# --- Modèle 2 : Compilation ---
class Compilation(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    attractions = models.ManyToManyField(Attraction, related_name='compilations')
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username + " - " + str(self.date_created)