from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Location, Payment, ApprovalVote
from .forms import LocationForm
import json

def hello_world(request):
    return HttpResponse("hello, world")

def location_list(request):
    locations = Location.objects.all()
    locations_list = []
    
    for loc in locations:
        has_voted = False
        if request.user.is_authenticated:
            has_voted = ApprovalVote.objects.filter(user=request.user, location=loc).exists()
        
        location_data = {
            '_id': str(loc._id),
            'name': loc.name,
            'latitude': loc.latitude, 
            'longitude': loc.longitude,
            'image': loc.image.url if loc.image and loc.image.name else None,
            'approved': loc.approved,
            'hasVoted': has_voted,
            'payment': {
                'payment_type': loc.payment.payment_type,
                'fee': str(loc.payment.fee),
                'currency': loc.payment.currency,
                'payment_methods': loc.payment.payment_methods
            }
        }
        locations_list.append(location_data)
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

            is_free = request.POST.get('is_free')

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

@login_required
def approve_spot(request):
    if request.method == 'POST':
        try:
            
            data = json.loads(request.body)
            spot_id = data.get('spot_id')

            if spot_id is None:
                return JsonResponse({'success': False, 'error': 'Invalid data'}, status=400)

            location = Location.objects.get(_id=spot_id)
            
            # Check if user has already voted
            if ApprovalVote.objects.filter(user=request.user, location=location).exists():
                return JsonResponse({'success': False, 'error': 'You have already voted for this spot'}, status=400)            # Get the last vote to determine the next ID
            last_vote = ApprovalVote.objects.order_by('-_id').first()
            new_vote_id = 1 if last_vote is None else last_vote._id + 1
            
            # Create new vote
            ApprovalVote.objects.create(
                _id=new_vote_id,
                user=request.user, 
                location=location
            )
            
            # Count total votes
            vote_count = ApprovalVote.objects.filter(location=location).count()
            
            # If we have 2 or more votes, approve the spot
            if vote_count >= 2:
                location.approved = True
                location.save()
            
            return JsonResponse({
                'success': True, 
                'approved': location.approved,
                'voteCount': vote_count,
                'hasVoted': True
            })
            
        except Location.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Location not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)