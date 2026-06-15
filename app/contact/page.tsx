import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with SereneStay',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-4">
          Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
        </p>
        <p className="text-gray-600 mb-8">
          Email us at{' '}
          <a href="mailto:support@howistoday.online" className="text-secondary hover:underline">
            support@howistoday.online
          </a>
        </p>

        <form action="https://formsubmit.co/449193216@qq.com" method="POST">
          {/* FormSubmit config */}
          <input type="hidden" name="_subject" value="SereneStay Contact Form" />
          <input type="hidden" name="_next" value="https://howistoday.online/contact" />
          <input type="text" name="_honey" style={{ display: 'none' }} />
          <input type="hidden" name="_captcha" value="true" />

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-vertical"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-secondary text-white py-3 px-6 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
