import Link from "next/link";
import Image from "next/image";
import type { Entity } from "@/lib/entities";

interface EntityCardProps { entity: Entity }

export default function EntityCard({ entity }: EntityCardProps) {
  return (
    <Link
      href={`/entity/${entity.id}`}
      className="group block rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        <Image src={entity.imageUrl} alt={entity.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{entity.name}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{entity.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entity.tags.map((tag) => (
            <span key={tag} className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">核实于 {entity.lastConfirmedDate}</p>
      </div>
    </Link>
  );
}