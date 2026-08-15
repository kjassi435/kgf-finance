import { getCurrentUser } from "@/lib/session";
import { decryptSensitive, maskAadhaar } from "@/lib/crypto";
import { Card, PageHeader, Badge } from "@/components/ui";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import MobileUpdateRequest from "@/components/MobileUpdateRequest";

export default async function CustomerProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const c = user.record;
  const aadhaar = decryptSensitive(c.aadhaarEnc);
  return (
    <div>
      <PageHeader title="My Profile" subtitle={`Customer ID: ${c.customerId}`} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Personal Details</h3>
          <div className="space-y-2 text-sm">
            <Row label="Name" value={c.name} />
            <Row label="Father/Husband" value={c.fatherHusbandName || "-"} />
            <Row label="DOB" value={c.dob || "-"} />
            <Row label="Gender" value={c.gender || "-"} />
            <Row label="Aadhaar" value={aadhaar ? maskAadhaar(aadhaar) : "-"} />
            <Row label="Mobile" value={c.mobile || "-"} />
            <Row label="Alternate Mobile" value={c.alternateMobile || "-"} />
            <Row label="Address" value={[c.village, c.post, c.tehsil, c.district, c.state, c.pin].filter(Boolean).join(", ") || "-"} />
            <Row label="Account Status" value={<Badge tone={c.accountStatus === "active" ? "green" : "red"}>{c.accountStatus}</Badge>} />
          </div>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Request Mobile Update</h4>
            <MobileUpdateRequest current={c.mobile || undefined} />
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Change Password</h3>
          <ChangePasswordForm />
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
