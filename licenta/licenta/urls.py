"""
URL configuration for licenta project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from app import views
from accounts import views as acc_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.homepage, name='homepage'),
    path('about/', views.about, name='about'),
    path('signup/', acc_views.signup, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', acc_views.account_logout, name='logout'),
    path('locations/', views.location_list, name='locations'),
    path('addspot/', views.addspot, name='addspot'),
    path('approve-spot/', views.approve_spot, name='approve_spot'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
