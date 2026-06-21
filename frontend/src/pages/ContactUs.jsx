import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Have questions about a hotel, or need support with an active booking? Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 h-fit">
            <h3 className="font-bold text-lg mb-4">Support Channels</h3>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-950/45 rounded-lg text-primary-600 dark:text-primary-400 mt-0.5">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Headquarters</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  123 Hospitality Lane, Suit 400, Mumbai, India
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-950/45 rounded-lg text-primary-600 dark:text-primary-400 mt-0.5">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Direct Phone</h4>
                <p className="text-xs text-slate-500 mt-0.5">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-950/45 rounded-lg text-primary-600 dark:text-primary-400 mt-0.5">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Email Helpdesk</h4>
                <p className="text-xs text-slate-500 mt-0.5">support@luxestay.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Send Message</h3>

            {submitted && (
              <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 p-3 rounded-lg text-sm flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-emerald-600" />
                <span>Thank you! Your inquiry has been submitted. We'll reply within 24 hours.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">YOUR NAME</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">MESSAGE</label>
                <textarea
                  required
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactUs;
