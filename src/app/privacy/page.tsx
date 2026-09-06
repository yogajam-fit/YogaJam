import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contactData } from "@/content/contact";

export const metadata = {
  title: "Privacy Policy | YogaJam",
  description: "Privacy policy and data collection practices for YogaJam.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 bg-background">
      <Container>
        <div className="max-w-4xl mx-auto">
          <SectionHeading 
            title="Privacy Policy"
            align="left"
            className="mb-12"
          />

          <div className="prose prose-invert md:prose-lg max-w-none text-foreground-secondary leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <h2 className="text-xl md:text-2xl font-bold font-heading text-white mt-10 md:mt-12 mb-4 md:mb-6">1. Introduction</h2>
            <p>
              Welcome to YogaJam. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our website 
              (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-white mt-10 md:mt-12 mb-4 md:mb-6">2. The Data We Collect About You</h2>
            <p>
              Personal data, or personal information, means any information about an individual from which that person can be identified. 
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-6">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of events you have booked with us.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-white mt-10 md:mt-12 mb-4 md:mb-6">3. How We Use Your Personal Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-6">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-white mt-10 md:mt-12 mb-4 md:mb-6">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. 
              In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 className="text-xl md:text-2xl font-bold font-heading text-white mt-10 md:mt-12 mb-4 md:mb-6">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
              <br />
              Email: <a href={`mailto:${contactData.email}`} className="text-white hover:text-accent transition-colors">{contactData.email}</a>
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
