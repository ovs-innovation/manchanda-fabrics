import React, { useMemo, useState } from "react";
import { Button, Input, Select } from "@windmill/react-ui";
import { FiEdit2, FiPlus, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";

import SettingServices from "@/services/SettingServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { mergeProductTypes } from "@/lib/product-types";
import { notifyError, notifySuccess } from "@/utils/toast";

const ProductTypePicker = ({ value = "", onChange, error }) => {
  const queryClient = useQueryClient();
  const { globalSetting } = useUtilsFunction();
  const [newType, setNewType] = useState("");
  const [managing, setManaging] = useState(false);
  const [editingType, setEditingType] = useState("");
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const types = useMemo(
    () => mergeProductTypes(globalSetting?.productTypes, value),
    [globalSetting?.productTypes, value]
  );

  const persistTypes = async (nextTypes, selected = value) => {
    setSaving(true);
    try {
      await SettingServices.updateGlobalSetting({
        setting: { productTypes: nextTypes },
      });
      await queryClient.invalidateQueries({ queryKey: ["globalSetting"] });
      if (selected) onChange(selected);
      notifySuccess("Product types updated");
    } catch (err) {
      notifyError(err?.response?.data?.message || "Could not save product types");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const name = newType.trim();
    if (!name) return notifyError("Enter a type name");
    if (types.includes(name)) {
      onChange(name);
      setNewType("");
      return;
    }
    const next = [...types, name];
    setNewType("");
    onChange(name);
    await persistTypes(next, name);
  };

  const startEdit = (type) => {
    setEditingType(type);
    setEditValue(type);
  };

  const handleRename = async () => {
    const name = editValue.trim();
    if (!name) return notifyError("Type name cannot be empty");
    if (name !== editingType && types.includes(name)) {
      return notifyError("This type already exists");
    }
    const next = types.map((t) => (t === editingType ? name : t));
    const nextSelected = value === editingType ? name : value;
    setEditingType("");
    setEditValue("");
    await persistTypes(next, nextSelected);
  };

  const handleDelete = async (name) => {
    if (types.length <= 1) return notifyError("Keep at least one product type");
    const next = types.filter((t) => t !== name);
    const nextSelected = value === name ? next[0] || "" : value;
    await persistTypes(next, nextSelected);
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-800 dark:text-white">Product Type</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select a type or create a new one. You can edit the list anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
            Type *
          </label>
          <Select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={saving}
          >
            <option value="">Choose type</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
            New type
          </label>
          <Input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="e.g. Sharara Sets"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4"
          >
            <FiPlus className="mr-1" /> Add
          </Button>
          <Button
            type="button"
            layout="outline"
            onClick={() => {
              setManaging((v) => !v);
              setEditingType("");
              setEditValue("");
            }}
            className="h-10 px-4"
          >
            <FiEdit2 className="mr-1" /> {managing ? "Done" : "Edit list"}
          </Button>
        </div>
      </div>

      {managing && (
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-2 bg-gray-50 dark:bg-gray-900/40">
          {types.map((type) => (
            <div key={type} className="flex items-center gap-2">
              {editingType === type ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleRename();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRename}
                    className="p-2 text-emerald-600"
                    disabled={saving}
                  >
                    <FiCheck />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingType("");
                      setEditValue("");
                    }}
                    className="p-2 text-gray-400"
                  >
                    <FiX />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{type}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(type)}
                    className="p-2 text-gray-500 hover:text-emerald-600"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(type)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    disabled={saving}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductTypePicker;
