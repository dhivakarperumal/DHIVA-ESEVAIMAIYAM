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

const pageHeaders = {
  "/": {
    title: "Home",
    description: "Government services, applications and document support — all in one place.",
    background: "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png",
  },
  "/service": {
    title: "Our Services",
    description: "Explore government applications, certificates, document services and more.",
    background: "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png",
  },
  "/documents": {
    title: "Documents Required",
    description: "Find the documents needed for government services and prepare for your application.",
    background: "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png",
  },
  "/track": {
    title: "Track Application",
    description: "Check the latest available update for your government service application.",
    background: "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png",
  },
  "/about": {
    title: "About Us",
    description: "Learn how DHIVA E-SEVAI MAIYAM helps make government services more accessible.",
    background: "/Hero/Modern%20DHIVA%20E-Sevai%20Reception%20Center.png",
  },
  "/gallery": {
    title: "Gallery",
    description: "Take a look at our service centre, customer support and community services.",
    background: "/Hero/DHIVA%20E-Sevai%20Modern%20Service%20Center.png",
  },
  "/contact": {
    title: "Contact Us",
    description: "Have questions about certificates, applications or documents? Our team is ready to help.",
    background: "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png",
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