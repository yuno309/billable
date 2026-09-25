import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { useStore } from "@/lib/store";

const ClientForm = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const isEditing = Boolean(clientId);
  const navigate = useNavigate();
  const { clients, addClient, updateClient } = useStore();

  const existing = isEditing
    ? clients.find((c) => c.id === clientId)
    : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [contactName, setContactName] = useState(existing?.contactName ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Client email is required");
      return;
    }

    const payload = {
      name: name.trim(),
      contactName: contactName.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (isEditing && existing) {
      updateClient(existing.id, payload);
      toast.success(`${payload.name} updated`);
      navigate(`/clients/${existing.id}`);
    } else {
      const client = addClient(payload);
      toast.success(`${client.name} added to your roster`);
      navigate("/clients");
    }
  };

  return (
    <>
      <PageHeader
        title={isEditing ? "Edit client" : "Add client"}
        description={
          isEditing
            ? "Update contact details and billing notes."
            : "Capture the details you'll need on every invoice."
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <Card className="mt-6 max-w-2xl border-border/70 p-6 shadow-none sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Studio"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact person</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Jordan Pierce"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="billing@acme.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(555) 555-0142"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Billing address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Street, city, state and postal code"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Payment terms, preferences, contract references…"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Save className="size-4" />
              {isEditing ? "Save changes" : "Add client"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};

export default ClientForm;
