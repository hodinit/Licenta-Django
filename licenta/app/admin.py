from django.contrib import admin
from .models import Location

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'approved', 'available', 'added_by', 'latitude', 'longitude')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at', 'payment')
    list_editable = ('approved', 'available')
    
