import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Componets/CommonComponents/Navbar";
import Header from "./Componets/CommonComponents/Header";
import Footer from "./Componets/CommonComponents/Footer";

import ScrollToTop from "./Componets/CommonComponents/ScrollToTop";
import ScrollNavigator from "./Componets/CommonComponents/ScrollNavigator";
import Loader from "./Componets/CommonComponents/Loader";
import FloatingSupport from "./Componets/CommonComponents/FloatingSupport";
import PageHeader from "./Componets/CommonComponents/PageHeader";
import { CONTACT_PHONE_HREF, CONTACT_WHATSAPP_NUMBER } from "./contactInfo";

const pageHeaders = {
  "/service": {
    title: "Our Services",
    description: "Explore government applications, certificates, document services and more.",
    actions: [
      { label: "Documents Required", to: "/documents" },
      { label: "Contact Us", to: "/contact", variant: "secondary" },
    ],
  },
  "/documents": {
    title: "Documents Required",
    description: "Find the documents needed for government services and prepare for your application.",
    actions: [
      { label: "View Services", to: "/service" },
      { label: "Contact Us", to: "/contact", variant: "secondary" },
    ],
  },
  "/track": {
    title: "Track Application",
    description: "Check the latest available update for your government service application.",
    actions: [
      { label: "Our Services", to: "/service" },
      { label: "Get Support", to: "/contact", variant: "secondary" },
    ],
  },
  "/about": {
    title: "About Us",
    description: "Learn how DHIVA E-SEVAI MAIYAM helps make government services more accessible.",
    actions: [
      { label: "Our Services", to: "/service" },
      { label: "Contact Us", to: "/contact", variant: "secondary" },
    ],
  },
  "/gallery": {
    title: "Gallery",
    description: "Take a look at our service centre, customer support and community services.",
    actions: [
      { label: "Explore Services", to: "/service" },
      { label: "Contact Us", to: "/contact", variant: "secondary" },
    ],
  },
  "/contact": {
    title: "Contact Us",
    description: "Have questions about certificates, applications or documents? Our team is ready to help.",
    actions: [
      { label: "Call Us", href: CONTACT_PHONE_HREF },
      {
        label: "WhatsApp",
        href: `https://wa.me/${CONTACT_WHATSAPP_NUMBER}`,
        variant: "secondary",
      },
    ],
  },
};

function App() {
  const [loading] = useState(false);
  const { pathname, hash } = useLocation();
  const currentRoute = hash?.startsWith("#") ? hash.slice(1) : pathname;
  const isAuthPage = currentRoute === "/login" || currentRoute === "/register";
  const isAdmin = currentRoute === "/admin" || currentRoute.startsWith("/admin/");
  const isEmployee = currentRoute === "/employee" || currentRoute.startsWith("/employee/");
  const isGallery = currentRoute === "/gallery";
  const showPublicChrome = !isAuthPage && !isAdmin && !isEmployee;

  if (loading) {
    return <Loader />;
  }

  return (
    <section>
      {showPublicChrome && <Header />}
      {showPublicChrome && <Navbar />}
      {showPublicChrome && pageHeaders[currentRoute] && (
        <PageHeader {...pageHeaders[currentRoute]} />
      )}
      <ScrollToTop/>
      {!isGallery && <ScrollNavigator/>}
      <Outlet />
      {!isAdmin && !isGallery && <FloatingSupport />}
      {showPublicChrome && <Footer />}
    </section>
  );
}

export default App;