
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
  Palette
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
import { useProducts } from '../contexts/ProductContext';
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
  
  // Product States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    cardColor: '#C8B6E2', // Color lila por defecto
    sizes: [
      { id: 's', name: 'S', available: true },
      { id: 'm', name: 'M', available: true },
      { id: 'l', name: 'L', available: true },
      { id: 'xl', name: 'XL', available: true }
    ]
  });

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
      faqTitle: newFaqTitle
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

  const handleAddProduct = () => {
    if (
      newProduct.title &&
      newProduct.description &&
      newProduct.price > 0 &&
      newProduct.imageUrl
    ) {
      addProduct({
        ...newProduct,
        id: Date.now().toString(),
      });
      
      // Reset form
      setNewProduct({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        cardColor: '#C8B6E2',
        sizes: [
          { id: 's', name: 'S', available: true },
          { id: 'm', name: 'M', available: true },
          { id: 'l', name: 'L', available: true },
          { id: 'xl', name: 'XL', available: true }
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
    setEditingProduct({...product});
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
  };

  const saveEditedProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct);
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
      updateProduct(product.id, {...product, sizes: updatedSizes});
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
                  <h3 className="text-lg font-medium mb-3">Sección "Por qué elegirnos"</h3>
                  
                  <div className="space-y-4">
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
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="border-red-300 text-red-500 hover:bg-red-50"
                          >
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
