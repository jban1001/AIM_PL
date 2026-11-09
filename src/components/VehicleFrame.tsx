import type { ReactNode } from "react";

export function VehicleFrame({ children }: { children: ReactNode }) {
  return (
    <section className="vehicle-frame" aria-label="차량 디스플레이">
      <div className="roadtown-panel">{children}</div>
    </section>
  );
}
