import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'licenta.settings')
django.setup()

from app.models import Location

# Check count
print(Location.objects.count())

# Print each entry
for loc in Location.objects.all():
    print(loc.latitude, loc.longitude)
