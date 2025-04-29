from django.shortcuts import render
from django.http import HttpResponse
from django.core.serializers import serialize
from .models import Location
import json

def hello_world(request):
    return HttpResponse("hello, world")

def location_list(request):
    locations = Location.objects.all()
    locations_list = [{'name': loc.name, 'latitude': loc.latitude, 'longitude': loc.longitude} for loc in locations]
    return render(request, 'locations.html', {'locations': json.dumps(locations_list)})

def homepage(request):
    return render(request, 'homepage.html')

def addspot(request):
    return render(request, 'addspot.html')
