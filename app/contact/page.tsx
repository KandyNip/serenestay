import { Metadata } from 'next';
import { Mail, Send, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with SereneStay',
};

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--color-forest-deep)', minHeight: '100vh' }}>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{ background: 'rgba(107,158,126,0.15)' }}
            >
              <Mail className="w-8 h-8" style={{ color: 'var(--color-moss)' }} />
            </div>
            <h1 
              className="text-4xl md:text-5xl mb-4"
              style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--color-white)'
              }}
            >
              Contact Us
            </h1>
            <p style={{ color: 'var(--color-white-60)' }} className="text-lg">
              Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
            </p>
            <p style={{ color: 'var(--color-white-60)' }} className="mt-2">
              Email us at{' '}
              <a 
                href="mailto:support@howistoday.online" 
                style={{ color: 'var(--color-sky-light)' }}
                className="hover:underline"
              >
                support@howistoday.online
              </a>
            </p>
          </div>

          <div
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              padding: '2rem',
            }}
            className="sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5" style={{ color: 'var(--color-sky-light)' }} />
              <h2 
                className="text-xl"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-white)'
                }}
              >
                Send us a message
              </h2>
            </div>

            <form action="https://formsubmit.co/449193216@qq.com" method="POST">
              <input type="hidden" name="_subject" value="SereneStay Contact Form" />
              <input type="hidden" name="_next" value="https://howistoday.online/contact" />
              <input type="text" name="_honey" style={{ display: 'none' }} />
              <input type="hidden" name="_captcha" value="true" />

              <div className="space-y-6">
                <div>
                  <label 
                    htmlFor="name" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-white-80)' }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-white-80)' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-white-80)' }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all resize-vertical"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--color-sky)',
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
