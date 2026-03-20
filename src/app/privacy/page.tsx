import Navigation from "@/components/navbar";
import Privacy from "@/components/privacy"
import Footer from "@/components/footer";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności",
};

export default async function Page() {
  return (
    <main>
      <Navigation />
      <Privacy/>
      <Footer />
    </main>
  );
}
