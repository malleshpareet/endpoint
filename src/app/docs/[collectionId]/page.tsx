import { getCollectionForDocs } from "@/modules/collections/actions";
import { notFound } from "next/navigation";
import DocsContent from "./docs-content";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ collectionId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const collection = await getCollectionForDocs(resolvedParams.collectionId);
  if (!collection) {
    return {
      title: "Docs Not Found",
    };
  }
  return {
    title: `${collection.name} - API Documentation`,
    description: `API Documentation for ${collection.name}`,
  };
}

export default async function DocsPage({ params }: { params: Promise<{ collectionId: string }> }) {
  const resolvedParams = await params;
  const collection = await getCollectionForDocs(resolvedParams.collectionId);

  if (!collection) {
    notFound();
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden font-sans">
      <DocsContent collection={collection} />
    </div>
  );
}
