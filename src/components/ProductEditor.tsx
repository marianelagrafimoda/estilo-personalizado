
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Color, Product, Size } from '../contexts/ProductContext';
import ProductImagesUploader from './ProductImagesUploader';

interface ProductEditorProps {
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  onUploadImage: (file: File) => Promise<string>;
}

const ProductEditor: React.FC<ProductEditorProps> = ({
  product,
  onSave,
  onCancel,
  onUploadImage
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [cardColor, setCardColor] = useState('#C8B6E2');
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [images, setImages] = useState<string[]>([]);
  
  // Inicializar formulário com os dados do produto
  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setDescription(product.description || '');
      setPrice(product.price?.toString() || '');
      setStockQuantity(product.stockQuantity?.toString() || '');
      setCardColor(product.cardColor || '#C8B6E2');
      setSizes(product.sizes || []);
      setColors(product.colors || []);
      
      // Inicializar as imagens usando a propriedade images ou criando um array com imageUrl
      if (product.images && product.images.length > 0) {
        setImages(product.images);
      } else if (product.imageUrl) {
        setImages([product.imageUrl]);
      } else {
        setImages(['/placeholder.svg']);
      }
    } else {
      // Reset form for new product
      setTitle('');
      setDescription('');
      setPrice('');
      setStockQuantity('0');
      setCardColor('#C8B6E2');
      setSizes([]);
      setColors([]);
      setImages(['/placeholder.svg']);
    }
  }, [product]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!title.trim() || !price.trim()) {
      alert('Por favor, preencha os campos obrigatórios: título e preço');
      return;
    }
    
    const updatedProduct: Partial<Product> = {
      title,
      description,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity || '0'),
      cardColor,
      sizes,
      colors,
      images,
      // Manter a primeira imagem como imageUrl para compatibilidade
      imageUrl: images.length > 0 ? images[0] : '/placeholder.svg'
    };
    
    onSave(updatedProduct);
  };
  
  // Manipuladores para tamanhos e cores são omitidos por brevidade
  // Na implementação real, você precisaria adicionar lógica para gerenciar arrays de tamanhos e cores
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome do produto"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descrição
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do produto"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Preço <span className="text-red-500">*</span>
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-1">
              Estoque
            </label>
            <Input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="0"
            />
          </div>
          
          <div>
            <label htmlFor="cardColor" className="block text-sm font-medium mb-1">
              Cor do cartão
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="cardColor"
                type="color"
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                placeholder="#C8B6E2"
                className="flex-grow"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Imagens do produto (máximo 6)
          </label>
          <ProductImagesUploader
            images={images}
            onImagesChange={setImages}
            onUploadImage={onUploadImage}
            maxImages={6}
          />
        </div>
        
        {/* Aqui você adicionaria os componentes para gerenciar tamanhos e cores */}
        
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {product ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductEditor;
