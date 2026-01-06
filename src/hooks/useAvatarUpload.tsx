import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useAvatarUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('Devi essere autenticato');
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Il file deve essere un\'immagine');
      return null;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'immagine deve essere inferiore a 2MB');
      return null;
    }

    setUploading(true);

    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache-busting parameter
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Avatar aggiornato!');
      return avatarUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Errore nel caricamento dell\'avatar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // List files in user folder
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (files && files.length > 0) {
        const filesToRemove = files.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToRemove);
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      toast.success('Avatar rimosso');
      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error('Errore nella rimozione dell\'avatar');
      return false;
    }
  };

  return { uploadAvatar, deleteAvatar, uploading };
};
