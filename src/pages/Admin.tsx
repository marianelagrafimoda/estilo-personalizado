import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  ImageIcon, 
  Tag, 
  ShoppingBag, 
  Edit3, 
  Save, 
  X, 
  Palette,
  Package,
  Plus,
  Trash2,
  Loader2,
  Instagram,
  Facebook,
  RefreshCcw,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useSiteInfo } from '../contexts/SiteContext';
import { useProducts, Color, Product } from '../contexts/ProductContext';
import { useToast } from '../hooks/use-toast';
import ImageUploader from '../components/ImageUploader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { setupDatabase } from '../lib/supabase';
import { logAdminActivity } from '../lib/admin-activity-logger';
import ProductEditor from '../components/ProductEditor';
import ProductImagesUploader from '../components/ProductImagesUploader';
import ProductDetailModal from '../components/ProductDetailModal';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { siteInfo, updateSiteInfo, uploadSiteImage, clearAllImages, isLoading: isSiteLoading } = useSiteInfo();
  const { products, updateProduct, addProduct, removeProduct, uploadProductImage, isLoading: isProductsLoading } = useProducts();
  const { toast } = useToast();
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const [newSlogan, setNewSlogan] = useState(siteInfo.slogan);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState(siteInfo.whatsappNumber);
  const [newInstagramLink, setNewInstagramLink] = useState(siteInfo.instagramLink || 'https://www.instagram.com/');
  const [newFacebookLink, setNewFacebookLink] = useState(siteInfo.facebookLink || 'https://www.facebook.com/');
  const [newCarouselImages, setNewCarouselImages] = useState<string[]>(siteInfo.carouselImages);
  
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isUploadingCarousel, setIsUploadingCarousel] = useState(false);
  const [isClearingImages, setIsClearingImages] = useState(false);
  
  const [newMaterialsTitle, setNewMaterialsTitle] = useState(siteInfo.materialsTitle);
  const [newMaterialsDesc, setNewMaterialsDesc] = useState(siteInfo.materialsDescription);
  const [newDesignTitle, setNewDesignTitle] = useState(siteInfo.designTitle);
  const [newDesignDesc, setNewDesignDesc] = useState(siteInfo.designDescription);
  const [newServiceTitle, setNewServiceTitle] = useState(siteInfo.serviceTitle);
  const [newServiceDesc, setNewServiceDesc] = useState(siteInfo.serviceDescription);
  const [newFaqTitle, setNewFaqTitle] = useState(siteInfo.faqTitle);
  const [newUniqueStyleTitle, setNewUniqueStyleTitle] = useState(siteInfo.uniqueStyleTitle);
  
  const [newProduct, setNewProduct] = useState<Product>({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    images: [],
    cardColor: '#C8B6E2',
    stockQuantity: 0,
    sizes: [
      { id: 's', name: 'S', available: true, isChildSize: false },
      { id: 'm', name: 'M', available: true, isChildSize: false },
      { id: 'l', name: 'L', available: true, isChildSize: false },
      { id: 'xl', name: 'XL', available: true, isChildSize: false },
      { id: 'kids-s', name: 'Niños S', available: true, isChildSize: true },
      { id: 'kids-m', name: 'Niños M', available: true, isChildSize: true },
      { id: 'kids-l', name: 'Niños L', available: true, isChildSize: true }
    ],
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF' }
    ],
    id: '' // Will be set when adding
  });

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
    
    setupDatabase().catch(error => {
      console.error("Error setting up database from AdminPage:", error);
    });
  }, [isAuthenticated, isAdmin, navigate]);

  React.useEffect(() => {
    if (!isSiteLoading) {
      setNewSlogan(siteInfo.slogan);
      setNewWhatsappNumber(siteInfo.whatsappNumber);
      setNewInstagramLink(siteInfo.instagramLink || 'https://www.instagram.com/');
      setNewFacebookLink(siteInfo.facebookLink || 'https://www.facebook.com/');
      setNewCarouselImages(siteInfo.carouselImages);
      setNewMaterialsTitle(siteInfo.materialsTitle);
      setNewMaterialsDesc(siteInfo.materialsDescription);
      setNewDesignTitle(siteInfo.designTitle);
      setNewDesignDesc(siteInfo.designDescription);
      setNewServiceTitle(siteInfo.serviceTitle);
      setNewServiceDesc(siteInfo.serviceDescription);
      setNewFaqTitle(siteInfo.faqTitle);
      setNewUniqueStyleTitle(siteInfo.uniqueStyleTitle);
    }
  }, [siteInfo, isSiteLoading]);

  const handleSiteInfoUpdate = () => {
    updateSiteInfo({
      slogan: newSlogan,
      whatsappNumber: newWhatsappNumber,
      instagramLink: newInstagramLink,
      facebookLink: newFacebookLink,
      carouselImages: newCarouselImages,
      materialsTitle: newMaterialsTitle,
      materialsDescription: newMaterialsDesc,
      designTitle: newDesignTitle,
      designDescription: newDesignDesc,
      serviceTitle: newServiceTitle,
      serviceDescription: newServiceDesc,
      faqTitle: newFaqTitle,
      uniqueStyleTitle: newUniqueStyleTitle
    });
    toast({
      title: "¡Actualizado!",
      description: "Información del sitio actualizada con éxito",
      duration: 3000,
    });
  };

  const removeCarouselImage = (image: string) => {
    setNewCarouselImages(newCarouselImages.filter(img => img !== image));
  };
  
  const handleClearAllImages = async () => {
    if (window.confirm('¿Está seguro que desea eliminar todas las imágenes del carrusel?')) {
      setIsClearingImages(true);
      try {
        await clearAllImages();
        setNewCarouselImages([]);
        
        if (user && user.isAdmin) {
          await logAdminActivity({
            adminEmail: user.email,
            actionType: 'delete',
            entityType: 'carousel_image',
            details: {
              action: 'clear_all_images'
            }
          });
        }
      } finally {
        setIsClearingImages(false);
      }
    }
  };
  
  const handleUploadCarouselImage = async (file: File) => {
    setIsUploadingCarousel(true);
    try {
      await setupDatabase();
      
      const imageUrl = await uploadSiteImage(file);
      setNewCarouselImages(prev => [...prev, imageUrl]);
      
      if (user && user.isAdmin) {
        await logAdminActivity({
          adminEmail: user.email,
          actionType: 'create',
          entityType: 'carousel_image',
          details: {
            filename: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });
      }
      
      return imageUrl;
    } finally {
      setIsUploadingCarousel(false);
    }
  };
  
  const handleUploadProductImage = async (file: File) => {
    setIsUploadingProduct(true);
    try {
      const imageUrl = await uploadProductImage(file);
      
      // If editing product, do nothing here (handled in ProductEditor)
      // If new product, set as main image and add to images array
      if (!editingProduct) {
        setNewProduct(prev => ({ 
          ...prev, 
          imageUrl: imageUrl,
          images: [...(prev.images || []), imageUrl]
        }));
      }
      
      if (user && user.isAdmin) {
        await logAdminActivity({
          adminEmail: user.email,
          actionType: 'create',
          entityType: 'product_image',
          details: {
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            productTitle: editingProduct ? editingProduct.title : newProduct.title
          }
        });
      }
      
      return imageUrl;
    } finally {
      setIsUploadingProduct(false);
    }
  };
  
  const handleProductImagesChange = (newImages: string[]) => {
    setNewProduct({
      ...newProduct,
      images: newImages,
      // Update imageUrl to be the first image, for backwards compatibility
      imageUrl: newImages.length > 0 ? newImages[0] : ''
    });
  };

  const handleAddProduct = () => {
    if (
      newProduct.title &&
      newProduct.price > 0
    ) {
      const productToAdd = {
        ...newProduct,
        id: crypto.randomUUID(),
        title: newProduct.title,
        description: newProduct.description || '',
        price: newProduct.price,
        imageUrl: newProduct.imageUrl || '/placeholder.svg',
        images: newProduct.images || [],
        stockQuantity: newProduct.stockQuantity,
        cardColor: newProduct.cardColor,
        sizes: newProduct.sizes,
        colors: newProduct.colors
      };
      
      addProduct(productToAdd);
      
      setNewProduct({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        images: [],
        cardColor: '#C8B6E2',
        stockQuantity: 0,
        sizes: [
          { id: 's', name: 'S', available: true, isChildSize: false },
          { id: 'm', name: 'M', available: true, isChildSize: false },
          { id: 'l', name: 'L', available: true, isChildSize: false },
          { id: 'xl', name: 'XL', available: true, isChildSize: false },
          { id: 'kids-s', name: 'Niños S', available: true, isChildSize: true },
          { id: 'kids-m', name: 'Niños M', available: true, isChildSize: true },
          { id: 'kids-l', name: 'Niños L', available: true, isChildSize: true }
        ],
        colors: [
          { id: 'white', name: 'Blanco', hex: '#FFFFFF' }
        ],
        id: ''
      });
      
      toast({
        title: "¡Producto agregado!",
        description: "El producto ha sido agregado exitosamente",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor complete el título y precio del producto",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const startEditingProduct = (product: Product) => {
    // Make sure the product has all necessary fields
    const hasKidsSizes = product.sizes.some((size) => 
      size.id === 'kids-s' || size.id === 'kids-m' || size.id === 'kids-l' || size.isChildSize
    );
    
    const productToEdit = {
      ...product,
      // Initialize images array if it doesn't exist
      images: product.images || (product.imageUrl ? [product.imageUrl] : [])
    };
    
    if (!hasKidsSizes) {
      const updatedSizes = [
        ...productToEdit.sizes,
        { id: 'kids-s', name: 'Niños S', available: false, isChildSize: true },
        { id: 'kids-m', name: 'Niños M', available: false, isChildSize: true },
        { id: 'kids-l', name: 'Niños L', available: false, isChildSize: true }
      ];
      setEditingProduct({...productToEdit, sizes: updatedSizes});
    } else {
      setEditingProduct(productToEdit);
    }
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
  };

  const saveEditedProduct = (updatedProduct: Product) => {
    updateProduct(updatedProduct.id, updatedProduct);
    setEditingProduct(null);
    toast({
      title: "¡Actualizado!",
      description: "Producto actualizado con éxito",
      duration: 3000,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      removeProduct(productId);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
        duration: 3000,
      });
    }
  };

  const toggleSizeAvailability = (product: Product, sizeId: string) => {
    const updatedSizes = product.sizes.map(size => 
      size.id === sizeId ? { ...size, available: !size.available } : size
    );
    
    const productToUpdate = {
      ...product,
      sizes: updatedSizes
    };
    
    updateProduct(product.id, productToUpdate);
  };

  const previewProductDetails = (product: Product) => {
    setPreviewProduct(product);
    setIsPreviewModalOpen(true);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (isSiteLoading || isProductsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-lilac" />
        <p className="mt-4 text-lg">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-center text-lilac-dark">
            Panel de Administración
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Gestione los productos y la información del sitio
          </p>
        </div>

        <Tabs defaultValue="site-info" className="w-full">
          <TabsList className="w-full mb-8 bg-lilac/20 p-1 rounded-lg flex flex-wrap">
            <TabsTrigger value="site-info" className="flex-1 data-[state=active]:bg-lilac data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Información del Sitio
            </TabsTrigger>
            <TabsTrigger value="carousel" className="flex-1 data-[state=active]:bg-lilac data-[state=active]:text-white">
              <ImageIcon className="w-4 h-4 mr-2" />
              Imágenes de Carrusel
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 data-[state=active]:bg-lilac data-[state=active]:text-white">
              <Tag className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="site-info" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-lilac/20">
              <CardHeader>
                <CardTitle className="font-serif">Información General</CardTitle>
                <CardDescription>
                  Actualice la información básica de su tienda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Eslogan de la Tienda</label>
                  <Input
                    value={newSlogan}
                    onChange={(e) => setNewSlogan(e.target.value)}
                    placeholder="Ingrese el eslogan de la tienda"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Número de WhatsApp</label>
                  <Input
                    value={newWhatsappNumber}
                    onChange={(e) => setNewWhatsappNumber(e.target.value)}
                    placeholder="Ej: +593990893095"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                  <p className="text-xs text-gray-500">
                    Incluya el código de país con el signo +
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    Enlace de Instagram
                  </label>
                  <Input
                    value={newInstagramLink}
                    onChange={(e) => setNewInstagramLink(e.target.value)}
                    placeholder="https://www.instagram.com/su_cuenta/"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Enlace de Facebook
                  </label>
                  <Input
                    value={newFacebookLink}
                    onChange={(e) => setNewFacebookLink(e.target.value)}
                    placeholder="https://www.facebook.com/su_pagina/"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-3">Textos Personalizables</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Título Personalización</label>
                      <Input
                        value={newUniqueStyleTitle}
                        onChange={(e) => setNewUniqueStyleTitle(e.target.value)}
                        placeholder="¿Quieres un estilo realmente único?"
                        className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título Materiales</label>
                        <Input
                          value={newMaterialsTitle}
                          onChange={(e) => setNewMaterialsTitle(e.target.value)}
                          placeholder="Título para sección de materiales"
                          className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción Materiales</label>
                        <Input
                          value={newMaterialsDesc}
                          onChange={(e) => setNewMaterialsDesc(e.target.value)}
                          placeholder="Descripción para sección de materiales"
                          className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título Diseño</label>
                        <Input
                          value={newDesignTitle}
                          onChange={(e) => setNewDesignTitle(e.target.value)}
                          placeholder="Título para sección de diseño"
                          className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción Diseño</label>
                        <Input
                          value={newDesignDesc}
                          onChange={(e) => setNewDesignDesc(e.target.value)}
                          placeholder="Descripción para sección de diseño"
                          className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título Atención</label>
                        <Input
                          value={newServiceTitle}
                          onChange={(e) => setNewServiceTitle(e.target.value)}
                          placeholder="Título para sección de atención"
                          className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción Atención</label>
                        <Input
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          placeholder="Descripción para sección de atención"
                          className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-3">Sección "Preguntas Frecuentes"</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título FAQ</label>
                    <Input
                      value={newFaqTitle}
                      onChange={(e) => setNewFaqTitle(e.target.value)}
                      placeholder="Título para sección de FAQ"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSiteInfoUpdate} 
                  className="w-full bg-lilac hover:bg-lilac-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="carousel" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-lilac/20">
              <CardHeader>
                <CardTitle className="font-serif">Imágenes del Carrusel</CardTitle>
                <CardDescription>
                  Administre las imágenes que se muestran en el carrusel de la página principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Imágenes actuales:</h3>
                    <Button 
                      onClick={handleClearAllImages} 
                      variant="destructive" 
                      size="sm"
                      disabled={isClearingImages || newCarouselImages.length === 0}
                    >
                      {isClearingImages ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-4 w-4 mr-1" />
                      )}
                      Eliminar todas
                    </Button>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium mb-2">Subir imagen para el carrusel:</h3>
                    <ImageUploader 
                      onImageUpload={handleUploadCarouselImage} 
                      label="Subir imagen para el carrusel"
                      maxSize={10}
                      bucketType="site_images"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {newCarouselImages.map((image, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden group">
                      <img 
                        src={image} 
                        alt={`Carrusel ${index + 1}`} 
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={() => removeCarouselImage(image)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Eliminar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSiteInfoUpdate} 
                  className="w-full bg-lilac hover:bg-lilac-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-lilac/20">
              <CardHeader>
                <CardTitle className="font-serif">Agregar Nuevo Producto</CardTitle>
                <CardDescription>
                  Complete el formulario para agregar un nuevo producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                      placeholder="Nombre del producto"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio ($)</label>
                    <Input
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Descripción corta del producto"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imágenes del Producto</label>
                  <div className="mt-2">
                    <ProductImagesUploader 
                      images={newProduct.images || []}
                      onImagesChange={handleProductImagesChange}
                      onImageUpload={handleUploadProductImage}
                      maxImages={6}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad en Stock</label>
                  <Input
                    type="number"
                    value={newProduct.stockQuantity || ''}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    min="0"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Color de la Tarjeta
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={newProduct.cardColor}
                      onChange={(e) => setNewProduct({...newProduct, cardColor: e.target.value})}
                      className="w-10 h-10 rounded border p-1"
                    />
                    <Input
                      value={newProduct.cardColor}
                      onChange={(e) => setNewProduct({...newProduct, cardColor: e.target.value})}
                      placeholder="#C8B6E2"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tallas Disponibles</label>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Tallas para adultos:</p>
                    <div className="flex flex-wrap gap-2">
                      {newProduct.sizes.filter(size => !size.isChildSize).map((size) => (
                        <button
                          key={size.id}
                          onClick={() => {
                            const updatedSizes = newProduct.sizes.map(s => 
                              s.id === size.id ? {...s, available: !s.available} : s
                            );
                            setNewProduct({...newProduct, sizes: updatedSizes});
                          }}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            size.available
                              ? 'bg-lilac text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2">Tallas para niños:</p>
                    <div className="flex flex-wrap gap-2">
                      {newProduct.sizes.filter(size => size.isChildSize).map((size) => (
                        <button
                          key={size.id}
                          onClick={() => {
                            const updatedSizes = newProduct.sizes.map(s => 
                              s.id === size.id ? {...s, available: !s.available} : s
                            );
                            setNewProduct({...newProduct, sizes: updatedSizes});
                          }}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            size.available
                              ? 'bg-lilac text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 border-t pt-4 mt-2">
                  <label className="text-sm font-medium">Colores Disponibles</label>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newProduct.colors.map((color) => (
                      <div key={color.id} className="flex items-center gap-2 bg-gray-100 p-1 pr-2 rounded">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="text-sm">{color.name}</span>
                        <button 
                          onClick={() => {
                            const newColors = newProduct.colors.filter(c => c.id !== color.id);
                            setNewProduct({...newProduct, colors: newColors});
                          }}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-2">
                    <Input
                      value={newProduct.newColorName}
                      onChange={(e) => {
                        // @ts-ignore
                        setNewProduct({...newProduct, newColorName: e.target.value});
                      }}
                      placeholder="Nombre del color"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color
