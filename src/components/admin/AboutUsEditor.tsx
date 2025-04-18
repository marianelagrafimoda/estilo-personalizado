
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import { logAdminActivity } from '../../lib/admin-activity-logger';
import { supabase } from '../../integrations/supabase/client';

const AboutUsEditor = () => {
  const [title, setTitle] = useState('¿Quiénes Somos?');
  const [description, setDescription] = useState(
    'Somos una empresa dedicada a la creación de prendas personalizadas, comprometidos con la calidad y la satisfacción de nuestros clientes.'
  );
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('site_info')
        .update({
          about_us_title: title,
          about_us_description: description
        })
        .eq('id', (await supabase.from('site_info').select('id').limit(1).single()).data?.id);

      if (error) throw error;

      await logAdminActivity({
        adminEmail: (await supabase.auth.getUser()).data.user?.email || '',
        actionType: 'update',
        entityType: 'site_info',
        details: {
          section: 'about_us',
          fields_updated: ['title', 'description']
        }
      });

      toast({
        title: "¡Actualizado!",
        description: "La sección 'Quiénes Somos' ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Quiénes Somos</CardTitle>
        <CardDescription>
          Actualice el contenido de la sección "Quiénes Somos"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-lilac/30 mt-1"
            placeholder="Título de la sección"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 p-2 border border-lilac/30 rounded-md min-h-[150px]"
            placeholder="Descripción de la sección"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave}
          className="w-full bg-lilac hover:bg-lilac-dark"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AboutUsEditor;
