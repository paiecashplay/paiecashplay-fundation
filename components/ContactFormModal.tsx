'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { sendContactForm } from '@/lib/emailjs';

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide'),
  company: z.string().optional(),
  source: z.string().min(1, 'Veuillez sélectionner une option'),
  solutions: z.object({
    paiecashcard: z.boolean(),
    paiecashstream: z.boolean(),
    paiecashbot: z.boolean(),
    paiecashstore: z.boolean(),
  }),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactFormModal({ open, onOpenChange }: ContactFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      source: '',
      solutions: {
        paiecashcard: false,
        paiecashstream: false,
        paiecashbot: false,
        paiecashstore: false,
      },
      message: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Tentative d'envoi via EmailJS
      try {
        await sendContactForm(data);
        toast.success('Message envoyé avec succès !');
        form.reset();
        onOpenChange(false);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du formulaire:', error);
        
        // Si EmailJS échoue mais que le système de sauvegarde locale a fonctionné
        if (error instanceof Error && error.message.includes('EmailJS')) {
          toast.success('Votre message a été enregistré et sera traité dès que possible.');
          form.reset();
          onOpenChange(false);
        } else {
          // Tentative de sauvegarde directe via l'API
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            toast.success('Votre message a été enregistré et sera traité dès que possible.');
            form.reset();
            onOpenChange(false);
          } else {
            throw new Error('Échec de l\'envoi et de la sauvegarde');
          }
        }
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Contactez-nous</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Nous vous répondrons dans les plus brefs délais
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-container">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Nom et Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Entreprise</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de votre entreprise" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Comment nous avez-vous connu ? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Sélectionnez une option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="search">Moteur de recherche</SelectItem>
                        <SelectItem value="social">Réseaux sociaux</SelectItem>
                        <SelectItem value="recommendation">Recommandation</SelectItem>
                        <SelectItem value="event">Événement</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel className="text-gray-700">Solutions souhaitées</FormLabel>
                {[
                  { id: 'paiecashcard', label: 'PAIECASHCARD' },
                  { id: 'paiecashstream', label: 'PAIECASHSTREAM' },
                  { id: 'paiecashbot', label: 'PAIECASHBOT' },
                  { id: 'paiecashstore', label: 'PAIECASHSTORE' },
                ].map(({ id, label }) => (
                  <FormField
                    key={id}
                    control={form.control}
                    name={`solutions.${id}` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">{label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Votre message..."
                        className="min-h-[100px] bg-white border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-[#4FBA73] hover:bg-[#3da562]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}