import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contactData } from "@/content/contact";

export const metadata = {
  title: "Terms of Condition | YogaJam",
  description: "Terms and conditions for using YogaJam services and participating in events.",
};

export default function TermsOfConditionPage() {
  return (
    <main className="flex-1 pt-24 md:pt-32 pb-16 md:pb-24 bg-background">
      <Container>
        <div className="max-w-4xl mx-auto">
          <SectionHeading 
            title="Terms of Condition"
            align="left"
            className="mb-12"
          />

          <div className="prose prose-invert md:prose-lg max-w-none text-foreground-secondary leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mt-10 md:mt-12 mb-4 md:mb-6">1. Agreement to Terms</h2>
            <p>
              By accessing our website and booking our events, you agree to be bound by these Terms of Condition and agree that you are responsible for the agreement with any applicable local laws. 
              If you disagree with any of these terms, you are prohibited from accessing this site or participating in YogaJam events.
            </p>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mt-10 md:mt-12 mb-4 md:mb-6">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials on YogaJam's website for personal, non-commercial transitory viewing only. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-6">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose or for any public display;</li>
              <li>Attempt to reverse engineer any software contained on YogaJam's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mt-10 md:mt-12 mb-4 md:mb-6">3. Event Participation & Liability</h2>
            <p>
              By participating in YogaJam events, you acknowledge that physical exercise involves inherent risks. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-6">
              <li>Assume full responsibility for any injuries or damages you may sustain during the event.</li>
              <li>Consult with a physician prior to participating if you have any existing medical conditions.</li>
              <li>Follow the instructions of the instructors and event organizers at all times.</li>
            </ul>
            <p>
              YogaJam, its instructors, and venues shall not be held liable for any personal injury, loss, or damage to personal property occurring during our events.
            </p>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mt-10 md:mt-12 mb-4 md:mb-6">4. Cancellations and Refunds</h2>
            <p>
              Event tickets are generally non-refundable unless specifically stated otherwise on the event booking page. 
              If YogaJam cancels an event, a full refund will be provided to all registered participants.
            </p>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mt-10 md:mt-12 mb-4 md:mb-6">5. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which YogaJam operates, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mt-10 md:mt-12 mb-4 md:mb-6">6. Contact Us</h2>
            <p>
              For any questions regarding these Terms of Condition, please reach out to us:
              <br />
              Email: <a href={`mailto:${contactData.email}`} className="text-foreground hover:text-accent transition-colors">{contactData.email}</a>
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
