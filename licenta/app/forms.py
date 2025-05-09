from django import forms
from .models import Location

class LocationForm(forms.ModelForm):
    class Meta:
        model = Location
        fields = ['name', 'latitude', 'longitude', 'description', 'image', 'available']
        # widgets = {
        #     'latitude': forms.HiddenInput(),
        #     'longitude': forms.HiddenInput(),
        # }

    # def clean(self):
    #     cleaned_data = super().clean()
    #     lat = cleaned_data.get('latitude')
    #     lng = cleaned_data.get('longitude')
        
    #     if not lat or not lng:
    #         raise forms.ValidationError('Please select a location on the map')
        
    #     return cleaned_data