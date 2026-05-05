from rest_framework import generics, status
from .models import product, category, Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet
from .permissions import IsAdminOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = product.objects.filter(is_available=True).prefetch_related('p_images', 'variants')

        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category__id=category_id)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = product.objects.all().prefetch_related('p_images', 'variants')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class AddReviewView(APIView):
    permission_classes = [AllowAny]  # ✅ guest مسموح

    def post(self, request, product_id):
        try:
            target_product = product.objects.get(id=product_id)
            data = request.data

            review = Review.objects.create(
                user=request.user if request.user.is_authenticated else None,  # ✅
                product=target_product,
                rating=data.get('rating', 5),
                comment=data.get('comment', '')
            )
            return Response({'message': 'Review added successfully'}, status=status.HTTP_201_CREATED)
        except product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
