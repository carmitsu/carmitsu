import Navigation from "@/components/navbar";
import Footer from "@/components/footer";
import AllRealizations from "@/components/realizations/allRealizations";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Realizacje",
};

export default function Page() {
  return (
    <main>
      <Navigation />
      <AllRealizations />
      <Footer />
    </main>
  );
}
