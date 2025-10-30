from django.contrib import admin
from .models import Compilation, Attraction


class AttractionInline(admin.TabularInline):
    model = Compilation.attractions.through
    extra = 1

class CompilationAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_created')
    search_fields = ('user__username',)
    inlines = [AttractionInline]
    exclude = ('attractions',)

class AttractionAdmin(admin.ModelAdmin):
    list_display = ('nom', 'price_level')
    list_filter = ('price_level',)
    

#Enregistrement
admin.site.register(Compilation, CompilationAdmin)
admin.site.register(Attraction, AttractionAdmin)
