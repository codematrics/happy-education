import { redirect } from "next/navigation";

// Redirect old revenue page to transactions page
const RevenuePage = () => {
  redirect('/admin/transactions');
};

export default RevenuePage;