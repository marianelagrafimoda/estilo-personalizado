import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  ImageIcon, 
  PanelLeft, 
  Tag, 
  ShoppingBag, 
  Edit3, 
  Save, 
  X, 
  Palette,
  Package,
  Plus,
  Trash2,
  CircleDashed
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useSiteInfo } from '../contexts/SiteContext';
import { useProducts, Color } from '../contexts/ProductContext';
import { useToast } from '../hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { siteInfo, updateSiteInfo, isLoading: siteLoading } = useSiteInfo();
  const { products, updateProduct, addProduct, removeProduct, isLoading: productsLoading } = useProducts();
  const { toast } = useToast();
  
  // Site Info States
  const [newSlogan, setNewSlogan] = useState(siteInfo.slogan);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState(siteInfo.whatsapp_number);
  const [newCarouselImages, setNewCarouselImages] = useState<string[]>(siteInfo.carousel_images);
  const [newCarouselImage, setNewCarouselImage] = useState('');
  
  // Textos editables
  const [newMaterialsTitle, setNewMaterialsTitle] = useState(siteInfo.materials_title);
  const [newMaterialsDesc, setNewMaterialsDesc] = useState(siteInfo.materials_description);
  const [newDesignTitle, setNewDesignTitle] = useState(siteInfo.design_title);
  const [newDesignDesc, setNewDesignDesc] = useState(siteInfo.design_description);
  const [newServiceTitle, setNewServiceTitle] = useState(siteInfo.service_title);
  const [newServiceDesc, setNewServiceDesc] = useState(siteInfo.service_description);
  const [newFaqTitle, setNewFaqTitle] = useState(siteInfo.faq_title);
  const [newUniqueStyleTitle, setNewUniqueStyleTitle] = useState(siteInfo.unique_style_title);
  
  // Product States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    cardColor: '#C8B6E2', // Color lila por defecto
    stockQuantity: 0,
    sizes: [
      { id: 's', name: 'S', available: true },
      { id: 'm', name: 'M', available: true },
      { id: 'l', name: 'L', available: true },
      { id: 'xl', name: 'XL', available: true }
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

  // Atualizar os estados quando os dados do site forem carregados
  useEffect(() => {
    if (!siteLoading) {
      setNewSlogan(siteInfo.slogan);
      setNewWhatsappNumber(siteInfo.whatsapp_number);
      setNewCarouselImages(siteInfo.carousel_images);
      setNewMaterialsTitle(siteInfo.materials_title);
      setNewMaterialsDesc(siteInfo.materials_description);
      setNewDesignTitle(siteInfo.design_title);
      setNewDesignDesc(siteInfo.design_description);
      setNewServiceTitle(siteInfo.service_title);
      setNewServiceDesc(siteInfo.service_description);
      setNewFaqTitle(siteInfo.faq_title);
      setNewUniqueStyleTitle(siteInfo.unique_style_title);
    }
  }, [siteInfo, siteLoading]);

  React.useEffect(() => {
    // Redirect non-admin users
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSiteInfoUpdate = async () => {
    await updateSiteInfo({
      slogan: newSlogan,
      whatsapp_number: newWhatsappNumber,
      carousel_images: newCarouselImages,
      materials_title: newMaterialsTitle,
      materials_description: newMaterialsDesc,
      design_title: newDesignTitle,
      design_description: newDesignDesc,
      service_title: newServiceTitle,
      service_description: newServiceDesc,
      faq_title: newFaqTitle,
      unique_style_title: newUniqueStyleTitle
    });
  };

  const addCarouselImage = () => {
    if (newCarouselImage && !newCarouselImages.includes(newCarouselImage)) {
      setNewCarouselImages([...newCarouselImages, newCarouselImage]);
      setNewCarouselImage('');
    }
  };

  const removeCarouselImage = (image: string) => {
    setNewCarouselImages(newCarouselImages.filter(img => img !== image));
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

  const handleAddProduct = async () => {
    if (
      newProduct.title &&
      newProduct.description &&
      newProduct.price > 0 &&
      newProduct.imageUrl
    ) {
      await addProduct({
        ...newProduct,
      });
      
      // Reset form
      setNewProduct({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        cardColor: '#C8B6E2',
        stockQuantity: 0,
        sizes: [
          { id: 's', name: 'S', available: true },
          { id: 'm', name: 'M', available: true },
          { id: 'l', name: 'L', available: true },
          { id: 'xl', name: 'XL', available: true }
        ],
        colors: [
          { id: 'white', name: 'Blanco', hex: '#FFFFFF' }
        ]
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
    setEditingProduct({...product});
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
  };

  const saveEditedProduct = async () => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      await removeProduct(productId);
    }
  };

  const toggleSizeAvailability = (product: any, sizeId: string) => {
    const updatedSizes = product.sizes.map((size: any) => 
      size.id === sizeId ? { ...size, available: !size.available } : size
    );
    
    if (editingProduct) {
      setEditingProduct({...editingProduct, sizes: updatedSizes});
    } else {
      updateProduct(product.id, {...product, sizes: updatedSizes});
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  // Exibir indicador de carregamento se estiver carregando dados
  if (siteLoading || productsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <CircleDashed className="h-10 w-10 animate-spin mx-auto text-lilac" />
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
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
                <div className="flex items-center space-x-2">
                  <Input
                    value={newCarouselImage}
                    onChange={(e) => setNewCarouselImage(e.target.value)}
                    placeholder="URL de la imagen (ej: /carousel4.jpg)"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                  <Button 
                    onClick={addCarouselImage}
                    className="whitespace-nowrap bg-lilac hover:bg-lilac-dark"
                  >
                    Agregar Imagen
                  </Button>
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
                  <label className="text-sm font-medium">URL de la Imagen</label>
                  <Input
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    placeholder="URL de la imagen (ej: /product1.jpg)"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
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
                  <div className="flex flex-wrap gap-2">
                    {newProduct.sizes.map((size) => (
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
                          <Input
                            value={editingProduct.imageUrl}
                            onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                            placeholder="URL de la imagen"
                            className="absolute inset-0 h-full rounded-none border-0"
                          />
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <Input
                            value={editingProduct.title}
                            onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                            placeholder="Título"
                            className="font-medium text-lg border-lilac/30"
                          />
                          <Input
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                            placeholder="Descripción"
                            className="text-sm text-gray-600 border-lilac/30"
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">$</span>
                            <Input
                              type="number"
                              value={editingProduct.price || ''}
                              onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="border-lilac/30"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">Stock:</span>
                            <Input
                              type="number"
                              value={editingProduct.stockQuantity || ''}
                              onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value) || 0})}
                              placeholder="0"
                              min="0"
                              className="border-lilac/30"
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
                                value={editingProduct.cardColor || '#C8B6E2'}
                                onChange={(e) => setEditingProduct({...editingProduct, cardColor: e.target.value})}
                                className="w-10 h-10 rounded border p-1"
                              />
                              <Input
                                value={editingProduct.cardColor || '#C8B6E2'}
                                onChange={(e) => setEditingProduct({...editingProduct, cardColor: e.target.value})}
                                placeholder="#C8B6E2"
                                className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Tallas:</p>
                            <div className="flex flex-wrap gap-2">
                              {editingProduct.sizes.map((size: any) => (
                                <button
                                  key={size.id}
                                  onClick={() => toggleSizeAvailability(editingProduct, size.id)}
                                  className={`px-2 py-1 rounded text-xs font-medium ${
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
                          
                          <div className="space-y-3">
                            <p className="text-sm font-medium mb-1">Colores:</p>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              {editingProduct.colors.map((color: Color) => (
                                <div key={color.id} className="flex items-center gap-2 bg-gray-100 p-1 pr-2 rounded">
                                  <div 
                                    className="w-6 h-6 rounded-full" 
                                    style={{ backgroundColor: color.hex }}
                                  ></div>
                                  <span className="text-xs">{color.name}</span>
                                  <button 
                                    onClick={() => handleRemoveEditingColor(color.id)}
                                    className="text-red-500 hover:text-red-700 ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Input
                                value={editingNewColorName}
                                onChange={(e) => setEditingNewColorName(e.target.value)}
                                placeholder="Nombre"
                                className="border-lilac/30 flex-1 text-sm"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={editingNewColorHex}
                                  onChange={(e) => setEditingNewColorHex(e.target.value)}
                                  className="w-8 h-8 rounded border p-1"
                                />
                                <Input
                                  value={editingNewColorHex}
                                  onChange={(e) => setEditingNewColorHex(e.target.value)}
                                  placeholder="#FFFFFF"
                                  className="border-lilac/30 w-20 text-sm"
                                />
                              </div>
                              <Button 
                                size="sm"
                                onClick={handleAddEditingColor}
                                className="bg-lilac hover:bg-lilac-dark"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={cancelEditingProduct}
                            className="border-red-300 text-red-500
