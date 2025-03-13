
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useSiteInfo } from '../contexts/SiteContext';

interface WhatsAppButtonProps {
  className?: string;
  mode?: 'default' | 'cart';
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  className = "bg-lilac hover:bg-lilac-dark text-black font-medium",
  mode = 'default'
}) => {
  const { siteInfo, isLoading } = useSiteInfo();
  const { items, totalPrice } = useCart();
  
  // Helper function to get color name
  const getColorName = (item: any) => {
    const color = item.product.colors.find((c: any) => c.id === item.selectedColor);
    return color ? color.name : item.selectedColor;
  };
  
  const generateWhatsAppMessage = () => {
    if (mode === 'cart' && items.length > 0) {
      // Mensaje para pedido desde carrito
      let message = "¡Hola! Me gustaría hacer el siguiente pedido:\n\n";
      
      items.forEach((item) => {
        message += `- ${item.quantity}x ${item.product.title} (Talla: ${item.selectedSize}, Color: ${getColorName(item)}) - $${(item.product.price * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\nTotal: $${totalPrice.toFixed(2)}`;
      message += "\n\nPor favor, ¿me podrías ayudar a completar mi compra?";
      
      return encodeURIComponent(message);
    } else {
      // Mensaje para personalización
      return encodeURIComponent("¡Hola! Me gustaría información sobre cómo personalizar mi prenda.");
    }
  };
  
  const handleClick = () => {
    const message = generateWhatsAppMessage();
    // Se o whatsapp_number não estiver carregado, use o valor padrão
    const whatsappNumber = isLoading || !siteInfo?.whatsapp_number
      ? '+593990893095'
      : siteInfo.whatsapp_number;
      
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <Button 
      onClick={handleClick}
      className={className}
    >
      <MessageSquare className="mr-2 h-5 w-5" />
      {mode === 'cart' ? 'Finalizar Compra por WhatsApp' : 'Quiero personalizar mi estilo'}
    </Button>
  );
};

export default WhatsAppButton;
