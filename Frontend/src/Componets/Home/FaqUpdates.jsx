import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, CircleHelp, FileCheck2, Minus, Plus } from "lucide-react";
import PageContainer from "../CommonComponents/PageContainer";

const faqs = [
  {
    question: "How can I apply for a certificate?",
    answer:
      "Contact us or visit the service centre. Our team will help identify the right application and guide you through the submission steps.",
  },
  {
    question: "What documents are required?",
    answer:
      "Required documents depend on the service. Please contact us with the service you need, and we’ll help you confirm the applicable document list.",
  },
  {
    question: "How long does it take to get a certificate?",
    answer:
      "Processing time varies by service and the relevant government department. We can explain the expected process when you submit your request.",
  },
  {
    question: "Can I track my application status?",
    answer:
      "Contact our team with your application details and we’ll help you check the available status information.",
  },
  {
    question: "Do you provide print and scan services?",
    answer:
      "Yes. Visit our centre for document printing, scanning and related digital support.",
  },
  {
    question: "How can I know the service charges?",
    answer:
      "Charges vary depending on the requested service. Contact us before applying and our team will explain the applicable charges.",
  },
];

const updates = [
  {
    title: "Government scheme application assistance",
    description: "Contact us for help with available scheme applications.",
    Icon: FileCheck2,
  },
  {
    title: "Online certificate services",
    description: "Get support preparing and submitting certificate requests.",
    Icon: FileCheck2,
  },
  {
    title: "Document printing and scanning",
    description: "Visit our centre for document and digital service support.",
    Icon: FileCheck2,
  },
  {
    title: "Application guidance",
    description: "Our team can guide you through the required application steps.",
    Icon: FileCheck2,
  },
];

const FaqUpdates = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="border-y border-primary/20 bg-[#080b0e] py-12 text-white sm:py-16">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <CircleHelp size={19} />
              <h2 className="text-xl font-black sm:text-2xl">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Find answers to common questions about our services.
            </p>

            <div className="mt-5 space-y-2">
              {faqs.map(({ question, answer }, index) => {
                const isOpen = openFaq === index;
                const answerId = `faq-answer-${index}`;

                return (
                  <div
                    key={question}
                    className="overflow-hidden rounded-xl border border-white/15 bg-[#0e1216] transition-colors hover:border-primary/50"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/60 text-primary">
                        {isOpen ? <Minus size={13} /> : <CircleHelp size={13} />}
                      </span>
                      <span className="flex-1 text-xs font-medium text-slate-100 sm:text-sm">
                        {question}
                      </span>
                      {isOpen ? (
                        <Minus size={17} className="shrink-0 text-primary" />
                      ) : (
                        <Plus size={17} className="shrink-0 text-slate-300" />
                      )}
                    </button>
                    {isOpen && (
                      <div
                        id={answerId}
                        className="border-t border-white/10 px-4 py-3 pl-[3.25rem] text-xs leading-5 text-slate-400 sm:text-sm"
                      >
                        {answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <Bell size={18} />
                  <h2 className="text-xl font-black sm:text-2xl">
                    Service Updates
                  </h2>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Information about services available at our centre.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition hover:text-orange-300 sm:text-sm"
              >
                Contact us <ArrowRight size={15} />
              </Link>
            </div>

            <ul className="mt-5 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#0e1216] px-4">
              {updates.map(({ title, description, Icon }) => (
                <li key={title} className="flex items-start gap-3 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <Icon size={19} />
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-white sm:text-sm">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default FaqUpdates;
