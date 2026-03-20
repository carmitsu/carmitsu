import Navigation from "@/components/navbar";
import Footer from "@/components/footer";

export default async function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center h-dvh">
      <div className="absolute top-0 w-full">
        <Navigation />
      </div>
      <h1 className="text-7xl md:text-9xl font-bold">404</h1>
      <p className="text-lg md:text-xl">Strona nie znaleziona</p>
      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </main>
  );
}
