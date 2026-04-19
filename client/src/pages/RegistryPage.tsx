import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import type { HardwareItem } from "../store/useStore";
import {
  getHardware,
  createHardware,
  deleteHardware,
  updateHardware,
} from "../api/client";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import RobuInspiredHardwareForm from "../components/hardware/RobuInspiredHardwareForm";
import RequestPartsModal from "../components/hardware/RequestPartsModal";

// --- SHARED DATA ---

// Remove DUMMY_RESOURCES, we will use real hardware data

const RegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my_hardware" | "community">(
    "community",
  );

  const { myHardware, setMyHardware, user } = useStore();
  const isEnterpriseApproved =
    user?.account_type === "enterprise" &&
    user?.enterprise_status === "accepted";

  // Community Resources State
  const [filter, setFilter] = useState<"all" | "community" | "enterprise">(
    "all",
  );
  const [communityHardware, setCommunityHardware] = useState<HardwareItem[]>(
    [],
  );
  const filteredResources = communityHardware.filter(
    (r: HardwareItem) => filter === "all" || r.owner_type === filter,
  );

  // My Hardware State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingHardware, setEditingHardware] = useState<HardwareItem | null>(
    null,
  );
  const [selectedHardware, setSelectedHardware] = useState<HardwareItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sub-tabs for My Inventory
  const [myInventoryTab, setMyInventoryTab] = useState<
    "community" | "enterprise"
  >("community");

  const getOwnerDisplayName = (item: HardwareItem) => {
    if (
      item.owner_type === "enterprise" &&
      item.owner_id &&
      typeof item.owner_id === "object"
    ) {
      return item.owner_id.company_name || item.owner_id.name || "Enterprise";
    }

    if (item.owner_id && typeof item.owner_id === "object") {
      return item.owner_id.name || "Unknown User";
    }

    return "Unknown User";
  };

  const getSpecEntries = (specs: HardwareItem["specs"]) => {
    if (!specs) return [];

    if (specs instanceof Map) {
      return Array.from(specs.entries()).filter(([, value]) =>
        Boolean(String(value).trim()),
      );
    }

    return Object.entries(specs as Record<string, string>).filter(([, value]) =>
      Boolean(String(value).trim()),
    );
  };

  const getSortedSpecEntries = (specs: HardwareItem["specs"]) => {
    const priorityKeys = [
      "type",
      "model",
      "part number",
      "resistance",
      "voltage",
      "current",
      "power",
      "clock speed",
      "flash memory",
      "sram",
    ];

    const getPriority = (key: string) => {
      const normalized = key.toLowerCase().trim();
      const index = priorityKeys.indexOf(normalized);
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };

    return [...getSpecEntries(specs)].sort((a, b) => {
      const priorityA = getPriority(a[0]);
      const priorityB = getPriority(b[0]);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a[0].localeCompare(b[0]);
    });
  };

  const categoryFromApiToForm: Record<string, string> = {
    microcontrollers: "Microcontrollers",
    development_boards: "Development Boards",
    sensors: "Sensors",
    actuators: "Actuators",
    passive_components: "Passive Components",
    active_ics: "Active ICs",
    displays: "Displays",
    cables_connectors: "Cables & Connectors",
    power_supply: "Power Supply",
    tools: "Tools",
    other: "Other",
  };

  const categoryFromFormToApi: Record<string, string> = {
    Microcontrollers: "microcontrollers",
    "Development Boards": "development_boards",
    Sensors: "sensors",
    Actuators: "actuators",
    "Passive Components": "passive_components",
    "Active ICs": "active_ics",
    Displays: "displays",
    "Cables & Connectors": "cables_connectors",
    "Power Supply": "power_supply",
    Tools: "tools",
    Other: "other",
  };

  const normalizeSpecsForForm = (specs: HardwareItem["specs"]) => {
    if (!specs) return {};
    if (specs instanceof Map) return Object.fromEntries(specs.entries());
    return { ...(specs as Record<string, string>) };
  };

  const getFormInitialValues = (item: HardwareItem | null) => {
    if (!item) return undefined;

    const formCategory = categoryFromApiToForm[item.category] || "Other";

    return {
      name: item.name || "",
      brand: item.brand || "",
      category: formCategory,
      sub_category: item.sub_category || "Others",
      condition: (item.condition || "new") as "new" | "used" | "refurbished",
      quantity: String(item.quantity || 1),
      owner_type: (item.owner_type || "community") as
        | "community"
        | "enterprise",
      description: item.description || "",
      image_url: item.image_url || "",
      specs: normalizeSpecsForForm(item.specs),
    };
  };

  useEffect(() => {
    fetchHardware();
  }, []);

  useEffect(() => {
    if (!isEnterpriseApproved && myInventoryTab === "enterprise") {
      setMyInventoryTab("community");
    }
  }, [isEnterpriseApproved, myInventoryTab]);

  const fetchHardware = async () => {
    try {
      const { data } = await getHardware();
      // Split into my hardware vs community hardware
      if (user) {
        const mine = data.data.filter(
          (item: HardwareItem) =>
            (item.owner_id &&
            typeof item.owner_id === "object" &&
            "_id" in item.owner_id
              ? item.owner_id._id
              : item.owner_id) === user._id,
        );
        const others = data.data.filter(
          (item: HardwareItem) =>
            (item.owner_id &&
            typeof item.owner_id === "object" &&
            "_id" in item.owner_id
              ? item.owner_id._id
              : item.owner_id) !== user._id &&
            item.availability_status === "available",
        );
        setMyHardware(mine);
        setCommunityHardware(others);
      } else {
        setCommunityHardware(
          data.data.filter(
            (i: HardwareItem) => i.availability_status === "available",
          ),
        );
      }
    } catch (error) {
      console.error("Failed to fetch hardware:", error);
    }
  };

  const handleSubmit = async (payload: any) => {
    setIsLoading(true);
    try {
      const safeOwnerType =
        isEnterpriseApproved && payload.owner_type === "enterprise"
          ? "enterprise"
          : "community";

      const normalizedPayload = {
        ...payload,
        category: categoryFromFormToApi[payload.category] || payload.category,
        owner_type: safeOwnerType,
      };

      if (editingHardware) {
        await updateHardware(editingHardware._id, normalizedPayload);
      } else {
        await createHardware(normalizedPayload);
      }

      await fetchHardware();
      setEditingHardware(null);
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Failed to save hardware:", error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.messages?.[0] ||
          "Failed to save hardware.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (item: HardwareItem) => {
    setEditingHardware(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHardware(id);
      await fetchHardware();
    } catch (error) {
      console.error("Failed to delete hardware:", error);
    }
  };

  const handleToggleAvailability = async (item: HardwareItem) => {
    const nextStatus =
      item.availability_status === "available" ? "in-use" : "available";
    try {
      await updateHardware(item._id, { availability_status: nextStatus });
      await fetchHardware();
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Hardware <span className="gradient-text">Registry</span>
            </h1>
            <p className="text-text-secondary">
              Discover community components or manage your own electronics
              sharing portfolio.
            </p>
          </div>
          <div className="flex bg-bg-secondary border border-border-default rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveTab("community")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "community"
                  ? "bg-bg-card shadow-sm text-text-primary border border-border-default"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Hardware Network
            </button>
            <button
              onClick={() => setActiveTab("my_hardware")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "my_hardware"
                  ? "bg-bg-card shadow-sm text-text-primary border border-border-default"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              My Inventory
            </button>
          </div>
        </div>

        {/* --- VIEW: COMMUNITY RESOURCES --- */}
        {activeTab === "community" && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="space-y-2">
                <div className="flex bg-bg-secondary/50 p-1 rounded-lg border border-border-default">
                  {(["all", "community", "enterprise"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        filter === f
                          ? "bg-bg-glass text-text-primary border border-border-default"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted max-w-xl">
                  This section is your browse-and-request console. Use it to
                  inspect the network supply without touching your own
                  inventory.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((item: HardwareItem) => {
                const specEntries = getSortedSpecEntries(item.specs);
                const visibleSpecs = specEntries.slice(0, 6);

                return (
                  <div
                    key={item._id}
                    className="glass-card p-6 flex flex-col h-full hover:shadow-glow-sm transition-all border border-border-default/50"
                  >
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <span
                        className={`text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full font-semibold ${
                          item.owner_type === "enterprise"
                            ? "bg-accent-indigo/10 text-accent-indigo"
                            : "bg-accent-emerald/10 text-accent-emerald"
                        }`}
                      >
                        {item.owner_type || "community"}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                          (item.quantity || 1) < 5
                            ? "bg-accent-amber/10 text-accent-amber"
                            : "bg-bg-glass text-text-muted"
                        }`}
                      >
                        Qty {item.quantity || 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-text-primary leading-tight mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-text-muted capitalize mb-3">
                      {item.category.replace(/_/g, " ")}
                      {item.sub_category ? ` • ${item.sub_category}` : ""}
                    </p>

                    {item.description ? (
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-4">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-sm text-text-muted italic mb-4">
                        No description added yet.
                      </p>
                    )}

                    {specEntries.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {visibleSpecs.map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-secondary border border-border-default text-[11px] text-text-secondary"
                          >
                            <span className="text-text-muted">{key}:</span>
                            <span className="font-semibold text-text-primary">
                              {value}
                            </span>
                          </span>
                        ))}
                        {specEntries.length > 6 && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-bg-secondary border border-border-default text-[11px] text-text-muted">
                            +{specEntries.length - 6} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4 text-xs text-text-muted bg-bg-secondary/60 border border-dashed border-border-default rounded-xl px-3 py-2.5">
                        No technical specifications provided yet.
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-border-default/50 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            item.owner_type === "enterprise"
                              ? "bg-accent-indigo text-white"
                              : "bg-accent-emerald text-white"
                          }`}
                        >
                          {getOwnerDisplayName(item).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm text-text-secondary truncate">
                            {getOwnerDisplayName(item)}
                          </span>
                          {item.owner_type === "enterprise" && (
                            <span className="block text-[11px] text-accent-indigo truncate">
                              Enterprise listing
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedHardware(item);
                          setIsRequestModalOpen(true);
                        }}
                        className="text-sm px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-accent-indigo/10 text-accent-indigo transition-colors font-medium shrink-0"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredResources.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted">
                  No hardware items found matching the selected filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: MY HARDWARE --- */}
        {activeTab === "my_hardware" && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setMyInventoryTab("community")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${myInventoryTab === "community" ? "bg-accent-emerald/10 text-accent-emerald" : "bg-bg-secondary text-text-muted hover:text-text-primary"}`}
                >
                  Personal / Community
                </button>
                {isEnterpriseApproved && (
                  <button
                    onClick={() => setMyInventoryTab("enterprise")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${myInventoryTab === "enterprise" ? "bg-accent-indigo/10 text-accent-indigo" : "bg-bg-secondary text-text-muted hover:text-text-primary"}`}
                  >
                    Enterprise Items
                  </button>
                )}
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingHardware(null);
                  setIsFormOpen(true);
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Hardware
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHardware
                .filter(
                  (h: HardwareItem) =>
                    (h.owner_type || "community") === myInventoryTab,
                )
                .map((item: HardwareItem) => {
                  const specEntries = getSortedSpecEntries(item.specs);
                  const visibleSpecs = specEntries.slice(0, 6);

                  return (
                    <Card
                      key={item._id}
                      className="hover:shadow-glow-sm transition-all group border border-border-default/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-2 text-xs text-text-muted flex-wrap">
                            <span className="bg-bg-secondary px-2 py-0.5 rounded capitalize">
                              {item.category}
                            </span>
                            {item.brand && (
                              <span className="bg-bg-secondary px-2 py-0.5 rounded">
                                {item.brand}
                              </span>
                            )}
                            {item.condition && (
                              <span className="bg-bg-secondary px-2 py-0.5 rounded capitalize">
                                {item.condition}
                              </span>
                            )}
                            <span className="bg-bg-secondary px-2 py-0.5 rounded">
                              Qty: {item.quantity || 1}
                            </span>
                          </div>
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              item.availability_status === "available"
                                ? "bg-accent-emerald"
                                : item.availability_status === "in-use"
                                  ? "bg-accent-amber"
                                  : "bg-accent-rose"
                            }`}
                          />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent-emerald hover:bg-bg-glass transition-all"
                            title="Edit hardware"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent-indigo hover:bg-bg-glass transition-all"
                            title="Toggle availability"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-all"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-text-primary mb-1.5">
                        {item.name}
                      </h3>
                      <p className="text-sm text-text-muted mb-3 capitalize">
                        {item.category.replace(/_/g, " ")}
                        {item.sub_category ? ` • ${item.sub_category}` : ""}
                      </p>

                      {item.description ? (
                        <p className="text-sm text-text-secondary mb-3 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-sm text-text-muted italic mb-3">
                          No description added yet.
                        </p>
                      )}

                      {specEntries.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {visibleSpecs.map(([key, val]) => (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-secondary border border-border-default text-[11px] text-text-secondary"
                            >
                              <span className="text-text-muted">{key}:</span>
                              <span className="font-semibold text-text-primary">
                                {val}
                              </span>
                            </span>
                          ))}
                          {specEntries.length > 6 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-bg-secondary border border-border-default text-[11px] text-text-muted">
                              +{specEntries.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      {specEntries.length === 0 ? (
                        <div className="mb-3 text-xs text-text-muted bg-bg-secondary/60 border border-dashed border-border-default rounded-xl px-3 py-2.5">
                          Add technical specs to make this listing more useful.
                        </div>
                      ) : null}

                      <p className="text-xs text-text-muted mb-0">
                        {item.owner_type === "enterprise"
                          ? item.owner_id &&
                            typeof item.owner_id === "object" &&
                            item.owner_id.company_name
                            ? `Enterprise: ${item.owner_id.company_name}`
                            : "Enterprise listing"
                          : "Community listing"}
                      </p>
                    </Card>
                  );
                })}

              {myHardware.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border-default flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-secondary mb-2">
                    No hardware registered
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Share your first item with the community
                  </p>
                  <Button variant="primary" onClick={() => setIsFormOpen(true)}>
                    Add Hardware
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- ADD HARDWARE MODAL --- */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHardware(null);
        }}
        title={editingHardware ? "Edit Hardware" : "Register Hardware"}
        size="lg"
      >
        <RobuInspiredHardwareForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingHardware(null);
          }}
          isLoading={isLoading}
          initialValues={getFormInitialValues(editingHardware)}
          submitLabel={editingHardware ? "Save Changes" : "Submit Hardware"}
        />
      </Modal>

      {/* --- REQUEST PARTS MODAL --- */}
      <RequestPartsModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedHardware(null);
        }}
        selectedItem={selectedHardware}
        onSuccess={(request) => {
          navigate(`/chat?request_id=${request._id}`);
        }}
      />
    </div>
  );
};

export default RegistryPage;
