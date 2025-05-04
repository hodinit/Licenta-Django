from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Location
from .forms import LocationForm
import json

def hello_world(request):
    return HttpResponse("hello, world")

def location_list(request):
    locations = Location.objects.all()
    locations_list = [{'name': loc.name, 'latitude': loc.latitude, 'longitude': loc.longitude} for loc in locations]
    return render(request, 'locations.html', {'locations': json.dumps(locations_list)})

def homepage(request):
    return render(request, 'homepage.html')

@login_required
def addspot(request):
    if request.method == 'POST':
        form = LocationForm(request.POST, request.FILES)
        if form.is_valid():
            spot = form.save(commit=False)
            spot.added_by = request.user
            spot.save()
            return redirect('locations')
    else:
        form = LocationForm()
    
    return render(request, 'addspot.html', {'form': form})
