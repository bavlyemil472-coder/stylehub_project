from django.urls import path
from .views import (
    CategoryListCreateView, ProductListCreateView,
    ProductDetailView, AddReviewView,
    SectionListView, SubCategoryListView
)

urlpatterns = [
    path('sections/', SectionListView.as_view(), name='section-list'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('subcategories/', SubCategoryListView.as_view(), name='subcategory-list'),
    path('products/', ProductListCreateView.as_view()),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:product_id>/add-review/', AddReviewView.as_view(), name='add-review'),
]
