from django.db import models
from djongo import models as djongo_models
from bson import ObjectId

class Location(models.Model):
    name = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        db_table = "locations"

