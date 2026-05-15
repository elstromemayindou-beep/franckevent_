import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Image as ImageIcon, User, Type, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const blogPostSchema = z.object({
  title: z.string().min(5, 'Le titre doit faire au moins 5 caractères'),
  content: z.string().min(20, 'Le contenu est trop court'),
  author: z.string().min(2, 'Le nom de l\'auteur est requis'),
  imageUrl: z.string().url('URL d\'image invalide'),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface CreateBlogPostProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBlogPost({ isOpen, onClose, onSuccess }: CreateBlogPostProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema)
  });

  const onSubmit = async (data: BlogPostFormData) => {
    setIsSubmitting(true);
    const path = 'blog_posts';
    try {
      await addDoc(collection(db, path), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        reset();
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[50px] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-10 md:p-14">
              {success ? (
                <div className="py-20 text-center space-y-6">
                  <CheckCircle className="mx-auto text-green-500" size={80} strokeWidth={1} />
                  <h3 className="text-3xl font-serif font-bold italic">Article Publié !</h3>
                  <p className="text-[#666] font-light">Votre article a été ajouté avec succès au blog.</p>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-2">
                    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Nouveau Post</span>
                    <h2 className="text-4xl font-serif font-bold">Créer un Article</h2>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Titre</label>
                        <div className="relative">
                          <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                          <input 
                            {...register('title')}
                            className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all text-sm"
                            placeholder="Titre de l'article"
                          />
                        </div>
                        {errors.title && <p className="text-red-500 text-[10px] ml-1">{errors.title.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Auteur</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                          <input 
                            {...register('author')}
                            className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all text-sm"
                            placeholder="Votre nom"
                          />
                        </div>
                        {errors.author && <p className="text-red-500 text-[10px] ml-1">{errors.author.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Image URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                        <input 
                          {...register('imageUrl')}
                          className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all text-sm"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      {errors.imageUrl && <p className="text-red-500 text-[10px] ml-1">{errors.imageUrl.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#999] ml-1">Contenu</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 text-[#999]" size={16} />
                        <textarea 
                          {...register('content')}
                          rows={6}
                          className="w-full bg-gray-50 border border-[#EEE] py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all text-sm"
                          placeholder="Écrivez votre article ici..."
                        />
                      </div>
                      {errors.content && <p className="text-red-500 text-[10px] ml-1">{errors.content.message}</p>}
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-[#1A1A1A] text-white rounded-full font-bold tracking-widest uppercase hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-3 shadow-xl disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Send size={18} />
                          <span>Publier l'Article</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
