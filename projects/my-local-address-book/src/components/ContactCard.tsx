import { Contact } from "@/types/contact";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Pencil, Trash2 } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function tagColor(tag: string) {
  switch (tag.toLowerCase()) {
    case "family": return "bg-[hsl(var(--tag-family))] text-white";
    case "work": return "bg-[hsl(var(--tag-work))] text-white";
    case "friends": return "bg-[hsl(var(--tag-friends))] text-white";
    default: return "bg-[hsl(var(--tag-default))] text-white";
  }
}

interface Props {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactCard({ contact, onEdit, onDelete }: Props) {
  return (
    <Card className="animate-fade-in p-4 transition-all hover:shadow-md hover:-translate-y-0.5 group">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={contact.photoUrl} alt={contact.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground truncate">{contact.name}</h3>
            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(contact)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(contact)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Phone className="h-3 w-3" /> {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors truncate">
                <Mail className="h-3 w-3" /> {contact.email}
              </a>
            )}
          </div>
          {contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className={`text-[10px] px-1.5 py-0 ${tagColor(tag)}`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
