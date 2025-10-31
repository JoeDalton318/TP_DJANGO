from django.contrib import admin
from .models import Compilation, Attraction


class AttractionInline(admin.TabularInline):
    model = Compilation.attractions.through
    extra = 1

class CompilationAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_created', 'attraction_count')
    search_fields = ('user__username',)
    inlines = [AttractionInline]
    exclude = ('attractions',)

    def date_created(self, obj):
        return obj.created_at
    date_created.admin_order_field = 'created_at'
    date_created.short_description = 'Date de création'
    
    def attraction_count(self, obj):
        return obj.attractions.count()
    attraction_count.short_description = 'Nombre d\'attractions'

class AttractionAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_level')
    list_filter = ('price_level',)
    

#Enregistrement
admin.site.register(Compilation, CompilationAdmin)
admin.site.register(Attraction, AttractionAdmin)
