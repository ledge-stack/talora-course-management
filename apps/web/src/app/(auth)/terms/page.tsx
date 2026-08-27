import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms and Conditions | Talora',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="glass-panel max-w-3xl w-full p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-6">Terms and Conditions</h1>
        
        <div className="text-text-secondary space-y-6">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">1. Introduction</h2>
            <p>Welcome to Talora. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">2. Data Usage and Privacy</h2>
            <p>Your privacy is important to us. We collect your phone number and email address strictly for the purpose of academic coordination. Specifically, your phone number may be shared with your designated Group Leader to facilitate out-of-band communication for group projects and assignments.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">3. Acceptable Use</h2>
            <p>You agree to use this platform only for academic purposes related to your enrolled courses. Harassment, spam, and the sharing of unauthorized or malicious content are strictly prohibited and will result in account termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Limitation of Liability</h2>
            <p>Talora is provided "as is". We are not responsible for any disputes arising between students, loss of assignment data, or missed deadlines resulting from platform usage.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border-subtle flex justify-end">
          <button onClick={() => window.close()} className="btn-primary">Close Window</button>
        </div>
      </div>
    </div>
  );
}
