import { PageHeader, Card, Badge } from "@/components/ui";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import BusinessSettingsForm from "@/components/BusinessSettingsForm";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
  const aadhaarSet = !!process.env.AADHAAR_ENCRYPTION_KEY;
  const jwtSet = !!process.env.JWT_SECRET;

  let appName = process.env.APP_NAME || "Kalyan Gold Fund";
  let currency = process.env.CURRENCY || "₹";
  try {
    const rows = await db.select().from(settings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    if (map.APP_NAME) appName = map.APP_NAME;
    if (map.CURRENCY) currency = map.CURRENCY;
  } catch {}

  return (
    <div>
      <PageHeader title="Settings" subtitle="Security & account configuration" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Security Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Role-Based Access Control</span>
              <Badge tone="green">enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>JWT Authentication</span>
              <Badge tone={jwtSet ? "green" : "red"}>{jwtSet ? "configured" : "missing"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Aadhaar Encryption (AES-256-GCM)</span>
              <Badge tone={aadhaarSet ? "green" : "red"}>
                {aadhaarSet ? "active" : "missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Audit Logging</span>
              <Badge tone="green">active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Automatic DB Backup</span>
              <Badge tone="amber">Turso managed</Badge>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Business Settings</h3>
          <BusinessSettingsForm appName={appName} currency={currency} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Change Your Password</h3>
          <ChangePasswordForm />
        </Card>
      </div>
    </div>
  );
}
