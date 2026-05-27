import type { PersonaSeed } from "../LaunchData";
import { PersonaCard } from "./PersonaCard";

interface PersonaGridProps {
  personas: readonly PersonaSeed[];
}

export function PersonaGrid({ personas }: PersonaGridProps) {
  return (
    <div className="w-full max-w-2xl grid grid-cols-2 gap-5">
      {personas.map((p) => (
        <PersonaCard key={p.persona} data={p} />
      ))}
    </div>
  );
}
