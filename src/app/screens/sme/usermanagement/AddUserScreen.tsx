import { useState } from "react";
import { ArrowLeft, User, Mail, Phone, DollarSign, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { ROLES, type RoleType, formatBDT } from "../../../data/userManagement";

interface AddUserScreenProps {
  onBack: () => void;
  onSubmit: (userData: NewUserData) => void;
}

export interface NewUserData {
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  dailyLimit: number;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function AddUserScreen({ onBack, onSubmit }: AddUserScreenProps) {
  const [formData, setFormData] = useState<NewUserData>({
    name: "",
    email: "",
    phone: "",
    role: "viewer",
    dailyLimit: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewUserData, string>>>({});

  // Validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewUserData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Invalid BD phone number";
    }

    if (formData.dailyLimit < 0) {
      newErrors.dailyLimit = "Limit cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const needsLimit = formData.role === "maker" || formData.role === "approver";

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Add New User</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            User Provisioning
          </p>
        </div>
      </header>

      {/* Main Glass Card */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto">
        {/* Section Icon */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <User size={20} className="text-cyan-400" />
          </div>
          <h2 className="font-serif text-white">User Details</h2>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-4 rounded-[20px] bg-amber-500/10 border border-amber-500/20 flex gap-3">
          <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-white/90 font-semibold mb-1">Requires Approval</p>
            <p className="text-xs text-white/60">
              Adding a new user requires Approver authorization. The user will be in "Pending" status until approved.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Full Name */}
          <Field label="Full Name *" error={errors.name}>
            <input
              type="text"
              placeholder="e.g., Rahim Ahmed"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="dd-input"
            />
          </Field>

          {/* Email */}
          <Field label="Email Address *" error={errors.email}>
            <input
              type="email"
              placeholder="e.g., rahim@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="dd-input"
            />
          </Field>

          {/* Phone */}
          <Field label="Mobile Number *" error={errors.phone}>
            <input
              type="tel"
              placeholder="e.g., 01711234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="dd-input"
            />
          </Field>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
              Assign Role *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map((role) => (
                <RoleOption
                  key={role.id}
                  role={role}
                  selected={formData.role === role.id}
                  onSelect={() => setFormData({ ...formData, role: role.id })}
                />
              ))}
            </div>
          </div>

          {/* Daily Limit (conditional) */}
          {needsLimit && (
            <Field label="Daily Transaction Limit" error={errors.dailyLimit}>
              <input
                type="number"
                placeholder="e.g., 500000"
                value={formData.dailyLimit || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dailyLimit: Number(e.target.value) })
                }
                className="dd-input"
              />
              {formData.dailyLimit > 0 && (
                <p className="text-[10px] text-white/40 mt-2 ml-1">
                  Approx. {formatBDT(formData.dailyLimit)}
                </p>
              )}
            </Field>
          )}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/10" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-semibold hover:bg-white/10 transition-all"
          >
            Cancel
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="flex-1 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-all shadow-lg shadow-cyan-900/30"
          >
            Add User
          </motion.button>
        </div>
      </div>

      <style>{`
        .dd-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          outline: none;
          transition: all 0.2s;
          appearance: none;
        }
        .dd-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .dd-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        select.dd-input {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
}

/* -------- Sub-Components -------- */

interface FieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

function Field({ label, children, error }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-red-400 mt-1 ml-1 flex items-center gap-1">
          <AlertCircle size={10} />
          {error}
        </p>
      )}
    </div>
  );
}

function RoleOption({
  role,
  selected,
  onSelect,
}: {
  role: (typeof ROLES)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full p-4 rounded-[20px] border text-left transition-all
        ${
          selected
            ? "border-cyan-500/40 bg-cyan-500/10"
            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{role.icon}</span>
          <h4 className="text-sm text-white/90 font-medium">{role.name}</h4>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected ? "border-cyan-400" : "border-white/20"
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
        </div>
      </div>
      <p className="text-[10px] text-white/40">{role.description}</p>
    </button>
  );
}
