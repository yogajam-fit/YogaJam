import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contactData } from "@/content/contact";

export const metadata = {
  title: "Need Help | YogaJam",
  description: "Get in touch with the YogaJam team for support, private bookings, or partnerships.",
};

export default function HelpPage() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 bg-background">
      <Container>
        <div className="max-w-4xl mx-auto">
          <SectionHeading 
            title="Need Help?"
            subtitle="Whether you have a question about an upcoming event, need support with a booking, or want to collaborate, we're here for you."
            align="left"
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* General Inquiries */}
            <div className="p-8 rounded-3xl bg-surface border border-border hover:border-accent/30 transition-colors">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-4">General Inquiries</h2>
              <p className="text-foreground-secondary mb-6 leading-relaxed">
                For general questions, feedback, or media inquiries, drop us an email. Our team typically responds within 24 hours.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href={`mailto:${contactData.email}`} className="text-foreground hover:text-accent font-medium transition-colors">
                  {contactData.email}
                </a>
              </div>
            </div>

            {/* Instant Support */}
            <div className="p-8 rounded-3xl bg-surface border border-border hover:border-accent/30 transition-colors">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-4">Instant Support</h2>
              <p className="text-foreground-secondary mb-6 leading-relaxed">
                Need urgent help with a booking or finding an event location? Reach out to us directly on WhatsApp.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <a href={`https://wa.me/${contactData.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent font-medium transition-colors">
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* Partnerships */}
            <div className="p-8 rounded-3xl bg-surface border border-border hover:border-accent/30 transition-colors md:col-span-2">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-4">Host an Event / Partnerships</h2>
              <p className="text-foreground-secondary mb-6 leading-relaxed max-w-2xl">
                Interested in hosting a private YogaJam experience or looking to partner with us for a brand activation? 
                Check out our Private Events page or contact our partnerships team.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a href="/personalized-events" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent text-background font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(200,232,107,0.2)]">
                  Explore Private Events
                </a>
                <span className="text-foreground-secondary">or</span>
                <a href={`mailto:${contactData.partnershipsEmail}`} className="text-foreground hover:text-accent font-medium transition-colors underline underline-offset-4 break-all">
                  {contactData.partnershipsEmail}
                </a>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </main>
  );
}
