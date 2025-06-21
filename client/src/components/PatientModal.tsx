import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPatientSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";
import type { Patient } from "@shared/schema";

type PatientFormData = z.infer<typeof insertPatientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

export function PatientModal({ isOpen, onClose, patient }: PatientModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      phone: patient?.phone || "",
      email: patient?.email || "",
    },
  });

  const patientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      if (patient) {
        return apiRequest("PUT", `/api/patients/${patient.id}`, data);
      } else {
        return apiRequest("POST", "/api/patients", data);
      }
    },
    onSuccess: () => {
      toast({
        title: patient ? "Pacient actualizat" : "Pacient creat",
        description: patient 
          ? "Pacientul a fost actualizat cu succes." 
          : "Pacientul a fost creat cu succes.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva pacientul.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: PatientFormData) => {
    patientMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? "Editează pacientul" : "Pacient nou"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prenume *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon *</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      value={field.value || ""} 
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Anulează
              </Button>
              <Button 
                type="submit" 
                disabled={patientMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {patientMutation.isPending 
                  ? "Se salvează..." 
                  : (patient ? "Actualizează" : "Salvează pacientul")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
