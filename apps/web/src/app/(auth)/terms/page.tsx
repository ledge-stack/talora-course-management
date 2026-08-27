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
            <h2 className="text-xl font-bold text-text-primary mb-3">3. Academic Integrity</h2>
            <p>You agree that all assignments and work submitted through Talora are your own original work. Plagiarism, cheating, or the unauthorized sharing of copyrighted academic materials is strictly prohibited and violates these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Account Security</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must not share your password or allow others to access your account. You are responsible for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">5. Acceptable Use</h2>
            <p>You agree to use this platform only for academic purposes related to your enrolled courses. Harassment, spam, abusive language, and the sharing of malicious content are strictly prohibited and will result in account termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">6. Content Moderation & Right to Remove</h2>
            <p>Platform Administrators and Class Representatives reserve the right to moderate, remove, or modify any content, disband groups, or suspend user accounts if they determine a violation of these terms or university policies has occurred.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">7. Data Retention & Service Availability</h2>
            <p>Talora reserves the right to archive or permanently delete course data, including assignment submissions and group structures, after a semester concludes. Furthermore, Talora is provided "as is", and we do not guarantee uninterrupted access or uptime of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">8. Limitation of Liability</h2>
            <p>We are not responsible for any disputes arising between students, loss of assignment data, missed deadlines, or academic penalties resulting from the use or inability to use the platform.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border-subtle flex justify-end">
          <Link href="/" className="btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
