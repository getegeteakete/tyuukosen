// /auth/signup は /auth/login と同じMagic Linkフロー
import { redirect } from 'next/navigation';

export default function SignupPage() {
  redirect('/auth/login');
}
