import { useState } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_WHATSAPP_NUMBER,
} from "../../contactInfo";

const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  CONTACT_ADDRESS,
)}&output=embed`;

const contactCards = [
  {
    title: "Call Us",
    detail: CONTACT_PHONE_DISPLAY,
    note: "Speak with our support team.",
    href: CONTACT_PHONE_HREF,
    Icon: Phone,
  },
  {
    title: "Email Us",
    detail: CONTACT_EMAIL,
    note: "Send your enquiries anytime.",
    href: `mailto:${CONTACT_EMAIL}`,
    Icon: Mail,
  },
  {
    title: "Visit Our Centre",
    detail: CONTACT_ADDRESS,
    note: "Get assistance at our service centre.",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      CONTACT_ADDRESS,
    )}`,
    Icon: MapPin,
  },
  {
    title: "Working Hours",
    detail: "Mon - Sat: 9:00 AM - 8:00 PM",
    note: "Sunday: 9:00 AM - 1:00 PM",
    Icon: Clock3,
  },
];

const contactBenefits = [
  { title: "Friendly Assistance", note: "Our team is ready to guide you.", Icon: Users },
  { title: "Accurate Information", note: "Get clear details for your request.", Icon: FileText },
  { title: "Multiple Services", note: "Applications, certificates and more.", Icon: CheckCircle2 },
  { title: "Reliable Support", note: "Your trusted local digital service centre.", Icon: ShieldCheck },
];

const faqs = [
  {
    question: "What services do you provide?",
    answer:
      "We assist with government service applications, certificates, document support, printing and scanning.",
  },
  {
    question: "How can I check my application status?",
    answer:
      "Call or message our team with your application details and we’ll guide you through the available status information.",
  },
  {
    question: "What documents are required?",
    answer:
      "Document requirements depend on the service. Contact us with the service name and we’ll help you confirm the list.",
  },
  {
    question: "What are your working hours?",
    answer: "We are open Monday to Saturday from 9:00 AM to 8:00 PM, and Sunday from 9:00 AM to 1:00 PM.",
  },
];

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      await emailjs.send(
        "service_bs2ofiq",
        "template_2watukw",
        data,
        "PGkFp8TEtPWxWmOMo",
      );
      setSubmitMessage({
        type: "success",
        text: "Your enquiry was sent. Our team will contact you soon.",
      });
      reset();
    } catch (error) {
      console.error("Contact enquiry submission failed:", error);
      setSubmitMessage({
        type: "error",
        text: "We couldn’t send your enquiry. Please try again or call us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "min-h-12 w-full rounded-lg border border-white/10 bg-[#171b1f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <main className="bg-[#080b0e] text-white">
      <section className="relative isolate overflow-hidden border-b border-primary/30">
        <img
          src="/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png"
          alt="Dhiva E-Sevai Maiyam service centre"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/75 to-black/25" />
        <PageContainer className="py-12 sm:py-16 lg:py-20">
          <div className="text-xs font-medium text-slate-300">
            <Link to="/" className="transition hover:text-primary">Home</Link>
            <span className="mx-2 text-primary">›</span>
            <span className="text-white">Contact Us</span>
          </div>
          <div className="mt-6 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary sm:text-sm">
              Get in touch
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              We’re here
              <span className="block text-primary">to help you</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
              Have questions about certificates, online applications or
              documents? Our team is ready to support you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={CONTACT_PHONE_HREF}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                <Phone size={16} /> Call Us
              </a>
              <a
                href={`https://wa.me/${CONTACT_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/70 bg-black/50 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/20"
              >
                <MessageCircle size={16} className="text-primary" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-10 sm:py-14">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
          <section aria-labelledby="contact-information-heading">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              We’re ready to assist
            </p>
            <h2 id="contact-information-heading" className="mt-2 text-2xl font-black sm:text-3xl">
              Contact Information
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Reach us by phone, email or visit our service centre.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {contactCards.map(({ title, detail, note, href, Icon }) => {
                const CardContent = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon size={21} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-white">{title}</span>
                      <span className="mt-1 block break-words text-xs font-semibold text-primary">
                        {detail}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">{note}</span>
                    </span>
                  </>
                );

                return href ? (
                  <a
                    key={title}
                    href={href}
                    target={title === "Visit Our Centre" ? "_blank" : undefined}
                    rel={title === "Visit Our Centre" ? "noreferrer" : undefined}
                    className="flex min-h-28 items-start gap-3 rounded-xl border border-white/10 bg-[#101419] p-4 transition hover:border-primary/50"
                  >
                    {CardContent}
                  </a>
                ) : (
                  <div
                    key={title}
                    className="flex min-h-28 items-start gap-3 rounded-xl border border-white/10 bg-[#101419] p-4"
                  >
                    {CardContent}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-primary/30">
              <img
                src="/Hero/Modern%20DHIVA%20E-Sevai%20Reception%20Center.png"
                alt="Inside the Dhiva E-Sevai Maiyam service centre"
                loading="lazy"
                className="h-48 w-full object-cover sm:h-64"
              />
            </div>
          </section>

          <section
            aria-labelledby="contact-form-heading"
            className="h-fit rounded-2xl border border-primary/40 bg-gradient-to-br from-[#121619] to-[#0b0e11] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.3)] sm:p-7"
          >
            <span className="inline-flex rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Send an enquiry
            </span>
            <h2 id="contact-form-heading" className="mt-3 text-2xl font-black sm:text-3xl">
              Contact <span className="text-primary">Us</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Fill in the form and we’ll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="sr-only">Full name</label>
                <input
                  id="contact-name"
                  autoComplete="name"
                  placeholder="Full name *"
                  className={inputClass}
                  aria-invalid={Boolean(errors.name)}
                  {...register("name", { required: "Please enter your name." })}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="contact-mobile" className="sr-only">Phone number</label>
                <input
                  id="contact-mobile"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Phone number *"
                  className={inputClass}
                  aria-invalid={Boolean(errors.mobile)}
                  {...register("mobile", {
                    required: "Please enter your phone number.",
                    pattern: { value: /^[0-9]{10}$/, message: "Enter a 10-digit mobile number." },
                  })}
                />
                {errors.mobile && <p className="mt-1 text-xs text-red-400">{errors.mobile.message}</p>}
              </div>

              <div>
                <label htmlFor="contact-email" className="sr-only">Email address</label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address *"
                  className={inputClass}
                  aria-invalid={Boolean(errors.email)}
                  {...register("email", {
                    required: "Please enter your email address.",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email address." },
                  })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="contact-subject" className="sr-only">Service required</label>
                <select
                  id="contact-subject"
                  defaultValue=""
                  className={`${inputClass} appearance-none`}
                  aria-invalid={Boolean(errors.subject)}
                  {...register("subject", { required: "Please select a service." })}
                >
                  <option value="" disabled>Select a service *</option>
                  <option value="Certificate assistance">Certificate assistance</option>
                  <option value="Online application">Online application</option>
                  <option value="Document support">Document support</option>
                  <option value="Printing and scanning">Printing and scanning</option>
                  <option value="Other enquiry">Other enquiry</option>
                </select>
                {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="contact-message" className="sr-only">Your message</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Your message *"
                  className={`${inputClass} min-h-28 resize-y`}
                  aria-invalid={Boolean(errors.message)}
                  {...register("message", { required: "Please enter your message." })}
                />
                {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
              </div>

              {submitMessage.text && (
                <p
                  role={submitMessage.type === "error" ? "alert" : "status"}
                  className={`sm:col-span-2 text-sm ${
                    submitMessage.type === "success" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {submitMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              >
                <Send size={16} />
                {loading ? "Sending enquiry..." : "Send Enquiry"}
              </button>
              <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500 sm:col-span-2">
                <ShieldCheck size={14} /> Your information is used only to respond to your enquiry.
              </p>
            </form>
          </section>
        </div>

        <section aria-labelledby="location-heading" className="mt-12 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Find us</p>
            <h2 id="location-heading" className="mt-2 text-2xl font-black sm:text-3xl">
              Our Location
            </h2>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-300">
              <MapPin size={18} className="mt-1 shrink-0 text-primary" />
              {CONTACT_ADDRESS}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                CONTACT_ADDRESS,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
            >
              Get Directions <ArrowRight size={16} />
            </a>
          </div>
          <iframe
            title="Map to Dhiva E-Sevai Maiyam in Tirupattur"
            src={mapUrl}
            className="h-64 w-full rounded-2xl border border-primary/30 sm:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        <section className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Our promise</p>
          <h2 className="mt-2 text-2xl font-black">Why Contact DHIVA?</h2>
          <p className="mt-2 text-sm text-slate-400">
            We’re committed to providing the support you need for your digital service requests.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {contactBenefits.map(({ title, note, Icon }) => (
              <article
                key={title}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101419] p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon size={21} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">{note}</span>
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Need an answer?</p>
              <h2 className="mt-2 text-2xl font-black">Frequently Asked Questions</h2>
            </div>
            <span className="text-xs text-slate-400">Select a question to read the answer</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {faqs.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-xl border border-white/10 bg-[#101419] open:border-primary/40"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-sm font-medium text-slate-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/60 text-primary">
                    <Plus size={14} />
                  </span>
                  <span className="flex-1">{question}</span>
                  <Plus size={17} className="shrink-0 text-primary transition group-open:rotate-45" />
                </summary>
                <p className="border-t border-white/10 px-4 py-3 pl-[3.25rem] text-xs leading-5 text-slate-400">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </PageContainer>

      <section className="mt-12 bg-gradient-to-r from-orange-600 via-primary to-orange-500 py-8 text-[#100b06] sm:py-10">
        <PageContainer className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-2xl font-black sm:text-3xl">Need Assistance Today?</p>
            <p className="mt-1 text-sm font-medium">
              Contact DHIVA E-SEVAI MAIYAM for your government service needs.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={CONTACT_PHONE_HREF}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-black"
            >
              <Phone size={15} /> Call Now
            </a>
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-black"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                document.getElementById("location-heading")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-black"
            >
              <MapPin size={15} /> Visit Our Centre
            </button>
          </div>
        </PageContainer>
      </section>
    </main>
  );
};

export default ContactPage;
