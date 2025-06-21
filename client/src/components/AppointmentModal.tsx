import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertAppointmentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { z } from "zod";
import type { Appointment } from "@shared/schema";

type AppointmentFormData = z.infer<typeof insertAppointmentSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  selectedDate?: Date | null;
}

export function AppointmentModal({ isOpen, onClose, appointment, selectedDate }: AppointmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getDefaultDate = () => {
    if (appointment?.appointmentDate) {
      return new Date(appointment.appointmentDate);
    }
    if (selectedDate) {
      const date = new Date(selectedDate);
      date.setHours(9, 0, 0, 0);
      return date;
    }
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    return now;
  };

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      firstName: appointment?.firstName || "",
      lastName: appointment?.lastName || "",
      phone: appointment?.phone || "",
      email: appointment?.email || "",
      appointmentDate: getDefaultDate(),
      purpose: appointment?.purpose || "",
      notes: appointment?.notes || "",
    },
  });

  // Update form when selectedDate changes
  useEffect(() => {
    if (selectedDate && !appointment) {
      const date = new Date(selectedDate);
      date.setHours(9, 0, 0, 0);
      form.setValue('appointmentDate', date);
    }
  }, [selectedDate, appointment, form]);

  const appointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      if (appointment) {
        return apiRequest("PUT", `/api/appointments/${appointment.id}`, data);
      } else {
        return apiRequest("POST", "/api/appointments", data);
      }
    },
    onSuccess: () => {
      toast({
        title: appointment ? "Programare actualizată" : "Programare creată",
        description: appointment 
          ? "Programarea a fost actualizată cu succes." 
          : "Programarea a fost creată cu succes.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      // Invalidate all month queries to update calendar highlighting immediately
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/appointments/month');
        }
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva programarea.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: AppointmentFormData) => {
    appointmentMutation.mutate(data);
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const purposes = [
    "carie", "detartaj", "tratament-canal", "albire", 
    "extractie", "control", "urgenta"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editează programarea" : "Programare nouă"}
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
                    <Input type="email" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date && !isNaN(field.value.getTime()) 
                          ? field.value.toISOString().split('T')[0] 
                          : new Date().toISOString().split('T')[0]
                        }
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          if (!isNaN(date.getTime())) {
                            // Check if it's weekend
                            const dayOfWeek = date.getDay();
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                            
                            if (isWeekend) {
                              toast({
                                title: "Data invalidă",
                                description: "Nu se pot programa consultații în weekend (sâmbătă și duminică).",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            // Preserve existing time if available
                            const currentTime = field.value instanceof Date && !isNaN(field.value.getTime()) 
                              ? field.value 
                              : new Date();
                            date.setHours(currentTime.getHours(), currentTime.getMinutes());
                            field.onChange(date);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora *</FormLabel>
                    <Select
                      value={field.value instanceof Date && !isNaN(field.value.getTime()) 
                        ? field.value.toTimeString().slice(0, 5) 
                        : '09:00'
                      }
                      onValueChange={(time) => {
                        const date = field.value instanceof Date && !isNaN(field.value.getTime()) 
                          ? new Date(field.value) 
                          : new Date();
                        const [hours, minutes] = time.split(':');
                        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                        field.onChange(date);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează ora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scopul programării *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează motivul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {purposes.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose.charAt(0).toUpperCase() + purpose.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observații</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Detalii suplimentare..." {...field} value={field.value || ""} />
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
                disabled={appointmentMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {appointmentMutation.isPending 
                  ? "Se salvează..." 
                  : (appointment ? "Actualizează" : "Salvează programarea")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
