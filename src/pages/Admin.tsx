
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
  RefreshCcw
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
import { useProducts, Color } from '../contexts/ProductContext';
import { useToast } from '../hooks/use-toast';
import ImageUploader from '../components/ImageUploader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { setupDatabase } from '../lib/supabase';
import { logAdminActivity } from '../lib/admin-activity-logger';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { siteInfo, updateSiteInfo, uploadSiteImage, clearAllImages, isLoading: isSiteLoading } = useSiteInfo();
  const { products, updateProduct, addProduct, removeProduct, uploadProductImage, isLoading: isProductsLoading } = useProducts();
  const { toast } = useToast();
  
  // Site Info States
  const [newSlogan, setNewSlogan] = useState(siteInfo.slogan);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState(siteInfo.whatsappNumber);
  const [newInstagramLink, setNewInstagramLink] = useState(siteInfo.instagramLink || 'https://www.instagram.com/');
  const [newFacebookLink, setNewFacebookLink] = useState(siteInfo.facebookLink || 'https://www.facebook.com/');
  const [newCarouselImages, setNewCarouselImages] = useState<string[]>(siteInfo.carouselImages);
  
  // Estados para upload de imagem
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isUploadingCarousel, setIsUploadingCarousel] = useState(false);
  const [isClearingImages, setIsClearingImages] = useState(false);
  
  // Textos editables
  const [newMaterialsTitle, setNewMaterialsTitle] = useState(siteInfo.materialsTitle);
  const [newMaterialsDesc, setNewMaterialsDesc] = useState(siteInfo.materialsDescription);
  const [newDesignTitle, setNewDesignTitle] = useState(siteInfo.designTitle);
  const [newDesignDesc, setNewDesignDesc] = useState(siteInfo.designDescription);
  const [newServiceTitle, setNewServiceTitle] = useState(siteInfo.serviceTitle);
  const [newServiceDesc, setNewServiceDesc] = useState(siteInfo.serviceDescription);
  const [newFaqTitle, setNewFaqTitle] = useState(siteInfo.faqTitle);
  const [newUniqueStyleTitle, setNewUniqueStyleTitle] = useState(siteInfo.uniqueStyleTitle);
  
  // Product States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
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
    ]
  });
  
  // New color states
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');
  const [editingNewColorName, setEditingNewColorName] = useState('');
  const [editingNewColorHex, setEditingNewColorHex] = useState('#FFFFFF');

  React.useEffect(() => {
    // Redirect non-admin users
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
    
    // Intentar configurar la base de datos al cargar el componente
    setupDatabase().catch(error => {
      console.error("Error setting up database from AdminPage:", error);
    });
  }, [isAuthenticated, isAdmin, navigate]);

  React.useEffect(() => {
    // Atualizar estados cuando siteInfo mudar
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
        
        // Registra a atividade
        if (user && user.isAdmin) {
          await logAdminActivity({
            adminEmail: user.email,
            actionType: 'delete',
            entityType: 'carousel_images',
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
      // Asegurarse de que la base de datos esté configurada antes de subir
      await setupDatabase();
      
      const imageUrl = await uploadSiteImage(file);
      setNewCarouselImages(prev => [...prev, imageUrl]);
      
      // Registra a atividade
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
      setNewProduct(prev => ({ ...prev, imageUrl }));
      
      // Registra a atividade
      if (user && user.isAdmin) {
        await logAdminActivity({
          adminEmail: user.email,
          actionType: 'create',
          entityType: 'product',
          details: {
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            productTitle: newProduct.title
          }
        });
      }
      
      return imageUrl;
    } finally {
      setIsUploadingProduct(false);
    }
  };
  
  const handleUploadEditingProductImage = async (file: File) => {
    if (!editingProduct) return '';
    
    try {
      const imageUrl = await uploadProductImage(file);
      setEditingProduct(prev => ({ ...prev, imageUrl }));
      return imageUrl;
    } catch (error) {
      console.error("Error uploading product image:", error);
      throw error;
    }
  };

  const handleAddProductColor = () => {
    if (newColorName && newColorHex) {
      const colorId = newColorName.toLowerCase().replace(/\s+/g, '-');
      const newColors = [
        ...newProduct.colors,
        { id: colorId, name: newColorName, hex: newColorHex }
      ];
      setNewProduct({...newProduct, colors: newColors});
      setNewColorName('');
      setNewColorHex('#FFFFFF');
    }
  };

  const handleRemoveProductColor = (colorId: string) => {
    const newColors = newProduct.colors.filter(color => color.id !== colorId);
    setNewProduct({...newProduct, colors: newColors});
  };

  const handleAddEditingColor = () => {
    if (editingProduct && editingNewColorName && editingNewColorHex) {
      const colorId = editingNewColorName.toLowerCase().replace(/\s+/g, '-');
      const newColors = [
        ...editingProduct.colors,
        { id: colorId, name: editingNewColorName, hex: editingNewColorHex }
      ];
      setEditingProduct({...editingProduct, colors: newColors});
      setEditingNewColorName('');
      setEditingNewColorHex('#FFFFFF');
    }
  };

  const handleRemoveEditingColor = (colorId: string) => {
    if (editingProduct) {
      const newColors = editingProduct.colors.filter((color: Color) => color.id !== colorId);
      setEditingProduct({...editingProduct, colors: newColors});
    }
  };

  const handleAddProduct = () => {
    if (
      newProduct.title &&
      newProduct.description &&
      newProduct.price > 0 &&
      newProduct.imageUrl
    ) {
      const productToAdd = {
        ...newProduct,
        id: Date.now().toString(),
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        imageUrl: newProduct.imageUrl,
        stockQuantity: newProduct.stockQuantity,
        cardColor: newProduct.cardColor,
        sizes: newProduct.sizes,
        colors: newProduct.colors
      };
      
      addProduct(productToAdd);
      
      // Reset form
      setNewProduct({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
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
        ]
      });
      
      toast({
        title: "¡Producto agregado!",
        description: "El producto ha sido agregado exitosamente",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const startEditingProduct = (product: any) => {
    const hasKidsSizes = product.sizes.some((size: any) => 
      size.id === 'kids-s' || size.id === 'kids-m' || size.id === 'kids-l' || size.isChildSize
    );
    
    if (!hasKidsSizes) {
      const updatedSizes = [
        ...product.sizes,
        { id: 'kids-s', name: 'Niños S', available: false, isChildSize: true },
        { id: 'kids-m', name: 'Niños M', available: false, isChildSize: true },
        { id: 'kids-l', name: 'Niños L', available: false, isChildSize: true }
      ];
      setEditingProduct({...product, sizes: updatedSizes});
    } else {
      setEditingProduct({...product});
    }
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
  };

  const saveEditedProduct = () => {
    if (editingProduct) {
      const productToUpdate = {
        ...editingProduct,
        title: editingProduct.title,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl,
        stockQuantity: editingProduct.stockQuantity,
        cardColor: editingProduct.cardColor,
        sizes: editingProduct.sizes,
        colors: editingProduct.colors
      };
      
      updateProduct(editingProduct.id, productToUpdate);
      setEditingProduct(null);
      toast({
        title: "¡Actualizado!",
        description: "Producto actualizado con éxito",
        duration: 3000,
      });
    }
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

  const toggleSizeAvailability = (product: any, sizeId: string) => {
    const updatedSizes = product.sizes.map((size: any) => 
      size.id === sizeId ? { ...size, available: !size.available } : size
    );
    
    if (editingProduct) {
      setEditingProduct({...editingProduct, sizes: updatedSizes});
    } else {
      const productToUpdate = {
        ...product,
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        cardColor: product.cardColor,
        sizes: updatedSizes,
        colors: product.colors
      };
      
      updateProduct(product.id, productToUpdate);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
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
                  <label className="text-sm font-medium">Imagen del Producto</label>
                  <div className="mt-2">
                    <ImageUploader 
                      onImageUpload={handleUploadProductImage} 
                      label="Subir imagen del producto"
                      maxSize={10}
                      bucketType="product_images"
                    />
                  </div>
                  
                  {newProduct.imageUrl && (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <img
                        src={newProduct.imageUrl}
                        alt="Vista previa del producto"
                        className="w-full h-40 object-contain bg-gray-100"
                      />
                    </div>
                  )}
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
                          onClick={() => handleRemoveProductColor(color.id)}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-2">
                    <Input
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Nombre del color"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-10 h-10 rounded border p-1"
                      />
                      <Input
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="#FFFFFF"
                        className="border-lilac/30 focus:border-lilac focus:ring-lilac w-24"
                      />
                    </div>
                    <Button 
                      onClick={handleAddProductColor}
                      className="bg-lilac hover:bg-lilac-dark flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Color
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAddProduct} 
                  className="w-full bg-lilac hover:bg-lilac-dark"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4 font-serif">Productos Existentes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden border-lilac/20 shadow-md">
                    {editingProduct && editingProduct.id === product.id ? (
                      <>
                        <div className="relative h-48">
                          {editingProduct.imageUrl ? (
                            <img 
                              src={editingProduct.imageUrl} 
                              alt={editingProduct.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              <Package className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="absolute bottom-2 right-2">
                            <ImageUploader
                              onImageUpload={handleUploadEditingProductImage}
                              label="Cambiar imagen"
                              maxSize={4}
                            />
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="text-sm font-medium">Título</label>
                            <Input
                              value={editingProduct.title}
                              onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                              className="border-lilac/30 mt-1"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Precio ($)</label>
                              <Input
                                type="number"
                                value={editingProduct.price || ''}
                                onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                                min="0"
                                step="0.01"
                                className="border-lilac/30 mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Stock</label>
                              <Input
                                type="number"
                                value={editingProduct.stockQuantity || ''}
                                onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value) || 0})}
                                min="0"
                                className="border-lilac/30 mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Descripción</label>
                            <Input
                              value={editingProduct.description}
                              onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                              className="border-lilac/30 mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium flex items-center">
                              <Palette className="w-4 h-4 mr-2" />
                              Color de la tarjeta
                            </label>
                            <div className="flex items-center mt-1 space-x-2">
                              <input
                                type="color"
                                value={editingProduct.cardColor}
                                onChange={(e) => setEditingProduct({...editingProduct, cardColor: e.target.value})}
                                className="w-8 h-8 rounded border"
                              />
                              <Input
                                value={editingProduct.cardColor}
                                onChange={(e) => setEditingProduct({...editingProduct, cardColor: e.target.value})}
                                className="border-lilac/30 w-28"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Tallas disponibles</label>
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">Adultos:</p>
                              <div className="flex flex-wrap gap-1">
                                {editingProduct.sizes.filter((size: any) => !size.isChildSize).map((size: any) => (
                                  <button
                                    key={size.id}
                                    onClick={() => toggleSizeAvailability(editingProduct, size.id)}
                                    className={`px-2 py-1 text-xs rounded ${
                                      size.available
                                        ? 'bg-lilac text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                                  >
                                    {size.name}
                                  </button>
                                ))}
                              </div>
                              
                              <p className="text-xs text-gray-500">Niños:</p>
                              <div className="flex flex-wrap gap-1">
                                {editingProduct.sizes.filter((size: any) => size.isChildSize).map((size: any) => (
                                  <button
                                    key={size.id}
                                    onClick={() => toggleSizeAvailability(editingProduct, size.id)}
                                    className={`px-2 py-1 text-xs rounded ${
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
                          
                          <div>
                            <label className="text-sm font-medium">Colores disponibles</label>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {editingProduct.colors.map((color: Color) => (
                                <div key={color.id} className="flex items-center text-xs bg-gray-100 p-1 rounded">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-1" 
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <span>{color.name}</span>
                                  <button 
                                    onClick={() => handleRemoveEditingColor(color.id)}
                                    className="ml-1 text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-2 flex items-center gap-2">
                              <Input
                                value={editingNewColorName}
                                onChange={(e) => setEditingNewColorName(e.target.value)}
                                placeholder="Nombre"
                                className="border-lilac/30 w-full text-sm"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={editingNewColorHex}
                                  onChange={(e) => setEditingNewColorHex(e.target.value)}
                                  className="w-8 h-8 rounded border"
                                />
                                <Button 
                                  size="sm"
                                  onClick={handleAddEditingColor}
                                  className="bg-lilac hover:bg-lilac-dark"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-4 pb-4 pt-2 flex gap-2">
                          <Button 
                            onClick={saveEditedProduct}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button 
                            onClick={cancelEditingProduct}
                            variant="outline"
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div 
                          className="h-48 relative" 
                          style={{ backgroundColor: product.cardColor + '33' }}
                        >
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h4 className="text-lg font-medium mb-1">{product.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <p className="font-medium text-lg text-lilac-dark">${product.price.toFixed(2)}</p>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {product.sizes
                              .filter((size: any) => size.available)
                              .map((size: any) => (
                                <span 
                                  key={size.id} 
                                  className="inline-block bg-gray-100 rounded px-2 py-1 text-xs font-medium"
                                >
                                  {size.name}
                                </span>
                              ))}
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {product.colors.map((color: Color) => (
                              <div 
                                key={color.id} 
                                className="w-5 h-5 rounded-full border border-gray-300" 
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          
                          <div className="flex justify-between mt-4">
                            <Button 
                              onClick={() => startEditingProduct(product)}
                              className="bg-lilac hover:bg-lilac-dark"
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            
                            <Button 
                              onClick={() => handleDeleteProduct(product.id)}
                              variant="outline"
                              className="text-red-500 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
