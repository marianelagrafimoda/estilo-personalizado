import React, { useState } from 'react';
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
  CardFooter, 
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
  const { siteInfo, updateSiteInfo } = useSiteInfo();
  const { products, updateProduct, addProduct, removeProduct } = useProducts();
  const { toast } = useToast();
  
  // Site Info States
  const [newSlogan, setNewSlogan] = useState(siteInfo.slogan);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState(siteInfo.whatsappNumber);
  const [newCarouselImages, setNewCarouselImages] = useState<string[]>(siteInfo.carouselImages);
  const [newCarouselImage, setNewCarouselImage] = useState('');
  
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
    cardColor: '#C8B6E2', // Color lila por defecto
    stockQuantity: 0,
    sizes: [
      { id: 's', name: 'S', available: true },
      { id: 'm', name: 'M', available: true },
      { id: 'l', name: 'L', available: true },
      { id: 'xl', name: 'XL', available: true },
      { id: 'kids-s', name: 'Niños S', available: true },
      { id: 'kids-m', name: 'Niños M', available: true },
      { id: 'kids-l', name: 'Niños L', available: true }
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
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSiteInfoUpdate = () => {
    updateSiteInfo({
      slogan: newSlogan,
      whatsappNumber: newWhatsappNumber,
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
          { id: 's', name: 'S', available: true },
          { id: 'm', name: 'M', available: true },
          { id: 'l', name: 'L', available: true },
          { id: 'xl', name: 'XL', available: true },
          { id: 'kids-s', name: 'Niños S', available: true },
          { id: 'kids-m', name: 'Niños M', available: true },
          { id: 'kids-l', name: 'Niños L', available: true }
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
      size.id === 'kids-s' || size.id === 'kids-m' || size.id === 'kids-l'
    );
    
    if (!hasKidsSizes) {
      const updatedSizes = [
        ...product.sizes,
        { id: 'kids-s', name: 'Niños S', available: false },
        { id: 'kids-m', name: 'Niños M', available: false },
        { id: 'kids-l', name: 'Niños L', available: false }
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
                            className="border-red-300 text-red-500 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={saveEditedProduct}
                            className="bg-lilac hover:bg-lilac-dark"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                        </CardFooter>
                      </>
                    ) : (
                      <>
                        <div className="relative h-48">
                          <img 
                            src={product.imageUrl} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                          />
                          <div 
                            className="absolute bottom-0 left-0 px-2 py-1 flex items-center bg-white/80 rounded-tr-md"
                          >
                            <div 
                              className="w-4 h-4 rounded-full mr-1" 
                              style={{ backgroundColor: product.cardColor || '#C8B6E2' }}
                            ></div>
                            <span className="text-xs">{product.cardColor || '#C8B6E2'}</span>
                          </div>
                          
                          {/* Stock indicator */}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 rounded-md flex items-center">
                            <Package className="w-4 h-4 mr-1 text-gray-600" />
                            <span className="text-xs font-medium">{product.stockQuantity || 0}</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg">{product.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="font-bold">${product.price.toFixed(2)}</span>
                            <div className="flex gap-1">
                              {product.sizes
                                .filter(size => size.available)
                                .map(size => (
                                  <span key={size.id} className="px-2 py-0.5 bg-lilac/10 text-lilac-dark text-xs rounded">
                                    {size.name}
                                  </span>
                                ))}
                            </div>
                          </div>
                          
                          {/* Display available colors */}
                          {product.colors && product.colors.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {product.colors.map(color => (
                                <div 
                                  key={color.id}
                                  className="w-5 h-5 rounded-full border border-gray-200" 
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                ></div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="border-red-300 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEditingProduct(product)}
                            className="border-lilac/30 text-lilac-dark hover:bg-lilac/10"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </CardFooter>
                      </>
                    )}
                  </Card>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-10 bg-muted/20 rounded-lg">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted" />
                  <h3 className="mt-4 text-lg font-medium">No hay productos</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Agregue un producto usando el formulario de arriba
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="footer-dark">
        <Footer />
      </div>
    </div>
  );
};

export default AdminPage;
