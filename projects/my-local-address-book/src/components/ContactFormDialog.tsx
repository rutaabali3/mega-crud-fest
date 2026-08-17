import { useState, useEffect } from "react";
import { Contact } from "@/types/contact";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, ImagePlus, X, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contact, "id">) => void;
  existingTags: string[];
  editContact?: Contact | null;
}

export function ContactFormDialog({ open, onClose, onSave, existingTags, editContact }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [photoUrl, setPhotoUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (open) {
      if (editContact) {
        setName(editContact.name);
        setPhone(editContact.phone);
        setEmail(editContact.email);
        setBirthday(editContact.birthday ? parse(editContact.birthday, "yyyy-MM-dd", new Date()) : undefined);
        setPhotoUrl(editContact.photoUrl);
        setTagsInput(editContact.tags.join(", "));
      } else {
        setName(""); setPhone(""); setEmail(""); setBirthday(undefined); setPhotoUrl(""); setTagsInput("");
      }
    }
  }, [open, editContact]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email format", variant: "destructive" });
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      birthday: birthday && isValid(birthday) ? format(birthday, "yyyy-MM-dd") : "",
      photoUrl: photoUrl.trim(),
      tags,
    });

    toast({ title: editContact ? "Contact updated" : "Contact added" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editContact ? "Edit Contact" : "New Contact"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Photo Preview */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20">
              {photoUrl ? <AvatarImage src={photoUrl} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {name ? name[0].toUpperCase() : <ImagePlus className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            {photoUrl && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-6 gap-1" onClick={() => setPhotoUrl("")}>
                <X className="h-3 w-3" /> Remove photo
              </Button>
            )}
          </div>

          {/* Photo Input — File or URL */}
          <div className="space-y-1.5">
            <Label>Photo</Label>
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="w-full h-8">
                <TabsTrigger value="file" className="text-xs flex-1 gap-1"><ImagePlus className="h-3 w-3" /> Upload</TabsTrigger>
                <TabsTrigger value="url" className="text-xs flex-1 gap-1"><Link className="h-3 w-3" /> URL</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="cursor-pointer text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10_000_000) {
                      toast({ title: "Image too large (max 10MB)", variant: "destructive" });
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setPhotoUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Max 10MB. Stored locally in your browser.</p>
              </TabsContent>
              <TabsContent value="url" className="mt-2">
                <Input value={photoUrl.startsWith("data:") ? "" : photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
              </TabsContent>
            </Tabs>
          </div>
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          {/* Phone */}
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
          {/* Email */}
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          {/* Birthday */}
          <div className="space-y-1.5">
            <Label>Birthday</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !birthday && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthday ? format(birthday, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthday}
                  onSelect={setBirthday}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="family, work, friends" />
            {existingTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {existingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => {
                      const current = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
                      if (!current.includes(tag)) {
                        setTagsInput(current.length ? `${tagsInput}, ${tag}` : tag);
                      }
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
