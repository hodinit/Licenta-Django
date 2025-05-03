from django.db import models
from djongo import models as djongo_models
from django.contrib.auth.models import User
from django.utils import timezone

class Location(models.Model):
    approved = models.BooleanField(default=False)
    name = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='parking_spots/', null=True, blank=True)
    available = models.BooleanField(default=True)  # True=spot is available, False=spot is occupied
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateField(auto_now_add=True)  # Changed from DateTimeField to DateField
    updated_at = models.DateField(auto_now=True)      # Changed from DateTimeField to DateField

    class Meta:
        db_table = "locations"

