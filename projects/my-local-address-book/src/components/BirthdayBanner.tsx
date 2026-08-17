import { Contact } from "@/types/contact";
import { Cake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  contacts: Contact[];
}

export function BirthdayBanner({ contacts }: Props) {
  const today = new Date();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const birthdayContacts = contacts.filter((c) => {
    if (!c.birthday) return false;
    const parts = c.birthday.split("-");
    if (parts.length < 3) return false;
    return `${parts[1]}-${parts[2]}` === todayMD;
  });

  const getAge = (birthday: string) => {
    const year = parseInt(birthday.split("-")[0]);
    if (!year || year < 1900) return null;
    return today.getFullYear() - year;
  };

  if (birthdayContacts.length === 0) return null;

  return (
    <div className="rounded-lg bg-[hsl(var(--birthday)/0.12)] border border-[hsl(var(--birthday)/0.3)] p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Cake className="h-4 w-4 text-[hsl(var(--birthday))]" />
        <span className="font-semibold text-sm text-[hsl(var(--birthday-foreground))]">Today's Birthdays</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {birthdayContacts.map((c) => {
          const age = getAge(c.birthday);
          return (
            <div key={c.id} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={c.photoUrl} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{c.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">🎉 {c.name}</p>
                {age && <p className="text-xs text-muted-foreground">Turns {age} today!</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
