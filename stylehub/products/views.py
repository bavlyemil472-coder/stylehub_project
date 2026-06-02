from rest_framework import generics, status
from .models import product, Category, Section, SubCategory, Review, AnnouncementBar
from .serializers import (
    ProductSerializer, CategorySerializer, SectionSerializer,
    SubCategorySerializer, ReviewSerializer, AnnouncementBarSerializer
)
from rest_framework.permissions import AllowAny
from .permissions import IsAdminOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response


class SectionListView(generics.ListCreateAPIView):
    queryset = Section.objects.all().prefetch_related('categories__subcategories')
    serializer_class = SectionSerializer
    permission_classes = [IsAdminOrReadOnly]


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().prefetch_related('subcategories')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class SubCategoryListView(generics.ListCreateAPIView):
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = SubCategory.objects.all()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category__id=category_id)
        return queryset


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = product.objects.filter(is_available=True).prefetch_related('p_images', 'variants')
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category__id=category_id)
        subcategory_id = self.request.query_params.get('subcategory')
        if subcategory_id:
            queryset = queryset.filter(subcategory__id=subcategory_id)
        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(category__section__id=section_id)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = product.objects.all().prefetch_related('p_images', 'variants')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class AddReviewView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, product_id):
        try:
            target_product = product.objects.get(id=product_id)
            data = request.data
            Review.objects.create(
                user=request.user if request.user.is_authenticated else None,
                product=target_product,
                rating=data.get('rating', 5),
                comment=data.get('comment', '')
            )
            return Response({'message': 'Review added successfully'}, status=status.HTTP_201_CREATED)
        except product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


# ✅ الجديد: view الشريط الإعلاني
class AnnouncementBarView(generics.ListAPIView):
    serializer_class = AnnouncementBarSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return AnnouncementBar.objects.filter(is_active=True)
