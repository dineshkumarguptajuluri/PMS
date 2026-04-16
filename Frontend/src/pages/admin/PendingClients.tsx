// import React, { useEffect, useState } from 'react';
// import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
// import Badge from '../../components/ui/Badge';
// import apiClient from '../../api/client';
// import { useToast } from '../../hooks/useToast';
// import { CheckCircle, XCircle, User, Info, Building2, MapPin, FileText, ExternalLink } from 'lucide-react';

// interface ClientOnboardingData {
//   id: number;
//   legalName: string;
//   industryType?: string;
//   onboardingStatus: string;
//   companyData: any;
//   locationData: any;
//   contactsData: any;
//   legalData: any;
//   user: { email: string };
//   documents: Array<{ id: number; fileUrl: string; docType: string }>;
// }

// const parseJsonField = <T,>(value: T | string | null | undefined): T | null => {
//   if (value == null) {
//     return null;
//   }

//   if (typeof value !== 'string') {
//     return value as T;
//   }

//   try {
//     return JSON.parse(value) as T;
//   } catch {
//     return null;
//   }
// };

// const normalizeClient = (client: ClientOnboardingData): ClientOnboardingData => ({
//   ...client,
//   companyData: parseJsonField(client.companyData) ?? {},
//   locationData: parseJsonField(client.locationData) ?? {},
//   contactsData: parseJsonField(client.contactsData) ?? {},
//   legalData: parseJsonField(client.legalData) ?? {},
//   documents: Array.isArray(client.documents) ? client.documents : [],
// });

// const getApiOrigin = () => {
//   const configuredBaseUrl = apiClient.defaults.baseURL;

//   if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.length > 0) {
//     try {
//       return new URL(configuredBaseUrl).origin;
//     } catch {
//       // Fall back to the current app origin when the base URL is relative.
//     }
//   }

//   return window.location.origin;
// };

// const getDocumentUrl = (fileUrl: string) => {
//   if (!fileUrl) {
//     return '#';
//   }

//   if (/^https?:\/\//i.test(fileUrl)) {
//     return fileUrl;
//   }

//   const normalizedPath = fileUrl.startsWith('/api/uploads/')
//     ? fileUrl.replace(/^\/api/, '')
//     : fileUrl.startsWith('/uploads/')
//       ? fileUrl
//       : `/uploads/${fileUrl.replace(/^\/+/, '')}`;

//   return `${getApiOrigin()}${normalizedPath}`;
// };

// const AdminPendingClients: React.FC = () => {
//   const [clients, setClients] = useState<ClientOnboardingData[]>([]);
//   const [selectedClient, setSelectedClient] = useState<ClientOnboardingData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const toast = useToast();

//   const fetchPending = async () => {
//     try {
//       const response = await apiClient.get('/admin/clients/onboarding-requests');
//       const normalizedClients = Array.isArray(response.data)
//         ? response.data.map((client) => normalizeClient(client))
//         : [];
//       setClients(normalizedClients);
//     } catch {
//       toast.error('Failed to load onboarding requests');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPending();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleAction = async (profileId: number, action: 'APPROVE' | 'REJECT') => {
//     try {
//       await apiClient.patch(`/admin/clients/onboarding/${profileId}`, { action });
//       toast.success(`Client ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
//       fetchPending();
//       setSelectedClient(null);
//     } catch {
//       toast.error(`Failed to ${action.toLowerCase()} client`);
//     }
//   };

//   if (isLoading) {
//     return <div className="space-y-4 animate-pulse">
//       {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>)}
//     </div>;
//   }

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-2xl font-bold text-text-primary">Onboarding Approvals</h1>
//         <p className="text-text-muted">Review detailed company profiles submitted by new clients.</p>
//       </div>

//       <div className="grid grid-cols-1 gap-6">
//         {clients.map((client) => (
//           <Card key={client.id} className="border-l-4 border-l-primary-blue hover:shadow-md transition-shadow">
//             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//               <div className="flex-1 space-y-4">
//                 <div className="flex items-center space-x-4">
//                   <div className="h-12 w-12 rounded-full bg-bg-soft flex items-center justify-center text-primary-blue">
//                     <User size={24} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold text-text-primary">{client.legalName}</h3>
//                     <p className="text-sm text-text-muted">{client.user.email}</p>
//                   </div>
//                   <Badge variant="warning">Awaiting Approval</Badge>
//                 </div>

//                 <div className="flex items-center space-x-6 text-sm text-text-secondary">
//                   <div className="flex items-center"><Building2 size={16} className="mr-2" /> {client.companyData?.industry || 'N/A'}</div>
//                   <div className="flex items-center"><MapPin size={16} className="mr-2" /> {client.locationData?.hq?.city || 'N/A'}</div>
//                 </div>
//               </div>

//               <div className="flex flex-wrap items-center gap-3 lg:border-l lg:pl-8 border-gray-100">
//                 <Button
//                   variant="outline"
//                   onClick={() => setSelectedClient(client)}
//                 >
//                   <Info size={18} className="mr-2" />
//                   View Details
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="text-danger border-danger hover:bg-danger/10"
//                   onClick={() => handleAction(client.id, 'REJECT')}
//                 >
//                   <XCircle size={18} className="mr-2" />
//                   Reject
//                 </Button>
//                 <Button
//                   variant="primary"
//                   onClick={() => handleAction(client.id, 'APPROVE')}
//                 >
//                   <CheckCircle size={18} className="mr-2" />
//                   Approve
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         ))}

//         {clients.length === 0 && (
//           <Card className="flex flex-col items-center justify-center py-16 text-center">
//             <div className="p-4 bg-success/10 rounded-full mb-4">
//               <CheckCircle className="text-success" size={48} />
//             </div>
//             <h3 className="text-xl font-bold text-text-primary">No Pending Requests</h3>
//             <p className="text-text-muted mt-2">All client onboarding requests have been processed.</p>
//           </Card>
//         )}
//       </div>

//       {/* Modal / Detail View for selected client */}
//       {selectedClient && (
//         <div
//           className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:p-10"
//           onClick={() => setSelectedClient(null)}
//         >
//           <div
//             className="relative flex min-h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex-none border-b border-gray-100 bg-white p-8 md:px-12 flex justify-between items-center">
//               <div className="flex items-center gap-6">
//                 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
//                   <Building2 size={28} />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">{selectedClient.legalName}</h2>
//                   <p className="text-gray-500">{selectedClient.user.email}</p>
//                 </div>
//               </div>
//               <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600">
//                 <XCircle size={28} />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//                 <div className="lg:col-span-2 space-y-8">
//                   <section>
//                     <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-600">Company Profile</h4>
//                     <div className="grid grid-cols-2 gap-6 rounded-2xl border border-gray-100 bg-gray-50 p-6">
//                       <div>
//                         <p className="text-xs font-bold uppercase text-gray-400">Industry</p>
//                         <p className="font-semibold text-gray-900">{selectedClient.industryType || selectedClient.companyData?.industry || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs font-bold uppercase text-gray-400">Size</p>
//                         <p className="font-semibold text-gray-900">{selectedClient.companyData?.size || 'N/A'}</p>
//                       </div>
//                       <div className="col-span-2">
//                         <p className="text-xs font-bold uppercase text-gray-400">Location</p>
//                         <p className="font-semibold text-gray-900">
//                           {[selectedClient.locationData?.hq?.city, selectedClient.locationData?.hq?.country].filter(Boolean).join(', ') || 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                   </section>

//                   <section>
//                     <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-600">Documents</h4>
//                     {selectedClient.documents?.length > 0 ? (
//                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                         {selectedClient.documents.map((doc) => (
//                           <a
//                             key={doc.id}
//                             href={getDocumentUrl(doc.fileUrl)}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="flex items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-blue-300"
//                           >
//                             <FileText size={20} className="mr-3 text-blue-500" />
//                             <span className="truncate text-sm font-medium text-gray-900">{doc.docType || 'Document'}</span>
//                             <ExternalLink size={14} className="ml-auto text-gray-300" />
//                           </a>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="italic text-gray-400">No documents uploaded.</p>
//                     )}
//                   </section>
//                 </div>

//                 <div className="space-y-6">
//                   <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600">Stakeholders</h4>
//                   {['primary', 'finance', 'it'].map((type) => {
//                     const contact = selectedClient.contactsData?.[type];

//                     return (
//                       <div key={type} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
//                         <p className="mb-2 text-[10px] font-black uppercase text-blue-600">{type}</p>
//                         <p className="text-sm font-bold text-gray-900">{contact?.name || 'Not provided'}</p>
//                         <p className="truncate text-xs text-gray-500">{contact?.email || 'No Email'}</p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             <div className="flex-none border-t border-gray-100 bg-gray-50 p-8 md:px-12 flex justify-end items-center gap-4">
//               <Button variant="outline" onClick={() => setSelectedClient(null)}>
//                 Close
//               </Button>
//               <Button
//                 variant="outline"
//                 className="text-danger border-danger hover:bg-danger/10"
//                 onClick={() => handleAction(selectedClient.id, 'REJECT')}
//               >
//                 <XCircle size={18} className="mr-2" />
//                 Reject Onboarding
//               </Button>
//               <Button
//                 variant="primary"
//                 className="bg-blue-600 px-8 shadow-lg shadow-blue-100 hover:bg-blue-700"
//                 onClick={() => handleAction(selectedClient.id, 'APPROVE')}
//               >
//                 Approve Onboarding
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPendingClients;
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { CheckCircle, XCircle, User, Info, Building2, MapPin, FileText, ExternalLink, Mail, Phone } from 'lucide-react';

interface ClientOnboardingData {
  id: number;
  legalName: string;
  industryType?: string;
  onboardingStatus: string;
  companyData: any;
  locationData: any;
  contactsData: any;
  legalData: any;
  user: { email: string };
  documents: Array<{ id: number; fileUrl: string; docType: string }>;
}

const parseJsonField = <T,>(value: T | string | null | undefined): T | null => {
  if (value == null) return null;
  if (typeof value !== 'string') return value as T;
  try { return JSON.parse(value) as T; } catch { return null; }
};

const normalizeClient = (client: ClientOnboardingData): ClientOnboardingData => ({
  ...client,
  companyData: parseJsonField(client.companyData) ?? {},
  locationData: parseJsonField(client.locationData) ?? {},
  contactsData: parseJsonField(client.contactsData) ?? {},
  legalData: parseJsonField(client.legalData) ?? {},
  documents: Array.isArray(client.documents) ? client.documents : [],
});

const getApiOrigin = () => {
  const configuredBaseUrl = apiClient.defaults.baseURL;
  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.length > 0) {
    try { return new URL(configuredBaseUrl).origin; } catch { }
  }
  return window.location.origin;
};

const getDocumentUrl = (fileUrl: string) => {
  if (!fileUrl) return '#';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const normalizedPath = fileUrl.startsWith('/api/uploads/')
    ? fileUrl.replace(/^\/api/, '')
    : fileUrl.startsWith('/uploads/') ? fileUrl : `/uploads/${fileUrl.replace(/^\/+/, '')}`;
  return `${getApiOrigin()}${normalizedPath}`;
};

const AdminPendingClients: React.FC = () => {
  const [clients, setClients] = useState<ClientOnboardingData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientOnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchPending = async () => {
    try {
      const response = await apiClient.get('/admin/clients/onboarding-requests');
      const normalizedClients = Array.isArray(response.data)
        ? response.data.map((client) => normalizeClient(client))
        : [];
      setClients(normalizedClients);
    } catch {
      toast.error('Failed to load onboarding requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (profileId: number, action: 'APPROVE' | 'REJECT') => {
    try {
      await apiClient.patch(`/admin/clients/onboarding/${profileId}`, { action });
      toast.success(`Client ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      fetchPending();
      setSelectedClient(null);
    } catch {
      toast.error(`Failed to ${action.toLowerCase()} client`);
    }
  };

  if (isLoading) {
    return <div className="p-6 space-y-4 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Onboarding Approvals</h1>
        <p className="text-text-muted">Review detailed company profiles submitted by new clients.</p>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="border-l-4 border-l-primary-blue hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-bg-soft flex items-center justify-center text-primary-blue">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{client.legalName}</h3>
                    <p className="text-sm text-text-muted">{client.user.email}</p>
                  </div>
                  <Badge variant="warning">Awaiting Approval</Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:border-l lg:pl-8 border-gray-100">
                <Button variant="outline" onClick={() => setSelectedClient(client)}>
                  <Info size={18} className="mr-2" /> View Details
                </Button>
                <Button variant="primary" onClick={() => handleAction(client.id, 'APPROVE')}>
                  <CheckCircle size={18} className="mr-2" /> Approve
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- SEPARATE COMPACT MODAL --- */}
      {selectedClient && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Building2 size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold">{selectedClient.legalName}</h2>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={28} />
              </button>
            </div>

            {/* Compact Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section>
                  <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">Company Details</h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Industry</p>
                      <p className="text-xs font-semibold">{selectedClient.industryType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Location</p>
                      <p className="text-xs font-semibold">{selectedClient.locationData?.hq?.city || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">Documents</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedClient.documents?.map(doc => (
                      <a key={doc.id} href={getDocumentUrl(doc.fileUrl)} target="_blank" className="p-2 px-3 border rounded-lg flex items-center hover:bg-blue-50">
                        <FileText size={14} className="mr-2 text-blue-500" />
                        <span className="text-[11px] truncate">{doc.docType}</span>
                      </a>
                    ))}
                  </div>
                </section>
              </div>

              {/* Contacts */}
              <div className="space-y-3 border-l pl-6">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Stakeholders</h4>
                {['primary', 'finance', 'it'].map(type => (
                  <div key={type} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-[9px] font-bold text-blue-500 uppercase">{type}</p>
                    <p className="text-xs font-bold truncate">{selectedClient.contactsData?.[type]?.name || 'N/A'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{selectedClient.contactsData?.[type]?.email}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Reject and Approve */}
            <div className="p-4 px-8 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedClient(null)}>Close</Button>

              <Button
                variant="outline"
                className="text-danger border-danger hover:bg-danger/10"
                onClick={() => handleAction(selectedClient.id, 'REJECT')}
              >
                <XCircle size={18} className="mr-2" /> Reject
              </Button>

              <Button
                variant="primary"
                className="px-8 bg-blue-600"
                onClick={() => handleAction(selectedClient.id, 'APPROVE')}
              >
                Approve Onboarding
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingClients;