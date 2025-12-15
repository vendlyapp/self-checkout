"use client";

import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  categoryName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteCategoryModal({
  isOpen,
  categoryName,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteCategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Kategorie löschen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Sind Sie sicher, dass Sie die Kategorie{" "}
            <span className="font-semibold text-gray-900">&quot;{categoryName}&quot;</span>{" "}
            löschen möchten?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Diese Aktion kann nicht rückgängig gemacht werden. Alle Produkte in
            dieser Kategorie bleiben erhalten, verlieren aber ihre Kategoriezuordnung.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
}

