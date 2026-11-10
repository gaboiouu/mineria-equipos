import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "./api";
import type { Equipment, EquipmentType, MaintenanceRecord } from "./api";

interface FormState {
  code: string;
  typeId: string;
  hourMeter: string;
}

const EMPTY: FormState = { code: "", typeId: "", hourMeter: "" };

const TYPE_LABEL: Record<string, string> = {
  camion: "Camión",
  excavadora: "Excavadora",
  perforadora: "Perforadora",
};
const typeLabel = (name: string) => TYPE_LABEL[name] ?? name;

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Error desconocido");

export default function App() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [health, setHealth] = useState("comprobando...");
  const [historyFor, setHistoryFor] = useState<number | null>(null);
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);

  async function load() {
    try {
      const [list, t] = await Promise.all([api.list(), api.types()]);
      setEquipment(list.data);
      setTypes(t);
      setHealth("ok");
      setError("");
    } catch (e) {
      setHealth("sin conexion");
      setError(errMsg(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = {
      code: form.code,
      typeId: Number(form.typeId),
      hourMeter: Number(form.hourMeter),
    };
    try {
      if (editingId) await api.update(editingId, body);
      else await api.create(body);
      setForm(EMPTY);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  function startEdit(eq: Equipment) {
    setEditingId(eq.id);
    setForm({ code: eq.code, typeId: String(eq.typeId), hourMeter: String(eq.hourMeter) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(eq: Equipment) {
    if (!confirm(`Eliminar ${eq.code}?`)) return;
    try {
      await api.remove(eq.id);
      await load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  async function showHistory(id: number) {
    try {
      setHistory(await api.history(id));
      setHistoryFor(id);
    } catch (err) {
      setError(errMsg(err));
    }
  }

  async function maintain(eq: Equipment) {
    const notes = prompt("Notas del mantenimiento (opcional):") ?? undefined;
    try {
      await api.registerMaintenance(eq.id, notes || undefined);
      await load();
      if (historyFor === eq.id) await showHistory(eq.id);
    } catch (err) {
      setError(errMsg(err));
    }
  }

  const needing = equipment.filter((e) => e.requiresMaintenance).length;
  const historyCode = equipment.find((e) => e.id === historyFor)?.code;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <h1>Control de Equipos Mineros</h1>
          <span className="api-status">
            <span className={`dot ${health === "ok" ? "on" : health === "sin conexion" ? "off" : ""}`} />
            API: {health}
          </span>
        </div>
      </header>

      <main>
        <section className="stats">
          <div className="stat">
            <span>Equipos</span>
            <strong>{equipment.length}</strong>
          </div>
          <div className="stat">
            <span>Operativos</span>
            <strong>{equipment.length - needing}</strong>
          </div>
          <div className={`stat ${needing > 0 ? "alert" : ""}`}>
            <span>Requieren mantenimiento</span>
            <strong>{needing}</strong>
          </div>
        </section>

        {error && <p className="error">{error}</p>}

        <section className="card">
          <h2>{editingId ? "Editar equipo" : "Nuevo equipo"}</h2>
          <form onSubmit={submit}>
            <input
              placeholder="Código (ej. CAM-001)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
            <select
              value={form.typeId}
              onChange={(e) => setForm({ ...form, typeId: e.target.value })}
              required
            >
              <option value="">Tipo...</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {typeLabel(t.name)} (cada {t.intervalHours} h)
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Horómetro (h)"
              value={form.hourMeter}
              onChange={(e) => setForm({ ...form, hourMeter: e.target.value })}
              required
            />
            <button type="submit" className="primary">
              {editingId ? "Guardar cambios" : "Crear equipo"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                }}
              >
                Cancelar
              </button>
            )}
          </form>
        </section>

        <section className="card">
          <h2>Equipos</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Horómetro</th>
                  <th>Desde último mant.</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((eq) => {
                  const pct = Math.min(100, (eq.hoursSinceMaintenance / eq.intervalHours) * 100);
                  const level = pct >= 100 ? "full" : pct >= 80 ? "high" : "";
                  return (
                    <tr key={eq.id} className={eq.requiresMaintenance ? "needs" : ""}>
                      <td className="code">{eq.code}</td>
                      <td>{typeLabel(eq.type)}</td>
                      <td>{eq.hourMeter} h</td>
                      <td>
                        {eq.hoursSinceMaintenance} / {eq.intervalHours} h
                        <div className="progress">
                          <div className={level} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td>
                        <span className={eq.requiresMaintenance ? "badge red" : "badge green"}>
                          {eq.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="primary" onClick={() => maintain(eq)}>
                            Registrar mantenimiento
                          </button>
                          <button onClick={() => showHistory(eq.id)}>Historial</button>
                          <button onClick={() => startEdit(eq)}>Editar</button>
                          <button className="danger" onClick={() => remove(eq)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {equipment.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      Sin equipos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {historyFor && (
          <section className="card">
            <h2>Historial de mantenimiento{historyCode ? ` · ${historyCode}` : ""}</h2>
            {history.length === 0 ? (
              <p className="muted">Sin mantenimientos registrados</p>
            ) : (
              <ul className="history">
                {history.map((h) => (
                  <li key={h.id}>
                    {new Date(h.performedAt).toLocaleString()} · a las {h.hourMeterAtService} h
                    {h.notes ? ` · ${h.notes}` : ""}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setHistoryFor(null)}>Cerrar</button>
          </section>
        )}
      </main>
    </>
  );
}