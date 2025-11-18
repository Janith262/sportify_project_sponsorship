import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Heart } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

// The API URL pointing to your Spring Boot backend
const API_URL = 'http://localhost:8080/api/sponsors';

// Zod schema for form validation
const schema = z.object({
  companyName: z.string().min(1, "Required"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  countryCode: z.string().min(1),
  contactNumber: z.string().regex(/^\d+$/, "Digits only").min(6, "Too short"),
  interest: z.string().optional(),
  level: z.enum(["Platinum", "Gold", "Silver", "Other"], { required_error: "Select a level" }),
  otherAmount: z.string().optional(),
  letterFilename: z.string().optional(),
  comments: z.string().optional(),
  website: z.string().optional(),
}).refine((data) => data.level !== "Other" || !!data.otherAmount, {
  message: "Please enter amount for Other",
  path: ["otherAmount"],
});

type FormData = z.infer<typeof schema>;

const LEVEL_AMOUNTS: Record<string, number> = {
  Platinum: 100000,
  Gold: 75000,
  Silver: 50000,
};

export default function SponsorshipPackages() {
  const [open, setOpen] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { countryCode: "+94" },
  });

  // This hook handles sending the form data to the backend API
  const queryClient = useQueryClient();
  const createSponsorMutation = useMutation({
    mutationFn: (newSponsorData: any) => {
      return axios.post(API_URL, newSponsorData);
    },
    onSuccess: () => {
      // After a success, this tells other parts of the app to refetch the sponsor list
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });

  const isOther = form.watch("level") === "Other";
  const isValid = form.formState.isValid;

  const amount = useMemo(() => {
    if (isOther) return Number(form.getValues("otherAmount") || 0);
    const lvl = form.getValues("level");
    return lvl ? LEVEL_AMOUNTS[lvl] : 0;
  }, [isOther, form.watch("otherAmount"), form.watch("level")]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      form.setValue("letterFilename", file.name, { shouldValidate: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) form.setValue("letterFilename", file.name, { shouldValidate: true });
  };

  const resetForm = () => {
    form.reset({ countryCode: "+94" });
    setOpen(false);
  };
  
  // This is the main function that runs when the form is submitted
  const onSubmit = (formData: FormData) => {
    console.log("Submit button clicked!");

    // 1. Format the data to match the backend's expected structure
    const requestData = {
      companyName: formData.companyName,
      website: formData.website,
      contactPersonFirstName: formData.firstName,
      contactPersonLastName: formData.lastName,
      email: formData.email,
      contactNumber: `${formData.countryCode} ${formData.contactNumber}`,
      sponsorshipLevel: formData.level,
      otherAmount: formData.otherAmount,
      companyLetterFilename: formData.letterFilename || null,
      interestReason: formData.interest,
      additionalComments: formData.comments,
    };

    // 2. Call the mutation to send the data via API
    createSponsorMutation.mutate(requestData, {
      onSuccess: (response) => {
        console.log("Backend responded with success:", response.data);
        const at = new Date();
        setSubmittedAt(at);
        setSubmittedData(formData);
        setOpen(true); // Open the success modal
      },
      onError: (error) => {
        console.error("API call failed:", error);
        alert("Submission failed. Please check the browser console for errors.");
      },
    });
  };

  return (
    <AppLayout>
      <SEO
        title="Sponsorship Packages | Sportify"
        description="Apply for Sportify sponsorship: Platinum, Gold, Silver or custom tiers. Submit your company details and get in touch."
        canonical={`${window.location.origin}/sponsorship/packages`}
      />
      <h1 className="text-center text-2xl md:text-3xl font-bold mb-6">SPONSORSHIP FORM</h1>

      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" {...form.register("companyName")} />
                {form.formState.errors.companyName && <p className="text-xs text-destructive mt-1">{form.formState.errors.companyName.message}</p>}
              </div>
              <div>
                <Label htmlFor="website">Website (optional)</Label>
                <Input id="website" placeholder="https://" {...form.register("website")} />
              </div>
            </div>

            {/* Contact Person */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Contact Person – First *</Label>
                <Input id="firstName" {...form.register("firstName")} />
                {form.formState.errors.firstName && <p className="text-xs text-destructive mt-1">{form.formState.errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Contact Person – Last *</Label>
                <Input id="lastName" {...form.register("lastName")} />
                {form.formState.errors.lastName && <p className="text-xs text-destructive mt-1">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label>Contact Number *</Label>
                <div className="flex gap-2">
                  <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...form.register("countryCode")}>
                    <option value="+94">+94 (LK)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+44">+44 (UK)</option>
                  </select>
                  <Input inputMode="numeric" placeholder="712345678" {...form.register("contactNumber")} />
                </div>
                {form.formState.errors.contactNumber && <p className="text-xs text-destructive mt-1">{form.formState.errors.contactNumber.message}</p>}
              </div>
            </div>

            {/* Interest */}
            <div>
              <Label htmlFor="interest">Why are you interested in Sponsoring?</Label>
              <Textarea id="interest" rows={4} {...form.register("interest")} />
            </div>

            {/* Sponsorship Level */}
            <div>
              <Label>Sponsorship Level *</Label>
              <RadioGroup
                className="grid md:grid-cols-4 gap-3 mt-2"
                value={form.watch("level")}
                onValueChange={(v) => form.setValue("level", v as any, { shouldValidate: true })}
              >
                {Object.entries(LEVEL_AMOUNTS).map(([level, price]) => (
                  <label key={level} className="rounded-lg border bg-card p-4 flex items-center gap-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value={level} id={level} />
                    <div>
                      <div className="font-medium">{level}</div>
                      <div className="text-sm text-muted-foreground">Rs. {price.toLocaleString("en-LK")}</div>
                    </div>
                  </label>
                ))}
                <label className="rounded-lg border bg-card p-4 flex items-center gap-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="Other" id="other" />
                  <div>
                    <div className="font-medium">Other</div>
                    <div className="text-sm text-muted-foreground">Custom amount</div>
                  </div>
                </label>
              </RadioGroup>
              {isOther && (
                <div className="mt-3 max-w-xs">
                  <Label htmlFor="otherAmount">If “Other”, amount (LKR)</Label>
                  <Input id="otherAmount" inputMode="numeric" placeholder="e.g., 60000" {...form.register("otherAmount")} />
                  {form.formState.errors.otherAmount && <p className="text-xs text-destructive mt-1">{form.formState.errors.otherAmount.message}</p>}
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <Label>Company Letter (PDF/JPG/PNG)</Label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`mt-2 rounded-lg border border-dashed p-6 text-center transition-colors ${dragOver ? "bg-accent" : ""}`}
              >
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id="letterFile" />
                <label htmlFor="letterFile" className="cursor-pointer text-primary">Drag & drop file here or click to browse</label>
                {form.watch("letterFilename") && <p className="text-sm text-muted-foreground mt-2">Selected: {form.watch("letterFilename")}</p>}
              </div>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Additional Comments or Requests</Label>
              <Textarea id="comments" rows={4} {...form.register("comments")} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={resetForm}>Clear form</Button>
              <Button type="submit" disabled={!isValid}>Submit</Button>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Success Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="p-6 text-center text-primary-foreground" style={{ background: "var(--gradient-success)" }}>
            <div className="mx-auto h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="text-white" />
            </div>
            <h2 className="mt-3 text-xl font-semibold">Thank You! Your sponsorship application has been submitted successfully.</h2>
          </div>
          <div className="p-6">
            {submittedData && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><span className="font-medium">Company:</span> {submittedData.companyName}</div>
                  <div><span className="font-medium">Contact Person:</span> {submittedData.firstName} {submittedData.lastName}</div>
                  <div><span className="font-medium">Email:</span> {submittedData.email}</div>
                  <div><span className="font-medium">Phone:</span> {submittedData.countryCode} {submittedData.contactNumber}</div>
                  <div><span className="font-medium">Sponsorship Level + amount:</span> {submittedData.level} — Rs. {amount.toLocaleString("en-LK")}</div>
                  <div><span className="font-medium">Submitted:</span> {submittedAt ? format(submittedAt, "dd/MM/yyyy, HH:mm:ss") : ""}</div>
                </CardContent>
              </Card>
            )}
            <p className="text-sm text-muted-foreground mt-4">We will review your application and contact you within 3–5 business days. For urgent inquiries, please contact us at sponsors@sportify.lk</p>
            <div className="mt-6 flex justify-end">
              <Button onClick={resetForm}>Submit Another Application</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}