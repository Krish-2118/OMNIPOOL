import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import type { HardwareItem } from "../../store/useStore";
import { createRequest } from "../../api/client";

interface RequestPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: HardwareItem | null;
  onSuccess: (request: { _id: string }) => void;
}

const RequestPartsModal: React.FC<RequestPartsModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setMessage("");
      setQuantity("1");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setError("");

    if (!message.trim()) {
      setError("Please provide a short message for the owner.");
      return;
    }

    const numericQuantity = Number(quantity);
    const safeQuantity = Math.max(
      1,
      Math.min(
        Number.isFinite(numericQuantity) ? numericQuantity : 1,
        selectedItem.quantity || 1,
      ),
    );

    setIsLoading(true);
    try {
      const { data } = await createRequest({
        hardware_id: selectedItem._id,
        quantity_requested: safeQuantity,
        message: message.trim(),
      });
      onSuccess(data.data.request);
      onClose();
      setMessage("");
      setQuantity("1");
    } catch (error) {
      console.error("Failed to create request:", error);
      setError(
        (error as any)?.response?.data?.error ||
          "Failed to create request. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Hardware Parts"
      size="md"
    >
      {selectedItem ? (
        <div className="mb-6 bg-bg-secondary p-4 rounded-xl border border-border-default flex gap-4">
          <div className="w-16 h-16 rounded-lg bg-bg-tertiary flex items-center justify-center shrink-0">
            {selectedItem.image_url ? (
              <img
                src={selectedItem.image_url}
                alt={selectedItem.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <svg
                className="w-8 h-8 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              {selectedItem.name}
            </h3>
            <p className="text-sm text-text-muted capitalize">
              {selectedItem.category}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded ${selectedItem.owner_type === "enterprise" ? "bg-accent-indigo/10 text-accent-indigo" : "bg-accent-emerald/10 text-accent-emerald"}`}
              >
                {selectedItem.owner_type || "community"}
              </span>
              <span className="text-xs text-text-secondary">
                Max available: {selectedItem.quantity || 1}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 text-center text-accent-amber bg-accent-amber/10 rounded-xl border border-accent-amber/20">
          Please select a hardware item from the network first.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/10 px-4 py-3 text-sm text-accent-rose">
            {error}
          </div>
        ) : null}

        <Input
          label="Quantity Requested"
          type="number"
          min="1"
          max={selectedItem?.quantity || 1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={!selectedItem}
          required
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Initial Message to Owner
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain what you need it for, how long you'll need it, or ask any questions..."
            className="w-full h-24 bg-bg-tertiary border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-indigo transition-all resize-none"
            disabled={!selectedItem}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!selectedItem}
          >
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestPartsModal;
