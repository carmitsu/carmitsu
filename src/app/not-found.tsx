import Navigation from "@/components/navbar";
import Footer from "@/components/footer";
import {getLanguage} from "@/utils/language";

export default async function NotFound() {
  const data = await getLanguage();

  return (
    <main className="flex flex-col items-center justify-center h-dvh">
      <div className="absolute top-0 w-full">
        <Navigation navbar={data.navbar} language={data.language}/>
      </div>
      <h1 className="text-7xl md:text-9xl font-bold">404</h1>
      <p className="text-lg md:text-xl">{data["404"]}</p>
      <div className="absolute bottom-0 w-full">
        <Footer footer={data.footer}/>
      </div>
    </main>
  );
}