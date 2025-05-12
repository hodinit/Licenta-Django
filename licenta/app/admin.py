from django.contrib import admin
from .models import Location

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'approved', 'available', 'added_by', 'latitude', 'longitude')
    list_filter = ('approved', 'available')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('approved', 'available')
    
    def save_model(self, request, obj, form, change):
        if not change:  # If this is a new object
            obj.added_by = request.user
        super().save_model(request, obj, form, change)
