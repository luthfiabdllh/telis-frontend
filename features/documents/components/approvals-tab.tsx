import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/document-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, Send } from "lucide-react";

interface ApprovalsTabProps {
  documentId: string;
}

export function ApprovalsTab({ documentId }: ApprovalsTabProps) {
  const queryClient = useQueryClient();
  const [approverId, setApproverId] = useState("");
  const [notes, setNotes] = useState("");
  
  const { data: approvals, isLoading } = useQuery({
    queryKey: ["document-approvals", documentId],
    queryFn: () => documentApi.getDocumentApprovals(documentId),
  });

  const requestMutation = useMutation({
    mutationFn: () => documentApi.requestApproval(documentId, approverId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-approvals", documentId] });
      toast.success("Approval requested successfully");
      setApproverId("");
      setNotes("");
    },
    onError: (err: any) => {
      toast.error("Failed to request approval", { description: err.message });
    }
  });

  const reviewMutation = useMutation({
    mutationFn: ({ approvalId, status, reviewNotes }: { approvalId: string, status: string, reviewNotes: string }) => 
      documentApi.reviewApproval(documentId, approvalId, status, reviewNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-approvals", documentId] });
      toast.success("Approval reviewed successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to review approval", { description: err.message });
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Request Approval</CardTitle>
          <CardDescription>Minta persetujuan dokumen ke user lain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Approver ID</Label>
            <Input 
              placeholder="Masukkan ID User Approver (ex: user123)" 
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Catatan</Label>
            <Input 
              placeholder="Tambahkan catatan untuk approver..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={() => requestMutation.mutate()}
            disabled={requestMutation.isPending || !approverId}
          >
            {requestMutation.isPending ? <Spinner className="mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Kirim Request
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold px-1">Riwayat Persetujuan</h3>
        {approvals && approvals.length > 0 ? (
          <div className="space-y-3">
            {approvals.map(approval => (
              <Card key={approval.id} className="overflow-hidden">
                <div className={`h-1 w-full ${
                  approval.status === 'APPROVED' ? 'bg-emerald-500' : 
                  approval.status === 'REJECTED' ? 'bg-red-500' : 
                  'bg-amber-500'
                }`} />
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {approval.status === 'PENDING' ? 'Menunggu Review' : 'Telah Direview'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Approver: {approval.approver_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {approval.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {approval.status === 'REJECTED' && <XCircle className="w-4 h-4 text-red-500" />}
                      {approval.status === 'PENDING' && <Clock className="w-4 h-4 text-amber-500" />}
                      <span className={`text-xs font-semibold ${
                        approval.status === 'APPROVED' ? 'text-emerald-500' : 
                        approval.status === 'REJECTED' ? 'text-red-500' : 
                        'text-amber-500'
                      }`}>
                        {approval.status}
                      </span>
                    </div>
                  </div>
                  
                  {approval.notes && (
                    <div className="bg-muted/50 p-2 text-xs rounded border">
                      <span className="font-semibold mr-1">Catatan:</span> {approval.notes}
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground mt-1">
                    Requested {formatDistanceToNow(parseISO(approval.created_at), { addSuffix: true, locale: id })}
                  </div>

                  {approval.status === 'PENDING' && (
                    <div className="flex gap-2 mt-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => {
                          const revNotes = prompt("Catatan persetujuan (opsional):");
                          if (revNotes !== null) {
                            reviewMutation.mutate({ approvalId: approval.id, status: 'APPROVED', reviewNotes: revNotes });
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          const revNotes = prompt("Alasan penolakan (wajib):");
                          if (revNotes) {
                            reviewMutation.mutate({ approvalId: approval.id, status: 'REJECTED', reviewNotes: revNotes });
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground text-sm">
            Belum ada riwayat persetujuan.
          </div>
        )}
      </div>
    </div>
  );
}
