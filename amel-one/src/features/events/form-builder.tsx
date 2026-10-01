"use client";
import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Undo2,
  Redo2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/shared/form-control";
import type { EventField } from "./contracts";
function SortableField({
  field,
  index,
  count,
  onSelect,
  onMove,
  onRemove,
  selected,
}: {
  field: EventField;
  index: number;
  count: number;
  onSelect: () => void;
  onMove: (to: number) => void;
  onRemove: () => void;
  selected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });
  return (
    <article
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px,${transform.y}px,0)`
          : undefined,
        transition,
      }}
      className={"builder-field " + (selected ? "selected" : "")}
    >
      <div className="field-top">
        <button
          type="button"
          className="icon-button drag-handle"
          aria-label={"Drag " + field.label}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>
        <button className="field-select" type="button" onClick={onSelect}>
          {field.label || "Untitled field"}
          {field.required && " *"}
          <small>{field.type}</small>
        </button>
      </div>
      <div className="field-actions">
        <Button
          size="sm"
          variant="ghost"
          type="button"
          aria-label={"Move " + field.label + " up"}
          disabled={index === 0}
          onClick={() => onMove(index - 1)}
        >
          <ArrowUp size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          aria-label={"Move " + field.label + " down"}
          disabled={index === count - 1}
          onClick={() => onMove(index + 1)}
        >
          <ArrowDown size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          aria-label={"Remove " + field.label}
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </article>
  );
}
export function FormBuilder({
  fields,
  onChange,
}: {
  fields: EventField[];
  onChange: (fields: EventField[]) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [past, setPast] = useState<EventField[][]>([]);
  const [future, setFuture] = useState<EventField[][]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function change(next: EventField[]) {
    setPast([...past.slice(-49), fields]);
    setFuture([]);
    onChange(next);
  }
  function undo() {
    const next = past.at(-1);
    if (next) {
      setPast(past.slice(0, -1));
      setFuture([...future, fields]);
      onChange(next);
    }
  }
  function redo() {
    const next = future.at(-1);
    if (next) {
      setFuture(future.slice(0, -1));
      setPast([...past, fields]);
      onChange(next);
    }
  }
  const active = fields.find((f) => f.id === selected);
  function patch(update: Partial<EventField>) {
    change(fields.map((f) => (f.id === selected ? { ...f, ...update } : f)));
  }
  return (
    <section
      onKeyDown={(e) => {
        if (
          (e.ctrlKey || e.metaKey) &&
          e.key.toLowerCase() === "z" &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        }
      }}
    >
      <div className="row-heading">
        <div>
          <h2>Ask the right questions.</h2>
          <p>Name and email are always included.</p>
        </div>
        <div className="button-row">
          <Button
            type="button"
            variant="outline"
            onClick={undo}
            disabled={!past.length}
          >
            <Undo2 size={16} />
            Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={redo}
            disabled={!future.length}
          >
            <Redo2 size={16} />
            Redo
          </Button>
        </div>
      </div>
      <div className="builder-grid">
        <aside className="panel field-palette">
          <h3>Add a field</h3>
          {(
            ["text", "email", "tel", "textarea", "select", "checkbox"] as const
          ).map((type) => (
            <Button
              type="button"
              variant="outline"
              key={type}
              disabled={fields.length >= 30}
              onClick={() => {
                const id = crypto.randomUUID();
                change([
                  ...fields,
                  {
                    id,
                    type,
                    label:
                      type === "checkbox"
                        ? "I agree"
                        : "New " + type + " field",
                    required: false,
                    help: "",
                    options: type === "select" ? ["Option 1", "Option 2"] : [],
                  },
                ]);
                setSelected(id);
              }}
            >
              <Plus size={15} />
              {type === "tel"
                ? "Phone"
                : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
          <small>{fields.length}/30 custom fields</small>
        </aside>
        <div className="panel builder-canvas">
          <div className="fixed-fields">
            <strong>Full name *</strong>
            <span>Email address *</span>
            <small>Required identity fields</small>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (over && active.id !== over.id)
                change(
                  arrayMove(
                    fields,
                    fields.findIndex((f) => f.id === active.id),
                    fields.findIndex((f) => f.id === over.id),
                  ),
                );
            }}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((f, i) => (
                <SortableField
                  key={f.id}
                  field={f}
                  index={i}
                  count={fields.length}
                  selected={selected === f.id}
                  onSelect={() => setSelected(f.id)}
                  onMove={(to) => change(arrayMove(fields, i, to))}
                  onRemove={() => {
                    change(fields.filter((x) => x.id !== f.id));
                    setSelected(null);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
          {!fields.length && (
            <div className="empty-state">
              <h3>Keep it simple, or make it yours.</h3>
              <p>
                Add a question from the field list. Name and email are ready.
              </p>
            </div>
          )}
        </div>
        <aside className="panel field-properties">
          <h3>Field settings</h3>
          {active ? (
            <div className="form-stack">
              <FormControl label="Field label">
                <input
                  value={active.label}
                  maxLength={120}
                  onChange={(e) => patch({ label: e.target.value })}
                />
              </FormControl>
              <FormControl label="Help text">
                <textarea
                  value={active.help}
                  maxLength={250}
                  onChange={(e) => patch({ help: e.target.value })}
                />
              </FormControl>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={active.required}
                  onChange={(e) => patch({ required: e.target.checked })}
                />
                Required answer
              </label>
              {active.type === "select" && (
                <FormControl
                  label="Options"
                  hint="One option per line, up to 20."
                >
                  <textarea
                    value={active.options.join("\n")}
                    onChange={(e) =>
                      patch({ options: e.target.value.split("\n") })
                    }
                  />
                </FormControl>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelected(null)}
              >
                Done
              </Button>
            </div>
          ) : (
            <p>
              Select a question on the canvas to edit its label and settings.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
