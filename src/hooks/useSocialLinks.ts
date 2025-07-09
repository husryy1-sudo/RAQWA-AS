import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SocialLink } from '../types';

export const useSocialLinks = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('"order"', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        icon: item.icon,
        isVisible: item.is_visible,
        order: item.order,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      setLinks(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addLink = async (link: Omit<SocialLink, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .insert([{
          name: link.name,
          url: link.url,
          icon: link.icon,
          is_visible: link.isVisible,
          order: link.order
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Transform the response to match our interface
      const transformedData = {
        ...data,
        isVisible: data.is_visible,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setLinks(prev => [...prev, transformedData]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  const updateLink = async (id: string, updates: Partial<SocialLink>) => {
    try {
      // Transform the updates to match database column names
      const dbUpdates: any = { ...updates };
      if ('isVisible' in updates) {
        dbUpdates.is_visible = updates.isVisible;
        delete dbUpdates.isVisible;
      }
      
      const { data, error } = await supabase
        .from('social_links')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform the response to match our interface
      const transformedData = {
        ...data,
        isVisible: data.is_visible,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setLinks(prev => prev.map(link => link.id === id ? transformedData : link));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLinks(prev => prev.filter(link => link.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return {
    links,
    loading,
    error,
    addLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks
  };
};