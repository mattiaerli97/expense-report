import ExpenseForm from "@/components/ExpenseForm";

export default function NewExpensePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nuova spesa</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          La spesa verrà divisa a metà tra Mattia e Nicole.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <ExpenseForm />
      </div>
    </div>
  );
}
