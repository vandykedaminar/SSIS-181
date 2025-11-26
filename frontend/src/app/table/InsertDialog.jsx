"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle, // Import this!
} from "../../components/ui/dialog";
import Button from "../../components/ui/Button";
import InsertForm from "./InsertForm";
import { Plus } from "lucide-react";

export default function InsertDialog({ 
  label = "Add Item", 
  formName,
  fields, 
  functions 
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="
            bg-gradient-to-r from-emerald-600 to-teal-600 
            hover:from-emerald-500 hover:to-teal-500 
            text-white font-semibold 
            shadow-lg hover:shadow-xl hover:shadow-emerald-900/20
            transition-all duration-300 transform hover:-translate-y-0.5
            border border-emerald-500/30
            gap-2 px-5
          "
        >
          <Plus size={18} strokeWidth={2.5} />
          {label}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[90%] sm:max-w-[380px] p-0 border-0 bg-transparent shadow-none">
        {/* ADD THIS TITLE TO FIX THE ERROR */}
        <DialogTitle className="sr-only">{formName}</DialogTitle>
        
        <InsertForm 
            insert_form_name={formName}
            fields={fields} 
            functions={functions}
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}