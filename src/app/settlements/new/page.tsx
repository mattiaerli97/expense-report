import SettlementForm from "@/components/SettlementForm";

export default function NewSettlementPage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Registra pagamento</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Registra un pagamento per saldare (parte del) debito.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <SettlementForm />
      </div>
    </div>
  );
}
