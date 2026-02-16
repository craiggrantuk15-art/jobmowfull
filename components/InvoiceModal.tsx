import React, { useState } from 'react';
import { Job, PaymentStatus, CommunicationType } from '../types';
import { useJobs } from '../context/JobContext';
import { generateInvoiceEmail, generateReviewRequest } from '../services/geminiService';
import { X, Send, CheckCircle, Printer, Loader2, DollarSign, PoundSterling, CreditCard, Star, Copy, Smartphone } from 'lucide-react';

interface InvoiceModalProps {
  job: Job;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ job, onClose }) => {
  const { updatePaymentStatus, updateJob, settings, addCommunication } = useJobs();
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  
  // Review Request State
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [reviewDraft, setReviewDraft] = useState<string | null>(null);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [copyReviewSuccess, setCopyReviewSuccess] = useState(false);

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    const type = job.paymentStatus === PaymentStatus.PAID ? 'receipt' : 'invoice';
    const text = await generateInvoiceEmail(job, type);
    setEmailDraft(text);
    setIsGenerating(false);
  };

  const handleSend = () => {
    const type = job.paymentStatus === PaymentStatus.PAID ? 'Receipt' : 'Invoice';
    
    addCommunication({
      customerId: `${job.customerName}-${job.address}`,
      jobId: job.id,
      type: CommunicationType.EMAIL,
      subject: `${type} Sent`,
      body: emailDraft || `Sent ${type.toLowerCase()} for £${job.priceQuote}.`
    });

    setEmailDraft(null);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const togglePayment = () => {
    const newStatus = job.paymentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID;
    updatePaymentStatus(job.id, newStatus);
    
    if (newStatus === PaymentStatus.PAID) {
        setShowReviewPrompt(true);
        setReviewDraft(null);
    } else {
        setShowReviewPrompt(false);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
      updateJob(job.id, { paymentMethod: method });
  };

  const handleDraftReview = async () => {
      setIsGeneratingReview(true);
      const draft = await generateReviewRequest(job);
      setReviewDraft(draft);
      setIsGeneratingReview(false);
  };

  const copyReview = () => {
      if (reviewDraft) {
          navigator.clipboard.writeText(reviewDraft);
          setCopyReviewSuccess(true);
          
          addCommunication({
            customerId: `${job.customerName}-${job.address}`,
            jobId: job.id,
            type: CommunicationType.SMS,
            subject: 'Review Request Sent',
            body: reviewDraft
          });

          setTimeout(() => setCopyReviewSuccess(false), 2000);
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
           <h2 className="font-bold text-slate-800 flex items-center gap-2">
             <PoundSterling size={20} className="text-lawn-600" /> 
             {job.paymentStatus === PaymentStatus.PAID ? 'Payment Receipt' : 'Invoice'}
           </h2>
           <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
             <X size={20} />
           </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-white">
           {/* Invoice Paper Design */}
           <div className="border border-slate-200 rounded-lg p-8 shadow-sm">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h1 className="text-2xl font-bold text-lawn-700">{settings.businessName}</h1>
                    <p className="text-slate-500 text-sm mt-1">Lawn Care Services</p>
                 </div>
                 <div className="text-right">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {job.paymentStatus === PaymentStatus.PAID ? 'RECEIPT' : 'INVOICE'}
                    </h3>
                    <p className="text-slate-500 text-sm">#{job.id.substring(0, 8)}</p>
                    <p className="text-slate-500 text-sm">{job.completedDate?.split('T')[0] || 'Unknown Date'}</p>
                 </div>
              </div>

              <div className="flex justify-between mb-8">
                 <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Bill To</p>
                    <p className="font-semibold text-slate-900">{job.customerName}</p>
                    <p className="text-slate-600 text-sm">{job.address}</p>
                 </div>
              </div>

              <table className="w-full mb-8">
                 <thead>
                    <tr className="border-b border-slate-200 text-left">
                       <th className="pb-3 text-sm font-semibold text-slate-600">Service Description</th>
                       <th className="pb-3 text-sm font-semibold text-slate-600 text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr className="border-b border-slate-50">
                       <td className="py-4 text-slate-800">
                          {job.frequency} Lawn Mowing ({job.lawnSize})
                          {job.notes && <div className="text-xs text-slate-500 mt-1">{job.notes}</div>}
                       </td>
                       <td className="py-4 text-slate-800 text-right font-medium">{settings.currency}{job.priceQuote.toFixed(2)}</td>
                    </tr>
                 </tbody>
                 <tfoot>
                    <tr>
                       <td className="pt-4 text-right font-bold text-slate-900">Total</td>
                       <td className="pt-4 text-right font-bold text-slate-900 text-xl">{settings.currency}{job.priceQuote.toFixed(2)}</td>
                    </tr>
                 </tfoot>
              </table>

              <div className="flex justify-between items-end mt-8">
                  <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Payment Method</h4>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <CreditCard size={14} />
                        {job.paymentMethod || 'Bank Transfer'}
                      </p>
                      {(job.paymentMethod || 'Bank Transfer') === 'Bank Transfer' && job.paymentStatus === PaymentStatus.UNPAID && (
                          <p className="text-xs text-slate-400 mt-1">
                              Sort Code: {settings.sortCode} | Acc: {settings.accountNumber} ({settings.bankName})
                          </p>
                      )}
                  </div>
                  
                  {job.paymentStatus === PaymentStatus.PAID && (
                    <div className="border-2 border-emerald-500 text-emerald-600 font-bold text-xl uppercase inline-block px-4 py-2 transform -rotate-12 rounded opacity-80">
                        PAID IN FULL
                    </div>
                  )}
              </div>
           </div>

           {/* Automated Review Request Prompt - Only appears when Paid */}
           {showReviewPrompt && (
               <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg p-4 animate-in zoom-in-95 duration-300">
                   <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2 text-orange-800 font-semibold">
                           <Star size={18} className="fill-orange-400 text-orange-400" />
                           Review Request
                       </div>
                       <button onClick={() => setShowReviewPrompt(false)} className="text-orange-400 hover:text-orange-600">
                           <X size={16} />
                       </button>
                   </div>
                   
                   {!reviewDraft ? (
                       <div className="flex items-center justify-between">
                            <p className="text-sm text-orange-700">Great job collecting payment! Want to ask {job.customerName} for a Google Review?</p>
                            <button 
                                onClick={handleDraftReview}
                                disabled={isGeneratingReview}
                                className="bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center gap-2"
                            >
                                {isGeneratingReview ? <Loader2 size={14} className="animate-spin"/> : <Smartphone size={14} />}
                                Draft SMS
                            </button>
                       </div>
                   ) : (
                       <div className="space-y-3">
                           <textarea 
                                className="w-full text-sm p-3 border border-orange-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-orange-200 outline-none"
                                rows={2}
                                value={reviewDraft}
                                onChange={(e) => setReviewDraft(e.target.value)}
                           />
                           <div className="flex gap-2">
                                <button 
                                    onClick={copyReview}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    {copyReviewSuccess ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    {copyReviewSuccess ? 'Copied' : 'Copy Text'}
                                </button>
                                <a 
                                    href={`sms:${job.phone?.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(reviewDraft)}`}
                                    className="flex-1 bg-white border border-orange-200 text-orange-700 hover:bg-orange-50 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Send size={14} /> Send SMS
                                </a>
                           </div>
                       </div>
                   )}
               </div>
           )}

           {/* Email Draft Section */}
           {emailDraft && (
               <div className="mt-6 bg-slate-50 rounded-lg border border-slate-200 p-4 animate-in slide-in-from-bottom-2">
                   <div className="flex justify-between mb-2">
                       <h4 className="text-sm font-semibold text-slate-700">Email Draft</h4>
                       <button onClick={() => setEmailDraft(null)} className="text-xs text-slate-400 hover:text-slate-600">Discard</button>
                   </div>
                   <textarea 
                      className="w-full h-32 p-3 text-sm border border-slate-300 rounded bg-white"
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                   />
                   <button 
                      onClick={handleSend}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                   >
                      <Send size={16} /> Send Email
                   </button>
               </div>
           )}
           
           {sentSuccess && (
               <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                   <CheckCircle size={16} /> Email sent successfully!
               </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 mr-2">
                    <span className="text-xs text-slate-500 font-medium">Method:</span>
                    <select 
                        className="text-sm border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-lawn-500"
                        value={job.paymentMethod || 'Bank Transfer'}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                    </select>
                 </div>
                 
                <button 
                    onClick={togglePayment}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                        job.paymentStatus === PaymentStatus.PAID 
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                    {job.paymentStatus === PaymentStatus.PAID ? 'Mark Unpaid' : 'Mark as Paid'}
                </button>
                <button 
                    onClick={handleGenerateEmail}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    {job.paymentStatus === PaymentStatus.PAID ? 'Send Receipt' : 'Send Invoice'}
                </button>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-2">
                <Printer size={20} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;