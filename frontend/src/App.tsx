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
      setError("");
    } catch (e) {
      setError(errMsg(e));
    }
  }

  useEffect(() => {
    load();
    api.health().then(() => setHealth("ok")).catch(() => setHealth("sin conexion"));
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

  return (
    <main>
      <h1>Registro de Equipos Mineros</h1>
      <p className="muted">API: {health}</p>
      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <input
          placeholder="Codigo (ej. CAM-001)"
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
              {t.name} (cada {t.intervalHours} h)
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="Horometro (h)"
          value={form.hourMeter}
          onChange={(e) => setForm({ ...form, hourMeter: e.target.value })}
          required
        />
        <button type="submit">{editingId ? "Guardar cambios" : "Crear equipo"}</button>
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

      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Tipo</th>
            <th>Horometro</th>
            <th>Desde ultimo mant.</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.code}</td>
              <td>{eq.type}</td>
              <td>{eq.hourMeter} h</td>
              <td>
                {eq.hoursSinceMaintenance} / {eq.intervalHours} h
              </td>
              <td>
                <span className={eq.requiresMaintenance ? "badge red" : "badge green"}>
                  {eq.status}
                </span>
              </td>
              <td className="actions">
                <button onClick={() => maintain(eq)}>Registrar mantenimiento</button>
                <button onClick={() => showHistory(eq.id)}>Historial</button>
                <button onClick={() => startEdit(eq)}>Editar</button>
                <button onClick={() => remove(eq)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {equipment.length === 0 && (
            <tr>
              <td colSpan={6} className="muted">
                Sin equipos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {historyFor && (
        <section>
          <h2>Historial de mantenimiento</h2>
          {history.length === 0 ? (
            <p className="muted">Sin mantenimientos registrados</p>
          ) : (
            <ul>
              {history.map((h) => (
                <li key={h.id}>
                  {new Date(h.performedAt).toLocaleString()} - a las {h.hourMeterAtService} h
                  {h.notes ? ` - ${h.notes}` : ""}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => setHistoryFor(null)}>Cerrar</button>
        </section>
      )}
    </main>
  );
}