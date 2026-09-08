import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { faqs } from "@/content/faq";

export const metadata = {
  title: "FAQ | YogaJam - Frequently Asked Questions",
  description: "Got questions? We've got answers. Find out everything you need to know about YogaJam events, what to bring, and how our cinematic wellness experiences work.",
  keywords: "YogaJam FAQ, yoga questions, what to bring to yoga, cinematic yoga faq, wellness events faq",
};

export default function FaqPage() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 bg-background overflow-hidden">
      <Container>
        <div className="max-w-3xl mx-auto">
          <SectionHeading 
            title={<>Frequently Asked <span className="text-accent-warm">Questions</span></>}
            subtitle="Everything you need to know before stepping onto the mat."
            align="center"
            className="mb-12 md:mb-16"
          />
          
          <FaqAccordion items={faqs} />

          <div className="mt-16 text-center border-t border-border pt-12">
            <h3 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-4">Still have questions?</h3>
            <p className="text-foreground-secondary mb-6">
              Can't find the answer you're looking for? Reach out to our team.
            </p>
            <a href="/help" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-surface border border-border text-foreground font-bold text-sm hover:bg-foreground/ transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
