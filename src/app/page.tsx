'use server';
import Navigation from "@/components/navbar";
import {getLanguage} from "@/utils/language";

export default async function Home() {
  const data = await getLanguage();

  return (
    <main>
      <Navigation navbar={data.navbar} language={data.language}/>
      <div className="h-dvh bg-blue-600"></div>
      <div className="h-dvh bg-red-600"></div>
    </main>
  );
}
