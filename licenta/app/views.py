from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Location, Payment
from .forms import LocationForm
import json

def hello_world(request):
    return HttpResponse("hello, world")

def location_list(request):
    locations = Location.objects.all()
    locations_list = [{
        'name': loc.name,
        'latitude': loc.latitude, 
        'longitude': loc.longitude,
        'image': loc.image.url if loc.image and loc.image.name else None,
        'approved': loc.approved,
        'payment': {
            'payment_type': loc.payment.payment_type if loc.payment else 'Free',
            'fee': str(loc.payment.fee) if loc.payment and loc.payment.fee != 'Free' else 'Free',
            'currency': loc.payment.currency if loc.payment else 'RON',
            'payment_methods': loc.payment.payment_methods if loc.payment else 'None'
        } if loc.payment else None
    } for loc in locations]
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

            is_free = request.POST.get('is_free') == 'on'
            payment = Payment()
            
            if is_free:
                payment.payment_type = 'Free'
                payment.fee = 0
                payment.currency = 'RON'
                payment.payment_methods = 'None'
            else:
                payment.payment_type = 'Paid'
                payment.fee = request.POST.get('fee', 0)
                payment.currency = request.POST.get('currency', 'RON')
                payment.payment_methods = request.POST.get('payment_methods')
            
            payment.save()
            spot.payment = payment
            spot.save()
            
            return redirect('locations')
    else:
        form = LocationForm()
    
    return render(request, 'addspot.html', {'form': form})
