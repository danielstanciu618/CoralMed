import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertMedicalRecordSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import type { MedicalRecord } from "@shared/schema";

type MedicalRecordFormData = z.infer<typeof insertMedicalRecordSchema>;

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  record?: MedicalRecord | null;
}

export function MedicalRecordModal({ isOpen, onClose, patientId, record }: MedicalRecordModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(record?.files || []);

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(insertMedicalRecordSchema),
    defaultValues: {
      patientId: patientId,
      condition: record?.condition || "",
      treatment: record?.treatment || "",
      notes: record?.notes || "",
      visitDate: record?.visitDate ? new Date(record.visitDate) : new Date(),
      files: record?.files || [],
    },
  });

  const recordMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormData) => {
      const payload = {
        ...data,
        files: uploadedFiles,
      };
      
      if (record) {
        return apiRequest("PUT", `/api/medical-records/${record.id}`, payload);
      } else {
        return apiRequest("POST", "/api/medical-records", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: record ? "Dosar actualizat" : "Dosar creat",
        description: record 
          ? "Dosarul medical a fost actualizat cu succes." 
          : "Dosarul medical a fost creat cu succes.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/records`] });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva dosarul medical.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setUploadedFiles([]);
    onClose();
  };

  const onSubmit = (data: MedicalRecordFormData) => {
    recordMutation.mutate(data);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        const uploadedFileNames = result.files.map((file: any) => file.filename);
        setUploadedFiles(prev => [...prev, ...uploadedFileNames]);
        
        toast({
          title: "Fișiere încărcate",
          description: `${result.files.length} fișier(e) au fost uploadate cu succes.`,
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Eroare upload",
          description: "Nu s-au putut încărca fișierele. Încercați din nou.",
          variant: "destructive",
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const conditions = [
    "carie", "detartaj", "tratament-canal", "albire", 
    "extractie", "implanturi", "ortodontie", "gingivita", "parodontoza"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? "Editează dosarul medical" : "Dosar medical nou"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Afecțiunea *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează afecțiunea" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition.charAt(0).toUpperCase() + condition.slice(1).replace('-', ' ')}
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
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratament *</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3} 
                      placeholder="Descrierea tratamentului aplicat..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visitDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data vizitei *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
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
                    <Textarea 
                      rows={3} 
                      placeholder="Observații suplimentare..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Radiografii și documente
              </label>
              
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Încarcă fișiere
                </label>
                <span className="text-sm text-gray-500">
                  Imagini, PDF, DOC
                </span>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate">{file}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Anulează
              </Button>
              <Button 
                type="submit" 
                disabled={recordMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {recordMutation.isPending 
                  ? "Se salvează..." 
                  : (record ? "Actualizează" : "Salvează dosarul")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}