import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QRPage() {
  const providerId = getProviderId();
  const baseUrl = window.location.origin;
  const enrollUrl = `${baseUrl.replace(/\/admin-web.*|\/super.*|\/provider.*/, '')}/enroll?code=${providerId?.slice(0, 8) ?? ''}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Client Enrollment – QR / Link</h1>
      <p className="text-muted-foreground">Share this link or show as QR for clients to enroll:</p>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Enrollment URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <code className="block break-all text-sm bg-muted p-3 rounded-md">{enrollUrl}</code>
          <p className="text-sm text-muted-foreground">
            Backend public enroll: <code className="bg-muted px-1 rounded">POST {import.meta.env.VITE_API_URL || 'http://localhost:3000'}/public/enroll</code> with body: code, name, phone, optional plateNumber, model, color.
          </p>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">For a QR image, use any QR generator with the URL above.</p>
    </div>
  );
}
