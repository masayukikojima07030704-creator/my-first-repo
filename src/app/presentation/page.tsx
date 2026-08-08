import { redirect } from "next/navigation";

/** Legacy path — lecture-style deck lives at /deck/ */
export default function PresentationPage() {
  redirect("/deck/");
}
