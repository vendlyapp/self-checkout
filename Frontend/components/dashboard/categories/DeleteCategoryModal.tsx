"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Trash2 } from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  categoryName: string;
  categoryId: string;
  productCount?: number;
  otherCategories?: CategoryOption[];
  onClose: () => void;
  onConfirm: (moveProductsToCategoryId?: string) => void;
  isLoading?: boolean;
}

export default function DeleteCategoryModal({
  isOpen,
  categoryName,
  categoryId,
  productCount = 0,
  otherCategories = [],
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteCategoryModalProps) {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  const hasProducts = productCount > 0;
  const targetCategories = otherCategories.filter((c) => c.id !== categoryId);
  const canConfirm = !hasProducts || (hasProducts && selectedTargetId.trim() !== "");

  const handleConfirm = () => {
    if (!canConfirm || isLoading) return;
    onConfirm(hasProducts ? selectedTargetId : undefined);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedTargetId("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let container = document.getElementById("global-modals-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "global-modals-container";
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.pointerEvents = "none";
        container.style.zIndex = "99999";
        document.body.appendChild(container);
      }
      setModalContainer(container);
    }
  }, []);

  if (!isOpen || !modalContainer) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Kategorie löschen</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
            aria-label="Schliessen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-2">
            Sind Sie sicher, dass Sie die Kategorie{" "}
            <span className="font-semibold text-gray-900">&quot;{categoryName}&quot;</span>{" "}
            löschen möchten?
          </p>

          {hasProducts ? (
            <>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 mb-4">
                Diese Kategorie hat <strong>{productCount}</strong>{" "}
                {productCount === 1 ? "Produkt" : "Produkte"}. Bitte wählen Sie die Kategorie aus, in
                die die Produkte verschoben werden sollen.
              </p>
              {targetCategories.length === 0 ? (
                <p className="text-sm text-red-600 mb-4">
                  Es gibt keine andere Kategorie. Erstellen Sie zuerst eine weitere Kategorie, um
                  diese löschen zu können.
                </p>
              ) : (
                <label className="block mb-4">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Zielkategorie für die Produkte
                  </span>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                    disabled={isLoading}
                    aria-label="Zielkategorie auswählen"
                  >
                    <option value="">— Bitte wählen —</option>
                    {targetCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || isLoading || (hasProducts && targetCategories.length === 0)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Wird gelöscht...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Löschen
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalContainer);
}
