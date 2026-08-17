import { Recipe } from "@/lib/types";
import { RecipeForm } from "@/components/RecipeForm";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  onAdd: (data: Omit<Recipe, "id" | "createdAt">) => void;
}

export default function AddRecipePage({ onAdd }: Props) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="p-6 text-center text-muted-foreground">
      <RecipeForm
        open={open}
        onClose={handleClose}
        initial={null}
        onSave={(data) => {
          onAdd(data);
          toast.success("Recipe added!");
          navigate("/");
        }}
      />
      <p>Adding a new recipe...</p>
    </div>
  );
}
