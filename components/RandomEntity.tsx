"use client";
import { useState } from "react";
import EntityCard from "./EntityCard";
import type { Entity } from "@/lib/entities";

interface RandomEntityProps { entities: Entity[] }

export default function RandomEntity({ entities }: RandomEntityProps) {
  const [randomEntity, setRandomEntity] = useState<Entity | null>(null);
  const pickRandom = () => {
    if (entities.length === 0) return;
    setRandomEntity(entities[Math.floor(Math.random() * entities.length)]);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🎲 随机推荐</h2>
        <button onClick={pickRandom} className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
          {randomEntity ? "再换一个" : "点我试试"}
        </button>
      </div>
      {randomEntity ? <EntityCard entity={randomEntity} /> : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">点击按钮，让运气帮你做决定 🍀</div>
      )}
    </div>
  );
}