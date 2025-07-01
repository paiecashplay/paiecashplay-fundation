'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { Loader2, Mail, Eye, ArrowLeft, RefreshCw, AlertTriangle, Download, Trash2 } from 'lucide-react';

interface Email {
  id: string;
  filename: string;
  path: string;
  createdAt: string;
  size?: number;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<'checking' | 'active' | 'inactive' | 'error'>('checking');
  const [smtpDetails, setSmtpDetails] = useState<any>(null);
  const [testingSmtp, setTestingSmtp] = useState(false);

  const checkSmtpStatus = async () => {
    setTestingSmtp(true);
    setSmtpStatus('checking');
    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      
      setSmtpDetails(data.smtpConfig || null);
      
      if (response.ok && data.success && !data.result.filePath) {
        setSmtpStatus('active');
      } else {
        setSmtpStatus('inactive');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut SMTP:', err);
      setSmtpStatus('error');
    } finally {
      setTestingSmtp(false);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/emails');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des emails');
      }
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (err) {
      setError('Impossible de charger les emails');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewEmail = async (filename: string) => {
    setLoadingEmail(true);
    setEmailContent(null);
    setSelectedEmail(filename);
    try {
      const response = await fetch(`/api/emails?filename=${encodeURIComponent(filename)}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du contenu de l\'email');
      }
      const content = await response.text();
      setEmailContent(content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmail(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extractRecipient = (filename: string) => {
    const recipientMatch = filename.match(/-([^-]+)-at-([^-]+)\.html$/);
    return recipientMatch 
      ? `${recipientMatch[1]}@${recipientMatch[2]}`
      : 'Inconnu';
  };

  const extractSubject = (content: string) => {
    const subjectMatch = content.match(/<p><strong>Sujet:<\/strong> (.*?)<\/p>/);
    return subjectMatch ? subjectMatch[1] : 'Sans sujet';
  };

  useEffect(() => {
    fetchEmails();
    checkSmtpStatus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Emails sauvegardés localement</h1>
            <p className="mt-2 text-gray-600">
              Ces emails ont été sauvegardés localement car l'envoi SMTP a échoué.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className={`flex items-center gap-2 rounded-md px-3 py-1 text-sm ${
              smtpStatus === 'active' ? 'bg-green-100 text-green-800' :
              smtpStatus === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
              smtpStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {smtpStatus === 'checking' && <Loader2 size={14} className="animate-spin" />}
              {smtpStatus === 'active' && <span className="h-2 w-2 rounded-full bg-green-500"></span>}
              {smtpStatus === 'inactive' && <AlertTriangle size={14} />}
              {smtpStatus === 'error' && <AlertTriangle size={14} />}
              <span>
                {smtpStatus === 'checking' ? 'Vérification SMTP...' :
                 smtpStatus === 'active' ? 'SMTP actif' :
                 smtpStatus === 'inactive' ? 'SMTP inactif' :
                 'Erreur SMTP'}
              </span>
            </div>
            <button 
              onClick={checkSmtpStatus}
              disabled={testingSmtp}
              className="flex items-center gap-2 rounded-md bg-[#BC7AF9] px-4 py-2 text-white hover:bg-[#a65df8] disabled:opacity-50"
            >
              {testingSmtp ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Tester SMTP
            </button>
            <button 
              onClick={fetchEmails}
              className="flex items-center gap-2 rounded-md bg-[#4FBA73] px-4 py-2 text-white hover:bg-[#3da562]"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
          </div>
        </div>

        {smtpDetails && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Configuration SMTP</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Hôte</p>
                <p className="font-medium">{smtpDetails.host}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Port</p>
                <p className="font-medium">{smtpDetails.port}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sécurisé</p>
                <p className="font-medium">{smtpDetails.secure ? 'Oui' : 'Non'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilisateur</p>
                <p className="font-medium">{smtpDetails.user}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Délai de connexion</p>
                <p className="font-medium">{smtpDetails.connectionTimeout} ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Délai d'accueil</p>
                <p className="font-medium">{smtpDetails.greetingTimeout} ms</p>
              </div>
            </div>
          </div>
        )}

        {selectedEmail ? (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <button 
                onClick={() => {
                  setSelectedEmail(null);
                  setEmailContent(null);
                }}
                className="flex items-center gap-2 text-[#4FBA73] hover:underline"
              >
                <ArrowLeft size={16} />
                Retour à la liste
              </button>
              
              {emailContent && (
                <div className="flex items-center gap-2">
                  <a 
                    href={`data:text/html;charset=utf-8,${encodeURIComponent(emailContent)}`}
                    download={selectedEmail}
                    className="flex items-center gap-2 text-[#BC7AF9] hover:underline"
                  >
                    <Download size={16} />
                    Télécharger
                  </a>
                </div>
              )}
            </div>
            
            {loadingEmail ? (
              <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#4FBA73]" />
              </div>
            ) : emailContent ? (
              <div className="h-[calc(100vh-300px)] overflow-auto border rounded-md">
                <iframe 
                  srcDoc={emailContent}
                  className="h-full w-full border-0"
                  title="Email content"
                />
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center">
                <p className="text-gray-500">Impossible de charger le contenu de l'email</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#4FBA73]" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchEmails}
                  className="mt-4 rounded-md bg-[#4FBA73] px-4 py-2 text-white hover:bg-[#3da562]"
                >
                  Réessayer
                </button>
              </div>
            ) : emails.length === 0 ? (
              <div className="rounded-lg border bg-white p-6 shadow-sm text-center">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold">Aucun email sauvegardé</h2>
                <p className="mt-2 text-gray-600">
                  {smtpStatus === 'active' 
                    ? 'SMTP est actif. Les emails sont envoyés directement et ne sont pas sauvegardés localement.' 
                    : 'Les emails apparaîtront ici lorsque des formulaires seront soumis et que l\'envoi SMTP échouera.'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Destinataire</th>
                        <th className="px-4 py-3 text-left">Taille</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((email) => {
                        const recipient = extractRecipient(email.filename);
                        
                        return (
                          <tr key={email.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {new Date(email.createdAt).toLocaleString('fr-FR')}
                            </td>
                            <td className="px-4 py-3">{recipient}</td>
                            <td className="px-4 py-3">
                              {email.size ? formatFileSize(email.size) : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => viewEmail(email.filename)}
                                className="flex items-center gap-2 text-[#4FBA73] hover:underline"
                              >
                                <Eye size={16} />
                                Voir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}