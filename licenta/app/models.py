from django.db import models
from djongo import models as djongo_models
from django.contrib.auth.models import User
from django.utils import timezone

class Payment(models.Model):  
    _id = djongo_models.ObjectIdField()
    payment_type = models.CharField(max_length=10, default='Free')
    fee = models.IntegerField(default=0)
    currency = models.CharField(max_length=3, default='RON')
    payment_methods = models.CharField(max_length=10)

    class Meta:
        db_table = "payment"

class Location(models.Model):
    _id = models.IntegerField(primary_key=True)
    approved = models.BooleanField(default=False)
    name = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='parking_spots/', null=True, blank=True)
    available = models.BooleanField(default=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = "locations"

class ApprovalVote(models.Model):
    _id = models.IntegerField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    class Meta:
        db_table = "spotvote"
        unique_together = ('user', 'location')

