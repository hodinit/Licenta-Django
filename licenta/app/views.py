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
            'payment_type': loc.payment.payment_type,
            'fee': str(loc.payment.fee),
            'currency': loc.payment.currency,
            'payment_methods': loc.payment.payment_methods
        }
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

            last_location = Location.objects.order_by('-_id').first()
            new_location_id = 1 if last_location is None else last_location._id + 1
            spot._id = new_location_id

            is_free = request.POST.get('is_free') == 'on'

            if is_free:
                payment = Payment.objects.get(_id="1")
            else:
                payment = Payment.objects.create(
                    payment_type='Paid',
                    fee=request.POST.get('fee', 0),
                    currency=request.POST.get('currency', 'RON'),
                    payment_methods=request.POST.get('payment_methods')
                )

            spot.payment = payment
            spot.save()
            return redirect('locations')
    else:
        form = LocationForm()
    
    return render(request, 'addspot.html', {'form': form})
