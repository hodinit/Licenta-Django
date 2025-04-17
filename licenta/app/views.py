from django.shortcuts import render
from django.http import HttpResponse
from .models import Location

def hello_world(request):
    return HttpResponse("hello, world")

def location_list(request):
    locations = Location.objects.all()
    return render(request, 'locations.html', {'locations': locations})
