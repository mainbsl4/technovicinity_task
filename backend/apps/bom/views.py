from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import BillOfMaterials
from .serializers import BillOfMaterialsSerializer


class BOMList(APIView):
    """
    List all BOM recipes, or create a new BOM recipe.
    """

    def get(self, request, format=None):
        boms = BillOfMaterials.objects.prefetch_related("items").all()
        serializer = BillOfMaterialsSerializer(boms, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        # Validate that product does not already have a BOM
        product_code = request.data.get("productCode") or request.data.get(
            "product_code"
        )
        if product_code:
            existing = BillOfMaterials.objects.filter(
                product_code__iexact=product_code.strip()
            ).first()
            if existing:
                return Response(
                    {
                        "error": f"Product SKU [{product_code}] is already linked to BOM recipe #{existing.id}. A product cannot have multiple BOMs."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = BillOfMaterialsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BOMDetail(APIView):
    """
    Retrieve, update or delete a BOM recipe instance.
    """

    def get_object(self, pk):
        try:
            clean_pk = str(pk).replace("bom-", "")
            return BillOfMaterials.objects.prefetch_related("items").get(pk=clean_pk)
        except (BillOfMaterials.DoesNotExist, ValueError):
            raise Http404

    def get(self, request, pk, format=None):
        bom = self.get_object(pk)
        serializer = BillOfMaterialsSerializer(bom)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        bom = self.get_object(pk)
        # Check if updating product_code to one that conflicts with another BOM
        new_code = request.data.get("productCode") or request.data.get("product_code")
        if new_code:
            conflict = (
                BillOfMaterials.objects.filter(product_code__iexact=new_code.strip())
                .exclude(pk=bom.pk)
                .first()
            )
            if conflict:
                return Response(
                    {
                        "error": f"Product SKU [{new_code}] is already assigned to another BOM recipe. A product cannot have multiple BOMs."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = BillOfMaterialsSerializer(bom, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        bom = self.get_object(pk)
        bom.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
